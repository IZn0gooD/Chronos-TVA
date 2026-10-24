# Laboratoire multivers (`/multiverse`)

Un banc d'essai sur la même pile que le terminal : un multivers vivant et en expansion, modélisé comme un graphe de chronologies qui naissent, croissent, bifurquent, portent des impulsions, se tissent entre elles et sont élaguées. Route séparée, plein écran, sans l'habillage du site (groupe de routes `app/(lab)`).

## Les quatre systèmes

| Système | Où | Dépend de | Rôle |
| --- | --- | --- | --- |
| Simulation | `lib/multiverse/` (`simulation.ts`, `curves.ts`, `random.ts`) | rien (ni React ni three.js) | le graphe, le programme d'expansion, les événements ; tourne aussi dans Node (tests, plaque SVG serveur) |
| Géométrie | `components/multiverse/runtime.ts` | three.js | tampons partagés pour toute la capacité, texture d'état, particules de flux |
| Rendu | `components/multiverse/shaders.ts`, `engine.ts`, `scene.tsx` | R3F, GLSL, addons three | rubans de filaments, univers-poches, métier, ciel, poussière, bloom |
| Chorégraphie | `components/multiverse/theatre.ts`, `scripts/theatre-multiverse.mjs` | @theatre/core | caméra et intensités de la cinématique de 24 s |

`MultiverseGraph` du brief correspond à `MultiverseSimulation` ; `BranchGenerator` à `spawnBranch`/`tryWeave` et `curves.ts` ; `FilamentBuffer` et `ParticleField` à `MultiverseRuntime` et `FlowField` ; `LodSelector` au rang de densité et à la plage de dessin.

## Le modèle

Chaque chronologie (`Timeline`) porte : `id`, `parentId`, `depth`, `trunk` (l'ancêtre de première génération), `seed`, `branchAt` (point de départ sur le parent), `birthTime`, `growth` (durée de croissance), `length`, `energy`, `stability`, `rank` (pour la densité visible), `hue`, `children`, `weave` (pour un pont), `collapseAt`, deux emplacements d'impulsion, et ses 49 points et tangentes échantillonnés.

Types : `fabric` (18 fils du tissu temporel qui convergent vers le métier), `root` (la ligne sacrée), `branch`, `weave` (pont tressé entre deux troncs : une arête de type tissage, **pas** une fusion ; chaque chronologie garde sa lignée).

Courbe d'une branche : `C(t) = Bézier(P0, P0 + h0·D0, P1 − h1·D1, P1)(t) + sin(πt)·A·w(t)`. D0 est la direction héritée du parent (départ tangent), D1 la direction où la branche se stabilise (vers l'avant, un peu vers l'extérieur de l'axe sacré), w(t) un axe × sin(ωt + φ) ou une hélice pour les tissages. L'enveloppe sin(πt) est nulle aux deux bouts : la branche part exactement du point du parent (testé).

### Déterminisme

La simulation avance par pas fixes de 1/30 s simulée, tire tout son hasard d'un seul flux `mulberry32(seed)` et construit chaque courbe à partir de `hash32(seed, id)`. Son état est une fonction pure de (graine, capacité, temps simulé, commandes du lecteur) : indépendante de la cadence (testé à 144 images/s contre un seul saut), rejouable (`seek(t)` repart de l'origine), et les commandes du lecteur sont journalisées avec leur pas et rejouées à l'identique. Rejouer 24 s coûte environ 15 ms.

### Le programme (sur l'horloge de la cinématique)

| Temps | Mouvement | Simulation |
| --- | --- | --- |
| 0–4 s | Awakening | le métier, les fils du tissu, la ligne sacrée qui croît |
| 4–9 s | Divergence | 2,4 divergences/s depuis la ligne sacrée, branches de profondeur ≤ 2 |
| 9–15 s | Expansion | jusqu'à ~166 naissances/s, profondeur ≤ 7 |
| 15–20 s | Weave | 4 tissages/s entre troncs voisins, impulsions sur les deux rives |
| 20–24 s | Revelation | naissances décroissantes, premiers élagages d'instables |
| > 24 s | Ères sans fin | voir ci-dessous |

Mesuré (graine 1962, capacité 2048) : 19 chronologies à 4 s, ~90 à 9 s, ~840 à 15 s, ~1 190 à 24 s, 37 troncs et 17 tissages ; puis un régime stable autour de 1 750 vivantes avec ~700 élagages à 80 s.

### Après la cinématique : une évolution perpétuelle, jamais une boucle

