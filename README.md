# CHRONOS / TVA TERMINAL

Une expérience web expérimentale inspirée de l'esthétique de la Time Variance Authority (série *Loki*) : une administration rétro-futuriste de 1962, des dossiers classifiés, une chambre temporelle en 3D, un champ d'anomalie calculé sur le GPU, de la typographie éditoriale et des gravures ASCII. Construite comme un **moteur créatif réutilisable** en quatre couches (application, design system, moteur de mouvement, moteur graphique) habillé d'un univers interchangeable.

Projet indépendant, non affilié à Marvel Studios ou Disney. Toutes les données (dossiers, branches, chiffres) sont fictives et le disent.

## Prérequis

- Node.js 20.9 ou plus récent (développé avec Node 24).
- npm 10+ (le projet utilise npm, déjà en place dans le dépôt ; pnpm fonctionne aussi via `pnpm import`).
- Un accès réseau au premier build : `next/font` télécharge Space Grotesk, Inter et IBM Plex Mono une fois, puis les sert localement.

## Installation, développement, production

```bash
npm install
npm run dev          # http://localhost:3000 (Turbopack) ; ?studio=1 ouvre Theatre.js Studio
npm run typecheck    # tsc --noEmit (TypeScript strict)
npm run lint         # ESLint (eslint-config-next + règles React Hooks)
npm run test         # Vitest + Testing Library (jsdom)
npm run check        # typecheck + lint + test + build
npm run build && npm run start
node scripts/theatre-state.mjs   # régénère data/theatre/*.json depuis la spec de keyframes
```

La page est **prérendue en statique** (Cache Components) : les scènes WebGL se chargent côté client, au-dessus de plaques SVG déjà présentes dans le HTML.

## Stack et versions

| Rôle | Paquet | Version | Pourquoi |
| --- | --- | --- | --- |
| Application | next / react / react-dom | 16.4.3 / 19.3.0 | App Router, Server Components, Turbopack |
| Styles | tailwindcss (+ @tailwindcss/turbopack) | 4 | CSS-first : les tokens sont des variables CSS exposées par `@theme inline` |
| Mouvement narratif | gsap + @gsap/react | 3.15 / 2.1 | chorégraphie du hero, ScrollTrigger (pin, scrub, signaux), DrawSVG, SplitText |
| Interface | motion (`motion/react`) | 14.6 | menus, cartes, indicateurs `layoutId`, dialogue, listes filtrées (`LazyMotion` + `domMax`) |
| ASCII | ascii.rest | 0.4 | `Ascii`, `Banner`, kit (`piece`, `drawField`) ; une pièce maison sans le kit |
| 3D | three + @react-three/fiber | 0.186.1 / 9.8.2 | R3F 9 est la branche stable pour React 19 ; la v10 (alpha, WebGPU) n'offre pas le pipeline `ShaderMaterial` GLSL : écartée |
| Séquences | @theatre/core | 0.7.2 (Apache-2.0) | caméra, artefact, orbitales, lumière de la chambre |
| Édition des séquences | @theatre/studio | 0.7.2 (AGPL-3.0-only), devDependency | dev seulement, derrière `?studio=1` ; absent du bundle de production (vérifié) |
| Non retenus | @theatre/r3f, @react-three/drei | — | r3f exige R3F 8 ; drei n'apportait rien que 30 lignes ne fassent |
| Tests | vitest + testing-library + jsdom | 5 / 16 / 29 | interactions, validation, palette, signaux, qualité, shaders, état Theatre |

## Structure

```
app/                  layout racine (polices, métadonnées, en-tête, pied, signaux), page unique, 404, icône
components/ui/        primitives génériques (Button, Badge, Frame, Card, Grid, Section, SectionHeader, Container,
                      Metadata, StatusIndicator, Divider, Stamp, EdgeBand, CornerMarks, TerminalPanel, formulaires)
components/layout/    SiteHeader (statut vivant, règle de progression), MobileNav (Motion), SiteFooter, SkipLink
components/motion/    Reveal (+ dérive), AnimatedText, MotionCard, MotionProvider, ScrollSignals
components/graphics/  SceneBoundary, ShaderCanvas, TemporalScene, FieldPlate, shaders/, scenes/, theatre/
components/ascii/     AsciiScene, AsciiBanner, ArtBoundary, pieces/ (nexus-field, typed-line)
components/chronos/   l'univers : boot, hero (chambre, fenêtre, rail), anomalie, registre, explorateur, directives,
                      formulaire, statut système, relevé final, folio
config/site.ts        nom, navigation, fonctionnalités, options d'animation et de graphisme, pied de page
config/palette.ts     la palette pour le GPU et le canvas, maths de contraste
data/                 variants, branches, directives, boot, theatre/ (état généré)
lib/                  signals (store + frame), gsap, graphics-quality, webgl-health, motion-tokens, validation
hooks/                useReducedMotion, useMediaQuery, useHydrated, useInView, usePageVisible, useIdleMount, useGraphicsQuality
scripts/              theatre-state.mjs (générateur de l'état Theatre)
styles/               tokens.css, base.css, fonts.ts
tests/                Vitest
docs/                 ARCHITECTURE, GRAPHICS, THEMING, DESIGN, rapports Lighthouse
```

