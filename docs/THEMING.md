# Guide de thème

Transformer l'identité TVA en une autre direction artistique sans toucher aux composants, et sans que les shaders, le canvas ASCII ou les SVG restent en arrière.

## 1. Où vit l'identité

| Quoi | Fichier |
| --- | --- |
| Les huit swatches `--tva-*`, les rôles, rayons, ombres, largeurs, z-index, durées, courbes | `styles/tokens.css` |
| Échelle typographique (tailles, interlignages, approches) | `styles/tokens.css` (bloc `@theme`) |
| La palette pour le GPU et le canvas (miroir des swatches) + maths de contraste | `config/palette.ts` |
| Fondations : focus, sélection, classe `.art`, surfaces `.surface-paper` et `.surface-green`, mouvement réduit | `styles/base.css` |
| Polices (next/font, variables CSS) | `styles/fonts.ts` |
| Durées, courbes et ressorts pour GSAP, Motion et les boucles de rendu | `lib/motion-tokens.ts` |
| Nom, titres, navigation, fonctionnalités, options d'animation et de graphisme, pied de page | `config/site.ts` |
| Favicon | `app/icon.svg` |

## 2. Changer la palette

1. Remplacez les swatches `--tva-*` dans `styles/tokens.css` **et** les mêmes valeurs dans `config/palette.ts` (`tests/palette.test.ts` échoue tant qu'ils diffèrent).
2. Relisez les rôles : chaque rôle est un `var(--tva-…)` ou une teinte dérivée commentée avec son ratio. Les shaders lisent les `--tva-*` au montage (`readPalette()`), les pièces ASCII colorées lisent `config/palette.ts`.
3. Lancez `npm test` : le test de palette calcule les ratios WCAG de chaque combinaison réellement employée et nomme celle qui ne lit plus.

Rôles de la palette actuelle et ce qu'ils exigent :

| Rôle | Sert à | Contrainte | Valeur |
| --- | --- | --- | --- |
| `--fg-strong`, `--fg` sur `--bg` | titres, texte | ≥ 4,5 (ici 14,9 et 11,9) | Warm White, Archive Paper |
| `--fg-muted`, `--fg-subtle` sur `--bg` | texte secondaire, microlabels | ≥ 4,5 (6,1 et 5,2 ; 4,7 sur les panneaux) | Sage, sauge 7 % plus sombre |
| `--accent` (texte et aplats avec `--on-accent`) | actions, anomalies | ≥ 4,5 dans les deux sens (5,3) | Temporal Orange exact |
| `--temporal` sur `--bg` | rails, marqueurs, lumières | ≥ 3 (3,8) : **graphique seulement** | Muted Teal |
| `--temporal-text` sur `--bg` | petits textes temporels (numéros, légendes) | ≥ 4,5 (5,8) | teal éclairci `#7d9a8c` |
| `--on-olive`, `--on-green` | texte sur les plaques olive et vert profond | ≥ 4,5 (5,1 et 6,8) | Warm White |
| `--line-input` sur `--bg` | bordures de champs | ≥ 3 | `--fg-subtle` |
| `--focus` | anneau de focus | ≥ 3 sur chaque surface | orange ; obsidienne sur papier ; Warm White sur vert |

Deux couleurs de la palette ne portent jamais de texte : Olive Archive sur l'obsidienne (2,9) et Muted Teal (3,8, texte interdit, graphiques autorisés). C'est voulu : l'olive est une **surface** (dos de dossier, copie carbone, une planche), le teal une **matière** (la ligne sacrée, les orbitales).

### Surfaces re-thémées

`.surface-paper` et `.surface-green` (dans `base.css`) redéfinissent les mêmes variables sur un élément ; les utilitaires Tailwind (`bg-bg`, `text-fg-muted`…) lisent ces variables, donc tout composant placé dedans s'inverse seul. `Section surface="green"` et le formulaire (`surface-paper`) les utilisent. Pour une nouvelle plaque, copiez un bloc, rabattez les accents qui ne lisent plus (sur le papier, l'orange devient `#8a4605` pour le texte et garde l'aplat exact ; sur le vert, le teal s'éclaircit en `#b4d0c5`), ajoutez la variante à `Section`, et ajoutez les ratios au test.