À 24 s, rien ne se rejoue et rien ne se fige : le réseau traverse une suite **sans fin et sans période** d'ères. Chaque ère est tirée de (graine, numéro d'ère) seuls : son genre (jamais deux fois le même d'affilée ; la première fait toujours croître), sa durée (18 à 42 s), ses taux, et pour une dérive son vent.

| Ère | Ce qui se passe |
| --- | --- |
| Bloom | un tronc fleurit : ses fronts bifurquent encore et encore (40 à 70 naissances/s) |
| Drift | toutes les nouvelles branches penchent du même côté : la silhouette du réseau se déplace |
| Weave storm | des troncs éloignés se tendent l'un vers l'autre et se tressent (4 tissages/s) |
| Pruning | l'autorité coupe les deux plus vieux troncs avec toute leur descendance |
| Nexus | une nouvelle réalité jaillit de la ligne sacrée et s'étend (sur une ligne pleine, elle remplace la plus ancienne) |
| Calm | peu de naissances ; les impulsions parcourent tous les fils |

Les naissances se font surtout aux fronts récents (ce qui rend la croissance visible) et dans le tronc favorisé de l'ère ; près de la capacité, l'autorité élague assez pour faire de la place. Après la cinématique, la ligne sacrée porte au plus 36 troncs vivants : les nouveaux viennent quand les anciens meurent, et la forme d'ensemble se renouvelle.

Mesuré (graine 1962, capacité 2 048, 30 minutes simulées en 0,7 s de calcul) : 52 700 naissances, 51 000 élagages, 900 tissages, entre 1 650 et 1 870 chronologies vivantes à tout instant ; sur les 32 troncs présents à 60 s, 3 vivent encore à 30 min ; le centre du réseau se déplace d'ère en ère. Des tests verrouillent ces propriétés (séquence d'ères déterministe, sans répétition ni période sur 60 ères ; croissance continue et renouvellement des troncs sur 30 minutes, sous la capacité).

