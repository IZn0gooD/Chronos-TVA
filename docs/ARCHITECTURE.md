# Architecture

CHRONOS / TVA TERMINAL est construit comme un **moteur créatif réutilisable** habillé d'un **univers** (la TVA). Ce document décrit les quatre couches, leurs responsabilités, les signaux qui les relient et la manière de réutiliser le moteur pour un site très différent. Le moteur graphique a son propre document, `GRAPHICS.md`.

## 1. Les quatre couches

```
Couche 1 — Application
app/layout.tsx           layout racine : <html>, polices, métadonnées, MotionProvider, StudioLoader
app/(site)/              le terminal : layout du site (lien d'évitement, en-tête, pied, signaux) et page unique
app/(lab)/multiverse/    le laboratoire multivers, plein écran, sans l'habillage du site (docs/MULTIVERSE.md)
app/not-found.tsx        404 globale (elle apporte elle-même l'habillage du site)

Couche 2 — Design system
components/ui/           primitives génériques, sans vocabulaire TVA
components/layout/       en-tête (statut vivant, règle de progression), menu mobile (Motion), pied de page, lien d'évitement
styles/                  tokens.css (identité), base.css (fondations, surfaces re-thémées), fonts.ts
config/site.ts           nom, titres, navigation, fonctionnalités, options d'animation et de graphisme, pied de page
config/palette.ts        la palette comme données (canvas, GLSL, ASCII) + maths de contraste

Couche 3 — Moteur de mouvement
components/motion/       Reveal (révélation + dérive au défilement), AnimatedText (SplitText), MotionCard,
                         MotionProvider (Motion, domMax), ScrollSignals (progression, hero, pointeur → lib/signals)
lib/gsap.ts              enregistrement GSAP, conditions de mouvement, motionAllowed()
lib/motion-tokens.ts     durées, courbes et ressorts pour les moteurs JS (miroir de tokens.css)
lib/motion-store.ts      l'interrupteur de mouvement du lecteur

Couche 4 — Moteur graphique
components/graphics/     SceneBoundary, ShaderCanvas, TemporalScene, FieldPlate, shaders/, scenes/, theatre/
components/ascii/        AsciiScene, AsciiBanner, ArtBoundary, pieces/ (nexus-field avec le kit, typed-line sans)
lib/graphics-quality.ts  presets de qualité, détection d'appareil, sonde WebGL, niveau d'effets
lib/webgl-health.ts      surveillance d'un renderer
data/theatre/            état Theatre.js généré + pose de repos ; scripts/theatre-state.mjs le régénère

Transverse
lib/signals.ts           les signaux partagés (store `scene`, objet `frame`)
components/chronos/      l'univers : boot, hero (chambre, fenêtre, rail), anomalie, registre, explorateur,
                         directives, formulaire, statut système, relevé final, folio
data/ + types/content.ts contenus éditoriaux typés
hooks/                   useReducedMotion, useMediaQuery, useHydrated, useInView, usePageVisible, useGraphicsQuality
tests/                   Vitest + Testing Library : interactions, validation, palette, signaux, qualité, shaders, Theatre
docs/                    ARCHITECTURE, GRAPHICS, THEMING, DESIGN, rapports Lighthouse
```

### Règle de dépendance

```
data/ + config/ + types/  ──►  components/chronos/  ──►  app/
                                      │
components/ui, layout, motion, ascii, graphics  (génériques : ne connaissent ni la TVA ni les données)
                                      │
                               lib/signals.ts  (le seul état partagé entre l'interface et les graphiques)
```

- Les couches 2 à 4 n'importent **jamais** depuis `data/` ni depuis `components/chronos`. Elles ne contiennent aucun mot de l'univers : `layout/` lit `config/site.ts`, reçoit la pièce de clôture et la plaque finale par des slots (`<SiteFooter closing plate />`) et le statut vivant par un composant passé depuis `components/chronos` (`SystemStatus`), importé par l'en-tête parce que le statut est une fonctionnalité du socle, pas un mot de l'univers.
- `components/graphics` lit les couleurs dans `config/palette.ts` (ou les `--tva-*` vivantes) et les états dans `lib/signals.ts` ; les textes (légendes, labels) lui sont passés.
- `components/chronos` compose les génériques avec les données. C'est la couche que l'on réécrit pour un autre univers.
- `app/page.tsx` ne fait que composer les sections.

## 2. Server Components par défaut

Tout rend côté serveur. Seuls les îlots interactifs portent `"use client"` ; les trois îlots sous la ligne de flottaison (registre, explorateur, formulaire) sont déclarés avec `next/dynamic` dans `components/chronos/islands.tsx`, un module client (déclarés dans la page serveur, la validation du prérendu instantané de `next dev` ne résolvait pas leurs références) ; les scènes WebGL sont en plus chargées en `dynamic(…, { ssr: false })` **au-dessus d'une plaque SVG déjà dans le HTML**.