## 3. Changer les polices

1. Dans `styles/fonts.ts`, importez d'autres familles de `next/font/google` (ou `next/font/local`), en gardant les variables `--font-space-grotesk`, `--font-inter`, `--font-plex-mono` **ou** en renommant ces variables dans `tokens.css` (`--font-display-stack`, `--font-sans-stack`, `--font-mono-stack`, `--font-art-stack`).
2. L'art ASCII a sa propre pile (`--font-art-stack`) : une monospace système qui porte elle-même les caractères de boîte et de bloc (Cascadia, Consolas, Menlo…). Ne mettez pas une police web sous-ensemble en tête de cette pile : ses blocs manquants partiraient vers une police de repli d'une autre chasse et les lignes se cisailleraient (mesuré : 60 px pour les lettres contre 98 px pour les blocs). La police « ascii.rest mono » (3 Ko) ne comble que les appareils sans ces glyphes ; gardez son `@font-face` dans `base.css`.
3. Ajustez les approches : approche négative pour les grands titres, positive pour les microlabels mono.

## 4. Changer l'échelle typographique

Le bloc `@theme` de `tokens.css` définit `--text-display` … `--text-micro` avec leurs `--line-height` et `--letter-spacing`. Chaque taille est un `clamp()` : min mobile, pente fluide, max desktop. Modifier une ligne modifie tous les composants qui utilisent `text-title`, etc.

## 5. Changer le mouvement

- Durées `--dur-*` et courbes `--ease-*` (CSS) et leurs jumeaux dans `lib/motion-tokens.ts` (GSAP, Motion, boucles) : changez-les ensemble.
- `config/site.ts › animation.enabled = false` : plus aucune chorégraphie GSAP ; `graphics.effects = "reduced"` : scènes en pose composée à basse cadence ; `"off"` : plaques SVG seulement, aucun canvas.
- Les séquences de la chambre vivent dans `scripts/theatre-state.mjs` (voir `GRAPHICS.md`).

## 6. Changer les pièces ASCII et les shaders

- Pièce maison avec le kit : `components/ascii/pieces/nexus-field.ts` (`piece()`, `drawField()`, `random()` ; jamais `Math.random()` ni l'horloge). Pièce maison sans le kit : `typed-line.ts` (une fonction du temps, trois lignes de `meta`).
- Pièce de la bibliothèque : par module (`import * as fern from "ascii.rest/pieces/fern"`) dans un fichier client.
- Palette d'une pièce colorée : `config/palette.ts` ; une pièce texte prend la couleur CSS de son conteneur.
- Shaders : les couleurs arrivent en uniforms depuis `readPalette()` (`components/graphics/colors.ts`) ; un autre univers change les swatches, pas le GLSL. Pour un autre motif, passez votre `fragment` à `ShaderCanvas` et conservez `vUv`.

## 7. Changer l'univers

Les mots, les folios (« 03/08 », total dans `siteConfig.folios`), le tampon « Received », le dos « Dossier 00/08 », les phases du champ sont dans `components/chronos/*` et `data/*`. Les génériques (`EdgeBand`, `Stamp`, `Frame`, `CornerMarks`, `TerminalPanel`, `ShaderCanvas`…) n'ont pas de texte en dur : donnez-leur les vôtres.

## 8. Check-list après un re-thème

1. `npm run check` (types, lint, tests dont la palette, build).
2. Captures desktop et mobile, avec et sans `prefers-reduced-motion`, avec et sans WebGL (`--disable-3d-apis`).
3. Lighthouse sur `npm run build && npm run start`.
4. Un coup d'œil aux légendes HTML des instruments : elles doivent dire la même chose que le canvas.