## Laboratoire multivers

`/multiverse` (route séparée, plein écran) est un banc d'essai sur la même pile : un multivers vivant qui passe d'un fil unique à plus d'un millier de chronologies en 24 s, puis se renouvelle. Après la cinématique, il ne boucle jamais : il évolue sans fin d'ère en ère (floraisons, dérives, tempêtes de tissage, grands élagages, nexus, accalmies), tirées de la graine et sans période, pendant qu'un pilote automatique promène la caméra d'événement en événement. La simulation (`lib/multiverse/`) est déterministe et sans React ni three.js ; le rendu tient en six appels de dessin quel que soit le nombre de chronologies ; Theatre.js dirige la cinématique, dont l'horloge est celle de la simulation, ce qui rend le défilement dans Studio exact (`/multiverse?studio=1` en dev). Détails, choix et vérifications : [docs/MULTIVERSE.md](docs/MULTIVERSE.md).

Les couches, la règle de dépendance et les signaux partagés sont décrits dans [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) ; le moteur graphique (shaders, R3F, Theatre, qualité, replis) dans [docs/GRAPHICS.md](docs/GRAPHICS.md) ; le thème dans [docs/THEMING.md](docs/THEMING.md) ; la direction artistique dans [docs/DESIGN.md](docs/DESIGN.md).

## Ce que fait la page

