# Moteur graphique

Couche 4 de l'architecture (voir `ARCHITECTURE.md`) : tout ce qui dessine sur le GPU ou en ASCII, et la chorégraphie qui le pilote. Rien ici ne connaît la TVA en dehors des couleurs lues dans la palette et des textes passés en props.

```
components/graphics/
  scene-boundary.tsx      SceneBoundary : garde-fou (erreur React, shader qui ne compile pas, contexte perdu) → plaque de repli
  shader-canvas.tsx       ShaderCanvas : un fragment shader plein cadre sur son propre canvas, rendu à la demande
  temporal-scene.tsx      TemporalScene : la chambre temporelle (R3F) et sa chorégraphie Theatre.js
  field-plate.tsx         FieldPlate : le champ temporel en SVG, premier rendu sous chaque canvas et image sans WebGL
  colors.ts               couleurs sRGB → uniforms vec3 (depuis config/palette.ts)
  shaders/temporal-field.ts   GLSL : le champ (anneaux d'interférence, déplacement, rayons, cœur)
  shaders/artifact.ts         GLSL : l'artefact (sphère déplacée par du bruit 3D, fresnel, bandes)
  scenes/camera-rig.tsx       caméra : base Theatre + parallaxe pointeur + travelling au défilement
  scenes/temporal-artifact.tsx, orbitals.tsx, particles.tsx
  theatre/project.ts      liaison du projet Theatre (objets typés, valeurs vives, plages ENTRANCE / EVENT)
  theatre/studio.ts       Studio, développement seulement (`?studio=1`)
components/ascii/         AsciiScene, AsciiBanner, ArtBoundary, pieces/ (voir README › ascii.rest)
lib/graphics-quality.ts   presets de qualité, détection d'appareil, sonde WebGL, niveau d'effets
lib/webgl-health.ts       surveillance d'un renderer (shader en erreur, contexte perdu)
lib/signals.ts            les signaux partagés que les scènes lisent dans leur boucle de rendu
data/theatre/             état Theatre généré (chamber.json) et pose de repos
scripts/theatre-state.mjs générateur de l'état Theatre à partir d'une spec lisible
```

## Versions choisies et pourquoi

| Paquet | Version | Raison |
| --- | --- | --- |
| three | 0.186.1 | dernière stable ; WebGLRenderer classique, GLSL ES 1.0/3.0 |
| @react-three/fiber | 9.8.2 | la branche stable pour React 19 (`peer react >=19 <19.4`). La v10 est une alpha orientée WebGPU dont le chemin par défaut ne prend pas `ShaderMaterial` GLSL : écartée |
| @theatre/core | 0.7.2 (Apache-2.0) | lecture des séquences en production |
| @theatre/studio | 0.7.2 (AGPL-3.0-only) | éditeur de keyframes, dépendance de dev, jamais dans le bundle |
| @theatre/r3f | non installé | exige R3F 8 ; la liaison se fait à la main via `onValuesChange` (30 lignes) |
| @react-three/drei | non installé | aucun helper n'apportait plus que le code qu'il remplaçait |

## Rendu à la demande, pas de boucle libre

Chaque `Canvas` est en `frameloop="demand"`. Un `Ticker` demande une image à la cadence du preset (`fps`) tant que la scène est `active` : visible à l'écran (`useInView`, marge 15 à 25 %) et onglet visible (`usePageVisible`). Une scène hors champ ou dans un onglet caché ne coûte rien. Le défilement, le pointeur et les événements vivent dans `lib/signals.ts › frame` (objet mutable) et dans le store `scene` ; les boucles `useFrame` les lisent, React n'est jamais re-rendu par un mouvement de pointeur.

## Qualité et repli

`detectQuality(level, hints)` part d'un preset (`full` / `reduced`) puis rogne : écran < 768 px → 500 particules, dpr ≤ 1,5, 4 octaves ; `saveData`, ≤ 4 Go ou ≤ 4 cœurs → dpr ≤ 1,25, 30 fps, sans antialias ; mouvement réduit → `animate: false` (pose composée, 6 fps, pas de parallaxe). `resolveEffects()` lit `siteConfig.graphics.effects` : `auto` suit la préférence du lecteur, `full` / `reduced` forcent, `off` ne monte jamais de canvas.

Ordre des replis, du premier rendu au pire cas :

1. Le serveur imprime la plaque (SVG `FieldPlate` / `ChamberFallback`) et la légende HTML. Rien n'est vide avant l'hydratation.
2. Après hydratation, `supportsWebGL()` sonde un contexte (puis le libère). Sans WebGL : la plaque reste, la légende dit « Static plate · WebGL unavailable ».
3. Le canvas se monte au-dessus de la plaque quand le cadre entre dans le viewport.
4. `watchRenderer()` : un shader qui ne compile pas (`gl.debug.onShaderError`) ou un contexte perdu (`webglcontextlost`) remonte à `SceneBoundary`, qui démonte le canvas ; la plaque réapparaît et la légende dit pourquoi. Une erreur React dans la scène est attrapée de la même façon.