| Client component | Pourquoi |
| --- | --- |
| `BootSequence` | GSAP, `sessionStorage`, préférence de mouvement |
| `Hero`, `SacredTimeline`, `ObservationWindow`, `TemporalChamber` | chorégraphie GSAP, variance, pièce ascii.rest, scène R3F |
| `TemporalAnomaly` | ScrollTrigger (pin), contrôles, ShaderCanvas |
| `VariantRegistry`, `VariantDialog`, `FigureAscii`, `FigureField` | filtres, `<dialog>`, pièces ascii.rest, vignette shader |
| `TimelineExplorer`, `BranchDiagram` | sélection, clavier, tracé GSAP, signal de branche |
| `NexusReportForm` | validation, état du formulaire, reçu typé |
| `SystemStatus`, `FinalStatus` | lecture du store `scene` |
| `Reveal`, `AnimatedText`, `MotionCard`, `MotionProvider`, `ScrollSignals`, `MobileNav` | GSAP / Motion |
| `AsciiScene`, `AsciiBanner`, `ArtBoundary` | `mount()` d'ascii.rest, error boundary |
| `SceneBoundary`, `ShaderCanvas`, `TemporalScene` | WebGL |

Contrainte ascii.rest à retenir : un Server Component ne peut passer à `<Ascii>` qu'un **nom** de pièce (chaîne). Un module de pièce ou une pièce du kit se construit **dans un fichier client**, hors du composant (ou dans un `useMemo`).

## 3. Les signaux partagés (`lib/signals.ts`)

Le projet n'a qu'un état transversal, petit et typé, en deux étages :