1. **Boot** : bordereau de transmission, deux secondes, passable (`Skip`, Échap), une fois par session, jamais en mouvement réduit ; sans script, l'overlay n'existe pas.
2. **Hero / Sacred Timeline** : titre en trois lignes ; la **chambre temporelle** (R3F : artefact strié déplacé par un bruit 3D, trois orbitales, poussière, caméra Theatre.js) ; la **fenêtre d'observation** (pièce ascii.rest) ; note de dossier ; « Simulate a variance event » et « Replay the entrance » ; le rail SVG qui se dessine avec ses deux stations ; indication de défilement. Le pointeur incline la chambre, le défilement l'éloigne.
3. **Temporal anomaly** : le champ (shader GLSL : anneaux d'interférence, déplacement par bruit, rayons, cœur) sur une plaque vert profond épinglée au défilement ; trois phases suivent la progression ; curseur d'intensité, « Collapse the field », « Trigger a variance ».
4. **Variant registry** : huit dossiers typés, cinq familles de planches (SVG, numéral, ASCII, géométrie, vignettes shader montées en vue seulement), filtres réels à indicateur glissant, `<dialog>` natif.
5. **Timeline explorer** : plan SVG des branches, `tablist` au clavier, panneau de dossier ; la branche choisie allume une orbitale de la chambre et change le statut de l'en-tête.
6. **Directives** : six planches institutionnelles sur six fonds, figures qui dérivent légèrement au défilement.
7. **Report a Nexus Event** : formulaire validé côté client, erreurs accessibles, reçu de démonstration ; **rien n'est transmis**.
8. **System status** : relevé de session (branche, dossiers, variances, mouvement, effets), le champ une dernière fois à l'encre, « END OF RECORD », « // NOTHING FOLLOWS // ».

### Les signaux partagés

Un seul événement temporel (`triggerTemporalEvent`) fait répondre cinq systèmes : le hors-repérage du titre (DOM), la fenêtre ASCII (lumière), la chambre (séquence Theatre EVENT), le champ (enveloppe `uEvent`), l'en-tête et le relevé (compteur). La branche sélectionnée dans l'explorateur remonte dans l'en-tête, la chambre et le relevé ; le pointeur et le défilement vivent dans un objet mutable lu par les boucles de rendu, jamais dans React (`lib/signals.ts`).

### Mouvement réduit, effets, sans WebGL

- `prefers-reduced-motion` ou l'interrupteur « Motion » de l'en-tête : les chorégraphies n'existent pas, les pièces ASCII tiennent une image, la chambre tient sa pose à 6 images/s sans parallaxe, le champ une image basse cadence, les ressorts Motion deviennent des fondus.
- `config/site.ts › graphics.effects` : `auto` (défaut, suit le lecteur et l'appareil), `full`, `reduced`, `off` (plaques SVG seulement).
- Sans WebGL : les plaques SVG restent, légendées « Static plate · WebGL unavailable » ; un shader en erreur ou un contexte perdu remonte à `SceneBoundary`, qui rend la plaque.
- Qualité : `detectQuality()` rogne dpr, particules, octaves et cadence selon la largeur, `saveData`, mémoire et cœurs ; les canvas se rendent à la demande, seulement en vue et onglet visible, et la chambre attend un moment calme après le chargement.

## Vérifications réellement exécutées (24 octobre 2026)

| Contrôle | Résultat |
| --- | --- |
| `tsc --noEmit` | 0 erreur |
| ESLint (`--max-warnings 0`) | 0 problème |
| Vitest | 7 fichiers, 46 tests verts (interactions, validation, palette et contrastes, signaux, qualité, shaders, état Theatre) |
| `next build` | `/`, `/_not-found`, `/icon.svg` statiques ; aucune chaîne de `@theatre/studio` dans `.next/static` |
| Chrome headless + WebGL logiciel (SwiftShader), 1440×900 et 390×844 | 0 erreur console, 0 erreur de page, aucun shader en échec ; chambre et champ « Live », vignettes du registre montées en vue et démontées hors vue ; aucun débordement horizontal ; titre visible ; variance et sélection de branche fonctionnelles ; parcours clavier complet jusqu'aux onglets de branches |
| Chrome headless avec `--disable-3d-apis` | plaques SVG et légendes « Static plate · WebGL unavailable », 0 erreur |
| Chrome headless avec `prefers-reduced-motion: reduce` | hero en place, scènes en pose, 0 erreur |
| Lighthouse 13 (Chrome headless, WebGL logiciel), build de production | voir ci-dessous |

| Lighthouse | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Mobile (Moto G, 4G lent, CPU ×4) | 69 | 100 | 100 | 100 | 0,9 s | 4,0 s | 730 ms | 0,008 |
| Desktop | 96 | 100 | 100 | 100 | 0,2 s | 0,9 s | 150 ms | 0,002 |

Le score mobile est porté par le temps de blocage : l'hydratation de React et des îlots sur un processeur simulé quatre fois plus lent (la chambre 3D, 0,9 Mo, se charge après un moment calme et pèse peu dans ce total), et par le LCP de la note de dossier qui attend la fin de la chorégraphie d'entrée. `graphics.effects = "reduced"` ou `features.scene3d = false` sont les leviers si une cible mobile plus haute est exigée. Les rapports HTML sont dans `docs/lighthouse-mobile.html` et `docs/lighthouse-desktop.html`.

Non vérifié : un GPU matériel (ce poste n'en expose pas au navigateur headless ; les cadences réelles ne sont donc pas mesurées), un vrai téléphone, un lecteur d'écran réel (seuls les rôles, noms et l'ordre de focus sont vérifiés).

## Notes d'intégration

### ascii.rest

- Un Server Component ne peut passer qu'un **nom** de pièce ; un module (`ascii.rest/pieces/fern`) ou une pièce du kit se construit dans un fichier client, hors du composant ou dans `useMemo`.
- La pièce maison du hero (`components/ascii/pieces/nexus-field.ts`) est écrite avec `ascii.rest/kit` (`piece()`, `drawField()`, `random()`), reste une fonction pure du temps (boucle de 14 s, image fixe à 4,2 s) et lit ses couleurs dans `config/palette.ts`.
- Les deux lignes tapées (reçu NX-7, « NOTHING FOLLOWS ») viennent d'une pièce maison sans dépendance (`pieces/typed-line.ts`) : la mise en page racine ne charge pas le kit pour deux lignes.
- `AsciiScene` rend la première image côté serveur, réserve l'espace, retombe sur l'image fixe en cas d'erreur ; la pile de polices de l'art est une monospace système (voir THEMING).

### Shaders, R3F, Theatre.js

Voir [docs/GRAPHICS.md](docs/GRAPHICS.md) : uniforms documentés, choix de GLSL ES 1.0, couleurs sRGB, rendu à la demande, propriétaire de chaque propriété animée, flux Studio → JSON.

## Limites connues

- Le formulaire n'a pas de backend : validation et reçu de démonstration ; le branchement est décrit dans `docs/ARCHITECTURE.md`.
- Pas d'image Open Graph ni de `metadataBase` tant qu'aucun domaine réel n'existe.
- Les chorégraphies GSAP et les séquences Theatre sont vérifiées visuellement et par l'état généré, pas en test unitaire du rendu.
- Theatre.js Studio n'a pas été ouvert sur ce poste (pas de navigateur interactif) : les keyframes viennent de la spec `scripts/theatre-state.mjs`, validée en Node ; Studio reste le chemin prévu pour les affiner.
- Le bundle 3D (three.js + R3F, ~0,9 Mo) n'est pas tree-shakable par construction ; il est différé et chargé à part.
- Police de repli ASCII : les caractères braille ne sont pas couverts.