Toute information portée par un canvas est aussi imprimée en HTML à côté (légende de la chambre, phase du champ, relevé final).

## Les deux shaders

**Champ temporel** (`temporal-field.ts`) : un plan 2×2 en espace de clip, sans caméra. Coordonnées corrigées de l'aspect et attirées de 8 % vers le pointeur ; déformation de domaine par deux fbm (bruit de valeur, 5 octaves max, `uOctaves` casse la boucle) qui déplacent le rayon ; deux systèmes d'anneaux à fréquences voisines multipliés (battement) ; chute radiale (`uCollapse` ramène le champ sur son cœur) ; cinq rayons angulaires brisés par le bruit ; palette fond → vert profond → sauge selon la valeur, orange seulement aux pics (`uIntensity`, `uEvent`) ; frange chromatique par échantillons décalés en R et B ; vignette. Uniforms : `uTime, uResolution, uPointer, uScroll, uIntensity, uDistortion, uSpeed, uEvent, uCollapse, uOctaves` + cinq couleurs. Aucun paramètre ne recompile.

**Artefact** (`artifact.ts`) : sphère icosaédrique déplacée le long de ses normales par un fbm 3D animé (`uDistortion`), plus une ondulation rapide pendant la variance (`uPulse`). Fragment : demi-Lambert à direction fixe, fresnel vers un liseré sauge → orange (`uHue`, poussé par la branche nexus et par le pulse), bandes de latitude qui se courbent sur le relief. Les normales restent celles de la sphère : relief laqué plutôt que dur, et aucun calcul de dérivées.

Les couleurs sont passées en sRGB brut (`srgbVec3`), pas en linéaire : nos shaders écrivent `gl_FragColor` sans conversion, donc le GPU affiche exactement la palette CSS. `readPalette()` lit les `--tva-*` au montage : un thème qui n'édite que `tokens.css` change aussi les shaders.

## Theatre.js : qui possède quoi

Une feuille « Temporal chamber », quatre objets : `camera {x,y,z,fov}`, `artifact {scale,distortion,pulse,hue,spin}`, `orbitals {tilt,spread}`, `light {intensity}`. Deux plages : `ENTRANCE [0,4]` à l'ouverture de la chambre, `EVENT [4.5,8]` à chaque variance ; les deux commencent et finissent sur la pose de repos (`data/theatre/resting-pose.json`), donc elles s'enchaînent sans saut.

| Propriété | Propriétaire | Ajouts |
| --- | --- | --- |
| position et fov de la caméra | Theatre | parallaxe pointeur (±0,45 u, amortie) et travelling `frame.hero × 2,2` ajoutés dans `CameraRig` |
| échelle, distorsion, pulse, teinte, rotation de l'artefact | Theatre | la teinte est `max(theatre, chaleur de la branche)` |
| inclinaison et déploiement des orbitales | Theatre | l'anneau de la branche sélectionnée chauffe (damp 6) |
| lumière | Theatre | — |
| uniforms du champ (section 03) | boucle `drive` du composant | — |
| DOM du hero, pied de page, révélations | GSAP | — |
| menus, cartes, indicateurs de sélection, dialogue | Motion | — |

**Flux de travail** : éditer la spec de `scripts/theatre-state.mjs` puis `node scripts/theatre-state.mjs` (le test `tests/graphics.test.ts` vérifie que le JSON est à jour) ; ou lancer `npm run dev`, ouvrir `http://localhost:3000/?studio=1`, ajuster dans Studio (menu Outline : CHRONOS → Temporal chamber → camera, artifact, orbitals, light), exporter « CHRONOS » en JSON et le coller dans `data/theatre/chamber.json`. `StudioLoader` (monté dans le layout) crée les objets et ouvre Studio même si le navigateur ne dessine pas la scène WebGL ; avec `?studio=1`, la chambre anime aussi sous une préférence système de mouvement réduit, pour voir les keyframes bouger. Studio n'est importé que si `NODE_ENV === "development"` et que l'URL porte `studio` ; le bundle de production ne le contient pas (vérifié : aucun symbole du Studio dans `.next/static`).

## Réutiliser le moteur

- `ShaderCanvas` accepte n'importe quel fragment (`fragment`) : garder les varyings `vUv` du vertex fourni, déclarer ses uniforms, et piloter par `drive(uniforms, delta, elapsed)`.
- `TemporalScene` est spécifique à la chambre, mais ses pièces (`CameraRig`, `Orbitals`, `Particles`, `TemporalArtifact`) ne dépendent que de `ChamberValues` : une autre scène redéfinit la spec Theatre et garde le rig.
- `SceneBoundary` + `FieldPlate`/`ChamberFallback` : le motif « plaque en HTML, canvas par-dessus, repli caption » se copie tel quel.
- Palette : éditer `styles/tokens.css` (`--tva-*`) et `config/palette.ts` ensemble ; `tests/palette.test.ts` échoue si l'un oublie l'autre.