| Étage | Contenu | Écrit par | Lu par |
| --- | --- | --- | --- |
| `scene` (store, basse fréquence) | branche sélectionnée (`branchId`, `branchState`, `branchIndex`), dernier dossier ouvert et nombre consultés, compteur d'événements temporels et leur instant, niveau d'effets | explorateur (`selectBranch`), registre (`consultFile`), hero et anomalie (`triggerTemporalEvent`), chambre (`effects`) | en-tête (`SystemStatus`), hero (hors-repérage), chambre (orbitale allumée, teinte de l'artefact, séquence Theatre EVENT), champ (enveloppe `uEvent`), relevé final |
| `frame` (objet mutable, haute fréquence) | pointeur normalisé, progression du hero, progression de la page | `ScrollSignals` (ScrollTrigger + `pointermove`) | boucles `useFrame` de la caméra et des shaders, règle de progression de l'en-tête (quickSetter) |

Règle : un mouvement de pointeur ou une image ne traverse jamais React. `useScene(selector)` (useSyncExternalStore) sert aux composants ; `scene.get()` et `frame` servent aux boucles de rendu.

Chaîne d'un **événement temporel** : `triggerTemporalEvent()` → le hero joue le hors-repérage et le tampon, la fenêtre ASCII passe à l'orange ; la chambre joue la plage EVENT de Theatre (caméra, distorsion, pulse, lumière) ; le champ reçoit une enveloppe de 2,4 s ; l'en-tête et le relevé final comptent l'événement.

## 4. Les tokens pilotent tout

`styles/tokens.css` déclare les huit swatches (`--tva-*`), les rôles sémantiques (`--bg`, `--surface-1..3`, `--fg-strong/fg/fg-muted/fg-subtle`, `--accent*`, `--temporal*`, `--focus`, `--line*`, états, rayons, ombres, largeurs, z-index, durées, courbes) et le bloc `@theme inline` qui les expose à Tailwind v4. Parce que les utilitaires pointent vers des variables vivantes, **un sous-arbre se re-thème en redéfinissant les variables** : `.surface-paper` (la feuille du formulaire) et `.surface-green` (les plaques immersives : anomalie, explorateur) vivent dans `base.css` ; `Section surface="green"` l'applique. Les shaders lisent les mêmes `--tva-*` au montage (`readPalette()`), donc un thème CSS atteint le GPU. `tests/palette.test.ts` vérifie les ratios de contraste de chaque combinaison réelle et la synchronisation avec `config/palette.ts`.

## 5. Grammaire d'animation : un propriétaire par propriété

| Moteur | Responsabilité | Où |
| --- | --- | --- |
| GSAP + ScrollTrigger | chorégraphie du hero, tracé des timelines (DrawSVG), révélations au défilement, dérive des planches, pin et scrub de la section Anomalie, signaux de défilement | `components/motion`, `chronos/hero`, `chronos/temporal-anomaly`, `chronos/timeline-explorer` |
| Motion (`motion/react`, domMax) | menu mobile (AnimatePresence), cartes (lift/press), indicateurs de sélection glissants (`layoutId`), entrée du dialogue et du panneau de branche, fiches filtrées | `MobileNav`, `MotionCard`, `TimelineExplorer`, `VariantRegistry`, `VariantDialog` |
| Theatre.js | séquences de la chambre : caméra, artefact, orbitales, lumière (plages ENTRANCE / EVENT) | `components/graphics/theatre` |
| CSS | retour de pression des boutons (0 ms), lumières, tampon, cue de défilement, états du menu | `base.css`, utilitaires |

Aucune propriété n'a deux auteurs : la caméra a une base Theatre et deux décalages propres (parallaxe, travelling) additionnés dans `CameraRig` ; les uniforms du champ n'appartiennent qu'à la boucle `drive` de la section. Les ressorts suivent le modèle amortissement/réponse d'Apple (`lib/motion-tokens.ts`) : critiquement amortis par défaut, un rebond seulement après un geste à vitesse.

`lib/gsap.ts` expose `MOTION_CONDITIONS` et `motionAllowed()` (config `animation.enabled` et interrupteur du lecteur). Chaque chorégraphie vit dans `gsap.matchMedia()` ; le CSS décrit toujours l'état final ; sans JavaScript ou en mouvement réduit, la page est complète. Le hero est le seul cas où l'état de départ est aussi en CSS (`hero-pending`, posé avant hydratation), avec une libération CSS à 2,5 s si le bundle ne s'exécute jamais.

## 6. Données et validation

- `data/*.ts` sont des tableaux typés par `types/content.ts`. Les composants reçoivent ces données en props.
- `lib/validation.ts` est pur (pas de DOM) : le formulaire, les tests et un futur service l'appellent.

## 7. Connecter le formulaire à un vrai service

Aujourd'hui le formulaire valide côté client et affiche un reçu de démonstration ; **rien n'est transmis**. Pour le connecter :

1. Créer une Server Action (`app/actions/report.ts`, `"use server"`) qui reçoit un `NexusReportInput`, rappelle `validateNexusReport` côté serveur, puis écrit dans votre service.
2. Dans `NexusReportForm`, remplacer la branche « report accepté » par l'appel de l'action et afficher l'erreur serveur dans la zone `role="status"` existante.
3. Retirer le badge « Demonstration » et la mention « not transmitted » du reçu ; ajouter la politique de confidentialité réelle.

## 8. Réutiliser le moteur pour un autre site

1. **Configuration** : `config/site.ts` (nom, navigation, fonctionnalités, `graphics.effects`, pied de page).
2. **Tokens** : `docs/THEMING.md` (palette, surfaces, polices, échelle, mouvement) ; `config/palette.ts` en miroir.
3. **Données** : remplacer `data/*.ts` et, si besoin, `types/content.ts`.
4. **Composants spécifiques** : remplacer `components/chronos/*` par les vôtres, en composant les génériques (`Section`, `SectionHeader`, `Frame`, `Grid`, `Card`, `Button`, `Badge`, `StatusIndicator`, `Metadata`, `Stamp`, `EdgeBand`, `CornerMarks`, `TerminalPanel`, `Divider`, `Reveal`, `AnimatedText`, `MotionCard`, `AsciiScene`, `AsciiBanner`, `SceneBoundary`, `ShaderCanvas`, `FieldPlate`).
5. **Graphiques** : un autre fragment pour `ShaderCanvas`, une autre spec Theatre pour la chambre (voir `GRAPHICS.md`).
6. **Signaux** : garder `lib/signals.ts` tel quel ou renommer ses champs ; c'est le contrat entre l'interface et le GPU.

## 9. Ajouter une section

1. Données dans `data/`, types dans `types/content.ts`.
2. `components/chronos/ma-section/` (serveur si possible, îlot client pour l'interactif ; `dynamic(..., { ssr: false })` pour un canvas, toujours au-dessus d'une plaque dans le HTML).
3. Dans `app/page.tsx`, une `<Section id>` avec `Container`, `SectionHeader` (index, eyebrow, titre, lede, `Folio`) et le composant ; incrémenter `siteConfig.folios`.
4. Lien dans `config/site.ts › nav`, drapeau dans `features` si optionnelle.
5. Un test si la section a une interaction.

## 10. Créer un composant générique

- Une responsabilité, des props en petit nombre, des variantes par **union de chaînes**, jamais des rangées de booléens.
- Couleurs et espacements uniquement via les utilitaires de tokens, pour suivre un re-thème sans modification.
- Sémantique d'abord ; focus visible hérité de `base.css` ; toute information portée par un canvas est aussi en HTML.
- Documenter en tête de fichier ce que fait le composant et pourquoi.