**Pilote automatique de la caméra.** En exploration, tant que le lecteur ne touche à rien, la caméra va d'un sujet à l'autre : un tissage, un grand élagage, un nouveau tronc, une branche qui pousse (qu'elle suit), et tous les quatre plans une vue d'ensemble qui montre où en est la forme. Glissements amortis (jamais de coupe), lente orbite autour du sujet, jamais deux sujets du même genre d'affilée. Un geste du lecteur (orbite, clic, sélection) suspend le pilote ; il reprend après 9 s de calme. Bouton « Autopilot » pour l'éteindre ; désactivé par défaut en mouvement réduit. Le titre s'efface 8 s après la fin de la cinématique.

Événements : naissance ; impulsion (avance à 16 unités/s, passe dans chaque enfant quand elle atteint son point de départ, 20 % plus faible, jusqu'à 0,15) ; tissage ; effondrement (1,2 s d'instabilité, dissolution jusqu'à 2,9 s, retrait à 3,1 s, en cascade sur les descendants avec 0,18 s de décalage par génération). Les fentes GPU libérées sont réattribuées par le bas, ce qui garde la plage dessinée courte.

## Le rendu

- **Pas d'objet par chronologie.** Une seule géométrie de rubans pour toute la capacité (4 sommets par segment, 48 segments par fente), une seule texture d'état (4 texels RGBA flottants par fente : naissance/croissance/longueur/profondeur, énergie/stabilité/graine/type, impulsions, effondrement/rang/teinte/surbrillance), un nuage de points pour les univers-poches, un pour le flux. Six appels de dessin pour la scène, plus le post-traitement ; la plage dessinée suit la plus haute fente utilisée (4 k triangles au départ, ~130 k à 34 s).
- **Une naissance = une écriture partielle** (`addUpdateRange`) ; tout ce qui évolue (croissance, tête lumineuse, impulsions, instabilité, dissolution) est calculé par les shaders à partir de `uSimTime`. La texture d'état n'est réécrite que si la simulation a changé.
- **Filament** : ruban orienté écran, largeur en pixels (fil fin au loin, quelques pixels de près), cœur net `exp(−40x²)` et enveloppe `exp(−3,2x²)`, hiérarchie par génération (les générations profondes sont plus fines et plus sombres, sinon un millier de halos additionnés blanchit le centre), tête de croissance, impulsions à front net et sillage long, instabilité (tremblement + braise), dissolution par fragments, atténuation de profondeur. Mélange additif, sortie HDR, bloom `UnrealBloomPass` (seuil 0,68) puis `OutputPass` (tone mapping ACES, sRGB).
- **Univers-poches** : un point au bout de certaines branches abouties (toutes jusqu'à la profondeur 2, deux sur cinq au-delà) : cœur, anneau, halo, deux bras en spirale.
- **Flux** : 3 600 particules (selon la qualité) qui remontent les courbes de l'origine vers la tête, plus vite sur les chronologies énergiques et stables ; quand une chronologie se dissout, ses particules se détachent en braises.
- **Atmosphère** : sphère de ciel au plan lointain (fbm, vert profond, brume ambrée vers le métier), poussière lente.
- **Couleurs** : ambre, or, cuivre (l'orange TVA), blanc chaud ; accent sarcelle pour les tissages, braise pour les effondrements (`components/multiverse/tints.ts`).

## Theatre.js

Projet « CHRONOS · Multiverse », feuille « Cinematic », trois objets : `camera {x,y,z,fov}`, `target {x,y,z}`, `world {exposure, filamentEnergy, particleSpeed, bloomStrength, instability, branchDensity, fabric, title}`. Theatre ne pilote jamais la simulation : pendant la cinématique, **l'horloge de la simulation est la position de la séquence**, si bien que la tête de lecture du Studio rejoue exactement le même réseau, en avant comme en arrière. Écart assumé avec le brief : `expansionRate` n'est pas un paramètre Theatre (une dilatation du temps rendrait le réseau dépendant de l'historique des valeurs et casserait le défilement exact dans Studio) ; le rythme d'expansion est le programme de la simulation, écrit sur la même horloge, et le curseur « Expansion rate » dilate le temps en exploration libre.

Propriétaires : caméra (position, cible, fov) à Theatre pendant la cinématique, aux contrôles d'orbite ensuite (passation exacte sur la pose finale) ; intensités du monde toujours à Theatre (le lecteur multiplie la densité) ; opacité du titre à Theatre (un seul élément DOM), son retrait quand le lecteur prend la caméra à React (élément parent).

Flux : `npm run dev` puis `http://localhost:3000/multiverse?studio=1`, ajuster, exporter le projet et remplacer `data/theatre/multiverse.json` ; ou éditer `scripts/theatre-multiverse.mjs` et lancer `node scripts/theatre-multiverse.mjs` (un test vérifie que le JSON et la pose finale sont à jour).

## Interaction

Glisser pour tourner, molette pour zoomer, clic sur un filament pour ouvrir sa fiche (sélection par projection des points échantillonnés, 14 px de tolérance) ; la lignée s'allume, le reste s'atténue. Depuis la fiche : parent, premier enfant, frères, **Focus** (la caméra vole vers la chronologie), **Pulse**, **Branch here**, **Prune**. Panneau de contrôle : pause ou reprise, passer au réseau, impulsion depuis le métier, élaguer une branche, choisir une chronologie au hasard (point d'entrée clavier), dilatation du temps, densité visible, niveau de qualité épinglé. Échap ferme la fiche. Journal des derniers événements, relevés (temps simulé, vivantes, nées, élaguées, tissages, impulsions, images/s, temps de trame, appels de dessin, triangles, niveau de qualité).

## Qualité, accessibilité, replis

- Budget initial selon l'appareil (`budgetFor`) : capacité 2 048 / 1 280 / 900, particules 3 600 / 1 800 / 900, niveau de départ. Gouverneur : toutes les 2 s, descend d'un niveau si la trame moyenne dépasse 24 ms, remonte après 8 s sous 12 ms. Niveaux : L0 dpr max + bloom + 100 % particules, L1 dpr ≤ 1,25 + bloom + 70 %, L2 dpr 1 sans bloom + 40 %. `?q=0|1|2` épingle un niveau (utile pour les captures).
- `prefers-reduced-motion` (ou interrupteur du site) : pas de cinématique automatique ; le réseau à T+24 en image fixe (rendu à la demande), la cinématique reste à un bouton.
- Sans WebGL, effets coupés ou erreur de rendu : la plaque SVG, calculée **sur le serveur** à partir de la même simulation et projetée depuis la caméra finale, est l'image ; la légende le dit.
- La scène est un `role="img"` avec une description ; tout ce qu'elle montre d'état est aussi en texte dans le HUD ; toutes les actions sont des boutons.

## Vérifié et non vérifié

Vérifié dans Chrome headless avec WebGL logiciel (SwiftShader) : aucune erreur de console ni de compilation de shader ; les cinq mouvements aux bons instants ; la passation à l'exploration ; sélection, marche de lignée, impulsion, branche, élagage, sélection au clic ; mobile 390 px sans débordement ; repli sans WebGL ; mouvement réduit ; Studio monté sur la route en développement.

Non vérifié : les cadences sur GPU matériel (le rendu logiciel tourne ici à 10 images/s en L0, 28 en L2 ; ces chiffres ne disent rien d'un vrai GPU), un vrai téléphone, un lecteur d'écran réel, Lighthouse sur cette route.
