# DESIGN BIBLE — CHRONOS / TVA TERMINAL

Version 1.0 · 24 octobre 2026 · direction de création (synthèse des trois concepts et des trois verdicts de jury)
Statut : document d'exécution. Les développeurs n'ont besoin que de ce fichier, du brief (`brief.md`) et de la doc locale d'ascii.rest (`ascii-docs/llms-full.txt`, version 0.4.0, celle installée dans `chronos-tva/node_modules/ascii.rest`).

Conventions : UI entièrement en **anglais** (`<html lang="en">`), documentation en français. Toutes les pièces ascii.rest citées ici ont été **construites et mesurées** contre la version installée le 24/10 (script `verify-kit.mjs`) : largeurs de bannières exactes, options acceptées, premières images rendues. Rien d'inventé.

---

## 0. Décisions du directeur de création

Le concept de base est **« Dossier d'État, folio sauge »**, premier chez les trois jurés (90 / 86 / 87). On garde sa thèse (l'écran est une feuille de dossier classifié imprimée en 1962), sa grammaire d'impression (Tirage, Composition, Tracé, Hors-repérage, Tampon), sa règle des encres, son registre de contraste, son dos de dossier, ses stations sur la timeline, sa copie carbone et son « NOTHING FOLLOWS ».

Greffes retenues (toutes citées par au moins deux jurés, ou décisives pour le brief) :

- **Du concept « Atlas du Temps Mesuré »** : zéro canvas (la gravure du hero devient deux pièces texte superposées, une encre or, une encre sauge, première image rendue côté serveur) ; le temps de la gravure est une horloge que GSAP possède (`AsciiClock`) ; objet de continuité boot → hero (la perforation du bordereau devient le rail de la Sacred Timeline) ; relevé tabulaire « T+0.000 » ; trace de déviation en braille dans l'Explorer (une sélection re-trace la courbe) ; mini-échelle de progression du formulaire ; la ligne se termine au footer sur un carré or, « END OF RECORD » ; la règle dure « le CSS décrit l'état final, GSAP ne pose ses `from` que sous `matchMedia` » ; `<select>` natif doublant les marqueurs de l'Explorer ; second viewBox par planche de directive sur mobile ; thème de pièces unique ; `snapshot()` au build.
- **Du concept « Le Pupitre et la Fenêtre »** : la sixième primitive **COMMUTATION** (steps(1), aucun GSAP Flip) ; sur mobile la gravure s'insère ENTRE « IS UNDER » et « CONTROL. » ; la copie carbone devient fonctionnelle (elle reflète la saisie) ; légende « forme + couleur, jamais la couleur seule » ; une première variance scriptée à la fin du Tracé du hero ; une fiche archivée sur aplat Paper ; en reduced-motion le bordereau n'est jamais monté ; mention d'indépendance au colophon ; bouton « Replay the entry sequence ».

Risques des jurés corrigés dans ce document (liste de contrôle en §9) : plus aucune fonction `color` sur `field()` (deux encres = deux `<pre>`), aucun texte orange sous 24 px (le mot reste Paper, le carré porte l'orange), aucun filet structurel Brown sur Obsidian, largeurs de bannières lues dans `meta.cols` (mesurées : « UNDER CONTROL » wide = 101 colonnes, `max={72}` ne les réduit pas), `mono` obligatoire sur toute pièce du kit, `typewriter` prend `cursor: true` (pas « ▌ »), `spinner("line")` au lieu de `"dots"` (braille), pas de `glitch()`, pas de `blinking()`, boot rendu côté serveur et gardé par un attribut posé avant la première peinture (pas de flash), hero borné en hauteur, bascule tactile de la variance (pas de minuteur), plancher mono 12 px, contrôle global « Motion », boucles plafonnées à deux par page.

Ce qui n'a PAS été retenu, et pourquoi : le cadre à crans `┌─ TITRE ──` (kit de terminal), `glitch()` (idiome générique), les bannières en guise de titres de section (évincent Space Grotesk), la bande perforée défilante et le voyant clignotant (boucles sans fonction), l'échelle verticale graduée et les quatre cellules d'état du hero de l'Atlas (encombrement), le scrub `<input type=range>` (le rembobinage combat le geste ; on garde une version minimale : l'horloge de la gravure saute d'un cran au hors-repérage), les numéros fantômes à 12 % (1,26:1, invisibles), le range vertical par writing-mode.

---

## 1. Thèse et signature

### 1.1 Thèse

L'écran est une feuille de dossier classifié, composée en 1962 sur une presse d'État : une grille de 12 colonnes, deux encres (Obsidian et Sage), un papier (Archive Paper) réservé au formulaire et à deux affiches, une encre brune pour l'imprimé administratif. L'administration est calme et sûre d'elle ; elle range le temps comme on range des fiches : folios, cartouches, filets, repères de repérage, tampons. **Le temps est la seule chose qui déborde, et il déborde comme un défaut d'impression** : un hors-repérage de l'encre orange, rare, bref, toujours régularisé. L'or n'imprime qu'une chose : la ligne sacrée.

L'ASCII est de l'encre, pas de la lumière : gravure au trait et caractères plombés dans des `<pre>`, dans la couleur de la page. **Aucun canvas sur le site.** Rien ne pulse, rien ne flotte : chaque mouvement est un geste d'imprimerie (tirage, composition, tracé, hors-repérage, tampon, commutation), joué une fois, puis la page se tient immobile et reste belle sans lui. La version reduced-motion est littéralement la version imprimée.

Ce qui rend le site inimitable : la retenue est structurelle (masses de vide, rapport d'échelle 1:14 entre l'affiche et la microtypographie, une seule graisse de Space Grotesk), une seule anomalie signature traverse les sept sections, et chaque décision est un parti pris vérifiable : le dos de dossier qui mange le bord droit du hero, « EVERYTHING » qui passe au-dessus de la gravure, les actions posées en stations sur la timeline, un registre composé en trois rangs, un explorateur qui change d'axe sur mobile, cinq affiches toutes différentes, un formulaire avec sa copie carbone qui écrit ce qu'on tape, une ligne qui se termine une seule fois, au pied de page.

### 1.2 Signature : HORS-REPÉRAGE

Au repos, la page est parfaitement repérée (deux encres alignées). Un **événement de variance** fait glisser une troisième encre, l'orange, de 3 px vers la droite et 2 px vers le haut, en 120 ms par paliers (`steps(3)`, geste mécanique de presse) :

1. un double orange du titre « EVERYTHING IS UNDER CONTROL. » apparaît derrière le titre Paper (couche dupliquée `aria-hidden`, `transform: translate(3px, -2px)`, `opacity 0 → 1`) ;
2. les filets du hero concernés se dédoublent (même translation) ;
3. la gravure ASCII passe à son état « variance » : un bras se détache de la ligne sacrée et l'anneau se déchire (même pièce, `options.variance` 1, image écrite par notre horloge au même instant `t`, donc sans saut de phase) ; l'horloge de la gravure recule de 0,5 s d'un coup (le temps a sauté d'un cran) ;
4. la branche « nexus » de la timeline SVG se détache de la ligne (son tracé passe de Sage à Orange, `stroke-dashoffset` 240 ms) ;
5. l'indicateur de la nav commute : « ▪ TIMELINE NOMINAL · T+0.000 » → « ▪ VARIANCE DETECTED · T+0.003 » (carré orange, **mot en Paper**, relevé tabulaire qui compte 0.000 → 0.003 en `steps(3)`), et le cartouche du hero passe de « FOLIO 01/07 » à « FOLIO 01/07-B ».

Déclencheurs : le marqueur nexus de la timeline du hero (un vrai `<button aria-pressed>` « Simulate a variance event » : survol/focus = variance tenue, sortie = retour ; sur écran tactile, appui = bascule, second appui = retour), et une **première variance scriptée** de 600 ms quand le Tracé d'entrée atteint le marqueur nexus. Retour en repère : 80 ms `steps(2)`, puis un tampon Sage « REGISTERED » (rotation −6°, 180 ms, `power4.out`) frappe à côté de l'indicateur et le relevé revient à T+0.000.

Échos ailleurs : dans l'Explorer, sélectionner BR-0419 dédouble le titre du panneau de 2 px en orange (tenu tant qu'elle est active) et la trace braille se réécrit en encre orange ; dans le registre, les fiches au statut ANOMALY portent le carré orange et, au survol des compositions typographiques, un double **Sage** de 2 px (hors-repérage amical, jamais orange).

Reduced-motion et « Motion: off » : les états permutent instantanément, sans glissement ; l'état doit se lire sans mouvement (il se lit : double orange statique, mot VARIANCE DETECTED, carré orange, FOLIO 01/07-B).

Motif visuel récurrent : les **repères de repérage** (croix 12 px, filet 1 px Sage) aux quatre coins de la feuille (haut du hero, bas du footer, coins de chaque planche de directive et de la planche IV de l'Explorer), le **cartouche de folio** mono en haut à droite de chaque section (« FOLIO 03/07 · BRANCH SURVEY · DESK 7 ») précédé de son numéral en bannière dot-matrix, et la **règle des encres** : Sage et Paper ne se superposent jamais, l'or et l'orange ne vivent que sur l'Obsidian.

---

## 2. Tokens (`styles/tokens.css`, exposés à Tailwind v4 via `@theme`)

### 2.1 Couleurs brutes

```css
--c-obsidian: #171914;  --c-sage: #B9C0A2;  --c-orange: #C75B32;
--c-gold: #D7B65D;      --c-paper: #D9D3C5; --c-brown: #625A4B;
--c-sage-70: #888E77;   /* Sage à 70 % sur Obsidian, aplati : texte tertiaire */
```

Les pièces ascii.rest ne reçoivent jamais de couleur (tout est `<pre>` en `color` CSS) ; si un jour une pièce colorée est nécessaire, les six hex sont dupliqués en constantes TS dans `config/palette.ts` (format `#rrggbb`, six chiffres).

### 2.2 Ratios de contraste (recalculés, WCAG 2.x)

| paire | ratio | usage autorisé |
| --- | --- | --- |
| Paper / Obsidian | 11,87 | texte principal, tout |
| Sage / Obsidian | 9,38 | texte secondaire, labels, filets structurels |
| Gold / Obsidian | 9,06 | ligne sacrée, marqueur nexus, valeur « 0.000 », carré de fin ; jamais du texte courant (règle d'univers, pas de contraste) |
| Orange / Obsidian | 4,19 | **graphiques ≥ 3:1 seulement** (carrés 6-8 px, filets 2-4 px, double du titre ≥ 48 px) ; texte uniquement ≥ 24 px normal ou ≥ 18,67 px gras |
| Brown / Obsidian | 2,60 | **interdit** en texte, en bordure de champ, en filet structurel ; toléré en hachure décorative doublée d'un mot |
| Obsidian / Paper | 11,87 | texte sur papier |
| Obsidian / Sage | 9,38 | texte sur aplat sauge |
| Brown / Paper | 4,56 | labels AA sur papier (≥ 12 px), filets des champs |
| Brown / Sage | 3,61 | filets graphiques sur sauge ; texte ≥ 24 px seulement |
| Sage-70 / Obsidian | 5,21 | texte tertiaire (colophon, mentions) |
| Sage / Paper | 1,27 | **interdit** (jamais l'un sur l'autre) |
| Gold / Sage 1,04 · Gold / Paper 1,31 · Orange / Sage 2,24 · Orange / Paper 2,83 | | **interdits** : l'or et l'orange ne vivent que sur Obsidian |

### 2.3 Rôles sémantiques

```css
/* fonds et surfaces */
--ground: var(--c-obsidian);          /* la page */
--surface-1: var(--c-obsidian);       /* panneaux : pas d'aplat, des filets */
--surface-2: var(--c-sage);           /* dos du dossier, onglet actif, planches 01/04/05, bande INDEX mobile */
--surface-3: var(--c-paper);          /* feuille du formulaire, planches 02/03, fiche archivée VR-0022 */
--surface-print: var(--c-brown);      /* copie carbone */
/* encres sur fond sombre */
--ink-1: var(--c-paper);              /* titres, corps, valeurs */
--ink-2: var(--c-sage);               /* labels, métadonnées, filets, encre ASCII par défaut */
--ink-3: var(--c-sage-70);            /* mentions, colophon, légendes */
/* encres sur surfaces claires */
--ink-on-light: var(--c-obsidian);    /* texte sur Sage et Paper */
--ink-on-light-2: var(--c-brown);     /* labels et filets sur Paper (AA), filets graphiques sur Sage */
/* filets */
--rule-1: var(--c-sage);              /* tout filet structurel sur Obsidian */
--rule-2: var(--c-brown);             /* filets sur Paper ; hachures décoratives */
--rule-light: var(--c-obsidian);      /* filets sur Sage/Paper */
/* accents */
--accent-action: var(--c-orange);     /* marqueur de l'action primaire (barre 4 px sur Obsidian), bande d'erreurs */
--accent-attention: var(--c-orange);  /* anomalies, hors-repérage */
--accent-temporal: var(--c-gold);     /* la ligne sacrée et ce qui est temporellement important */
/* états (toujours un glyphe de forme + un mot, jamais la couleur seule) */
--status-nominal: var(--c-sage);      /* carré plein */
--status-anomaly: var(--c-orange);    /* carré plein + trait de soulignement 1 px */
--status-review: var(--c-paper);      /* carré creux */
--status-archived: var(--c-sage);     /* carré creux barré (⊠ dessiné en CSS) */
--status-temporal: var(--c-gold);     /* nexus : carré plein or */
/* focus */
--focus-ring: var(--c-paper);         /* 2 px, offset 4 px, sur Obsidian */
--focus-ring-light: var(--c-obsidian);/* 2 px, offset 4 px, sur Sage/Paper */
```

Interdits encodés par un test de lint CSS (`tests/tokens.test.ts`, regex sur `styles/*.css`) : aucune déclaration `color:` avec `--c-orange`/`--c-gold` dans un sélecteur portant une surface claire ; aucune `border-color: var(--c-brown)` hors `[data-surface="paper"]`.

### 2.4 Échelle typographique (polices via `next/font`, `display: "swap"`, `adjustFontFallback` par défaut)

Base 16 px, rythme vertical 8 px. Une seule graisse de Space Grotesk (500), deux d'Inter (400/500), deux de Plex Mono (400/500). Le rapport d'échelle 1:14 (affiche 152 px / microtypo 11 px) fait la hiérarchie, pas la graisse.

| token | famille | taille | lh | ls | casse | emploi |
| --- | --- | --- | --- | --- | --- | --- |
| `--t-display` | Space Grotesk 500 | `clamp(3rem, min(1rem + 8.5vw, 13svh), 9.5rem)` | 0.92 | −0.025em | MAJ | le titre du hero (borné par la hauteur pour tenir à 1366×768) |
| `--t-h1` | Space Grotesk 500 | `clamp(2.5rem, 1rem + 5.5vw, 6rem)` | 0.90 | −0.02em | MAJ | titres des affiches de directives (seule autre famille en capitales) |
| `--t-h2` | Space Grotesk 500 | `clamp(1.75rem, 1rem + 2.6vw, 3.5rem)` | 1.02 | −0.015em | bas de casse | titres de section |
| `--t-h3` | Space Grotesk 500 | `clamp(1.125rem, 1rem + 0.6vw, 1.5rem)` | 1.15 | −0.005em | bas de casse | noms de fiches, désignations de branches |
| `--t-body` | Inter 400 | `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)` | 1.55 | 0 | normale | corps, mesure max 64ch |
| `--t-small` | Inter 400/500 | `clamp(0.8125rem, 0.78rem + 0.15vw, 0.875rem)` | 1.45 | 0 | normale | descriptions, aides, erreurs (500), colophon |
| `--t-mono-label` | IBM Plex Mono 500 | `0.75rem` (12 px, plancher) | 1.3 | 0.12em | MAJ | identifiants, statuts, onglets, clés, nav, cartouches porteurs d'information |
| `--t-mono-deco` | IBM Plex Mono 500 | `0.6875rem` | 1.3 | 0.12em | MAJ | cartouches purement décoratifs, `aria-hidden` seulement |
| `--t-mono-data` | IBM Plex Mono 400 | `0.8125rem` | 1.5 | 0 | normale | lectures, diagnostics, reçus, règlement, chiffres tabulaires (`font-variant-numeric: tabular-nums`) |
| `--t-mono-readout` | IBM Plex Mono 400 | `clamp(1.25rem, 1rem + 1vw, 1.75rem)` | 1.2 | 0 | normale | identifiant de branche dans le panneau ; « T+0.000 » à 1rem dans la nav |
| `--t-folio` | Space Grotesk 500 | `1.25rem` | 1 | 0 | — | folios (chiffres tabulaires) |
| `.art` | IBM Plex Mono, puis « ascii.rest mono », puis `ui-monospace` | par pièce (§6.4) | 1.2 | 0 | — | tout `<pre>` ascii.rest : `margin: 0; white-space: pre; font-variant-ligatures: none` |

Règles : jamais deux niveaux adjacents de même taille ; capitales réservées au display, aux h1 des affiches et aux mono-labels ; chiffres tabulaires partout où une valeur peut changer ; saisies de formulaire à 1rem minimum (pas de zoom iOS).

### 2.5 Espacements, rayons, ombres, largeurs, profondeur

- Espacements : `--s-1` 4 · `--s-2` 8 · `--s-3` 12 · `--s-4` 16 · `--s-5` 24 · `--s-6` 32 · `--s-7` 48 · `--s-8` 64 · `--s-9` 96 · `--s-10` 128 px. Rythme vertical de section `--section-y: clamp(96px, 12vw, 160px)`.
- Rayons : `--radius: 0`. Un seul token, le site n'a aucun arrondi ; un autre univers le changera.
- Ombres : `--shadow: none`. Aucune ombre portée nulle part (le relief vient des filets et du décalage de la copie carbone).
- Largeurs : `--w-container: 1360px` ; `--w-prose: 64ch` ; `--w-note: 36ch` ; `--w-spine: clamp(88px, 7.5vw, 128px)` (le dos du dossier) ; `--w-slip: 36ch` (bordereau de boot).
- Gouttières : `--gutter: 24px` (≥ 1024), `16px` en dessous.
- Z-index : `--z-base 0` · `--z-plate 10` (planche survolée) · `--z-nav 40` · `--z-sheet 50` (INDEX mobile plein écran) · `--z-boot 60`.
- Pointeur et survol : les comportements « pas de survol » sont conditionnés à `(hover: none)`, les allègements de peinture à `(pointer: coarse)`, séparément.

### 2.6 Durées et courbes

| token | valeur | GSAP | emploi |
| --- | --- | --- | --- |
| `--t-1` | 80 ms | `steps(2)` | retour en repère |
| `--t-2` | 120 ms | `steps(3)` / `power1.out` | hors-repérage, focus d'un champ |
| `--t-3` | 240 ms | `power2.out` | survols, commutation (fondu de contenu 120-160 ms) |
| `--t-4` | 480 ms | `power2.out` | tirage d'une fiche |
| `--t-5` | 640 ms | `power2.out` / `power3.out` | tirage d'un aplat, composition d'un titre (560 ms) |
| `--t-trace` | 1400 ms | `power1.inOut` | ligne principale (branches 500-600 ms) |
| `--t-stamp` | 180 ms | `power4.out` | tampon |
| `--t-stretch` | 700 ms | `expo.inOut` | la perforation du bordereau devient le rail |

Courbes CSS équivalentes (pour les transitions non GSAP) : `--e-out: cubic-bezier(0.215, 0.61, 0.355, 1)` (≈ power2.out), `--e-inout: cubic-bezier(0.645, 0.045, 0.355, 1)`, `--e-steps-3: steps(3, end)`, `--e-steps-2: steps(2, end)`, `--e-switch: steps(1, end)`. Aucune courbe élastique ni rebond sur le site.

---

## 3. Grille et rythme éditorial

- Conteneur 1360 px centré, 12 colonnes à partir de 1024 px (gouttière 24 px), 6 colonnes de 640 à 1023 px, 4 colonnes sous 640 px (gouttière 16 px). Les spans sont des classes `span-1 … span-12` et `start-1 … start-12` (pas de props booléennes) ; sur mobile toute cellule retombe à pleine largeur sauf mention contraire dans la section.
- Le hero est le seul à sortir du conteneur : son dos (bande Sage) est collé au bord droit du viewport ; ses repères de repérage sont aux deux coins hauts de la *feuille* (le viewport), ceux du footer aux deux coins bas. La feuille d'épreuve est ouverte en haut et fermée en bas : c'est le seul cadre du site.
- Chaque section = un composant `Section` : rythme vertical `--section-y`, en-tête `SectionHeader` à quatre slots (numéral en bannière dot-matrix / h2 bas de casse / lead Inter / aside : le cartouche « FOLIO 0n/07 · … · DESK 7 » en mono-label aligné sur les colonnes 9-12). Les numéraux et cartouches répétés sont `aria-hidden` (le h2 porte le sens). Le cartouche est tenu à 2 lignes maximum.
- Masses : une seule masse claire par écran au plus (le dos, un aplat de directive, la feuille du formulaire, la fiche Paper du registre) ; tout le reste est de l'encre sur Obsidian. Les planches ne se touchent que par des filets Obsidian de 1 px, jamais par un dégradé.
- Espace négatif planifié par section (il est dans les wireframes du §4 : « vide » y est une instruction, pas un oubli).
- Ordre des folios : 00 bordereau · 01 hero · 02 Variant Registry · 03 Branch Survey (Explorer) · 04 Directives · 05 Declaration (Report) · 06 Colophon (footer) ; sept planches, le bordereau comptant pour la 00. La nav numérote « 02 Registry · 03 Explorer · 04 Directives · 05 Report » et le footer indexe les sept.

## 4. Les sept sections

Légende des wireframes : `|` séparateur de colonnes de grille, `[ ]` zone, `(vide)` espace négatif voulu. Toutes les proportions desktop sont données pour 1360 px / 12 colonnes ; « mobile » signifie < 640 px (358 px utiles).

### 4.1 Section 01 — System Boot (« TRANSMISSION SLIP », folio 00)

**Nature** : un bordereau de transmission (ticket de téléscripteur), pas un écran de chargement. Il est **rendu côté serveur, déjà imprimé**, et ne bloque rien : la page complète est dessous. Durée maximale 1,8 s desktop, 1,4 s sur `(pointer: coarse)`, passable à tout instant.

**Garde avant première peinture** (évite le flash signalé par le jury et le mismatch d'hydratation) : un `<script>` inline dans le `<head>` (`app/layout.tsx`, avant tout CSS bloquant) exécute :

```js
(function(){var h=document.documentElement;try{
h.dataset.motion = matchMedia('(prefers-reduced-motion: reduce)').matches || localStorage.getItem('chronos:motion')==='off' ? 'reduce' : 'ok';
h.dataset.boot = (h.dataset.motion==='ok' && !sessionStorage.getItem('chronos:boot')) ? 'due' : 'seen';
}catch(e){h.dataset.motion='ok';h.dataset.boot='seen'}})();
```

CSS : `html:not([data-boot="due"]) .boot { display: none }`. Sans JS l'attribut n'existe pas → pas de bordereau ; reduced-motion → pas de bordereau ; déjà vu dans la session → pas de bordereau ; dû → visible dès la première peinture. `<html suppressHydrationWarning>`. À la fin (ou au SKIP) : `sessionStorage.setItem('chronos:boot','1')`, `data-boot="seen"`.

**Composition desktop** (overlay plein viewport Obsidian, `position: fixed`, `--z-boot`) :

```
| 1   2   3   4 |      5 … 12 (vide, volontairement)                     |
  ┌ 96px du haut
  TVA · CHRONOS-4 · TRANSMISSION SLIP              ← mono-label Sage
  FOLIO 00/07 · DESK 7 · SPECIMEN                  ← mono-label Sage
  ───────────────────────────── (filet 1px Sage, 36ch)
  mounting records ........... ok                  ← <ol> mono-data, clé Paper, valeur Sage
  syncing sacred line ........ ok
  checking variance .......... 0.000               ← valeur Gold (seule donnée temporelle)
  clearance .................. general
  registering folio .......... ▪ REGISTERING        ← ligne d'état (carré CSS Sage + mot Paper)
  ─────────────────────────────
  integrity ░░░░░░░░░░░░░░░░░░░░░░░░   0%          ← barre ASCII du kit, 24 colonnes (voir ASCII)
  - syncing                                        ← spinner("line") du kit, retiré à la fin
                                   [REGISTERED]    ← tampon, caché jusqu'au beat 2
  SKIP ›                                           ← <button>, souligné filet 1px à 4px
  - - - - - - - - - - - - - - - - - -              ← perforation : <hr class="perforation"> mono Sage
```

Le reçu occupe les colonnes 1-4 (largeur `--w-slip` 36ch), collé à gauche à 96 px du haut. Tout le reste est vide.

**Mobile** : même reçu, colonnes 1-4 (pleine largeur, gouttières 16 px), à 64 px du haut ; la barre garde 24 colonnes à `font-size: 11px` (≈ 158 px) ; **SKIP** devient un bouton de 48 px pleine largeur épinglé en bas (zone du pouce), filet au-dessus.

**Typographie** : tout en IBM Plex Mono. En-têtes mono-label 0.75rem Sage ; diagnostics mono-data 0.8125rem lh 1.5 ; SKIP mono-label Paper. Points de conduite = caractères « . » réels (grille de chasse fixe), pas une bordure.

**ASCII** (fichier `components/ascii/pieces/boot.ts`, `"use client"`) :

- `progressBar({ label: "integrity", value: () => progress.current, style: "blocks", width: 24, percent: true })` — mesuré : 39 colonnes × 1 rangée, palette GitHub de 12 couleurs → **pièce colorée, donc `mono` obligatoire** sur `<Ascii>` pour rester en `<pre>` dans l'encre Sage. `value` est une fonction lue à chaque image : la barre suit la progression réelle (polices prêtes, hydratation, pièces du hero prêtes), pas un minuteur ; saut final garanti à 100 % à t ≤ 1,2 s. Image à t = 0 rendue côté serveur par `piece.default()(0)` dans un `<pre role="img" aria-label="integrity 0%">` (valeur initiale 0), remplacée au montage.
- `spinner("line", { label: "syncing" })` — 9 × 1, ASCII pur (`- | / \`), `mono`, retiré au beat 2. (Pas `"dots"` : il dessine en braille.)
- Les lignes de diagnostic sont du DOM (lisibles par lecteur d'écran, présentes sans script). La pièce de bibliothèque `boot-log` existe (catégorie ui) mais n'est pas utilisée : ses options ne sont pas documentées localement.

**Couleur** : Obsidian plein ; Paper clés et SKIP ; Sage labels, filets, perforation, barre, spinner ; Gold sur la seule valeur « 0.000 ». Ni orange ni brun.

**Beats** (un `gsap.context()` dans `BootSlip`, revert au démontage ; tout sous `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`) :

1. **0 → 1,2 s — Relevé** : le reçu est déjà imprimé ; seule la barre se remplit (progression réelle tweenée vers 1, `power1.inOut`, `snap: 0.01`) et le spinner tourne.
2. **1,2 s — Commutation** : la ligne d'état permute en `steps(1)` : « ▪ REGISTERING » → « ▪ REGISTERED » (mot Paper, carré Sage) ; le spinner est retiré ; **Tampon** « REGISTERED » (Sage, rotation −6°, scale 1.15 → 1, opacity 0 → 1, 180 ms `power4.out`, encre 100 % une image puis 92 %) frappe à droite de la barre.
3. **1,35 → 1,65 s — Continuité (desktop uniquement)** : la perforation `- - - -` se résout en filet plein 1 px Sage (swap de classe), puis **s'étire** jusqu'à la largeur du rail du hero et descend à sa position mesurée (`getBoundingClientRect()` du `<path>` principal du hero, déjà rendu dessous) : `scaleX` + `y`, 700 ms `expo.inOut`, `transform-origin: left`. Pendant ce temps les textes du reçu fondent (opacity 250 ms).
4. **1,65 → 1,8 s** : l'overlay fond (opacity 200 ms) et est démonté ; le hero commence son Tracé exactement là où la ligne s'est posée (son `<path>` est à `dashoffset` 1, le filet de l'overlay le remplace visuellement pendant 1 image, puis le Tracé part de gauche).
   Mobile : pas d'étirement (la timeline y est verticale) ; l'overlay fond en 200 ms après le tampon, total ≤ 1,4 s.

SKIP (bouton, Entrée/Espace/Échap, clic/tap ; **jamais « n'importe quelle touche »**, pour ne pas avaler Tab et les raccourcis d'assistance) : saute au beat 4 en 200 ms. Le bouton SKIP est le premier élément focalisable de la page tant que l'overlay existe ; l'overlay n'est **pas** `role="dialog"` (il n'est pas bloquant), il est `aria-label="Transmission slip"` et `aria-live="off"`.

Reduced-motion / Motion off / sans JS : le bordereau n'est jamais monté ; l'indicateur « ▪ TIMELINE NOMINAL » de la nav en est la trace persistante.

**Contenus** (dans `data/boot.ts`) :

```ts
export const bootSlip = {
  header: ["TVA · CHRONOS-4 · TRANSMISSION SLIP", "FOLIO 00/07 · DESK 7 · SPECIMEN"],
  lines: [
    { key: "mounting records", value: "ok" },
    { key: "syncing sacred line", value: "ok" },
    { key: "checking variance", value: "0.000", tone: "temporal" },
    { key: "clearance", value: "general" },
  ],
  state: { pending: "REGISTERING", done: "REGISTERED" },
  bar: { label: "integrity", width: 24 },
  skip: "SKIP ›",
} as const;
```

### 4.2 Section 02 — Hero / Sacred Timeline (folio 01, LA section)

**Composition desktop** (grille 12, conteneur 1360, `min-height: 100svh` — jamais `height`, et le display est borné à `13svh` par ligne) :

```
┼ repère ⊕ (coin haut gauche de la feuille)                             repère ⊕ ┼
| nav 64px : ◻ CHRONOS   |     02 Registry · 03 Explorer · 04 Directives · 05 Report | ▪ TIMELINE NOMINAL · T+0.000 | MOTION ON |  DOS
|─────────────────────────────────────────────────────────────── filet 1px Sage ──|  (bande
| 1-4 : DIV. 07 — TEMPORAL RECORDS                                                 |   Sage
|       SYSTEM CHRONOS-4                                                           |   verticale
|       CLEARANCE GENERAL                     (vide)                               |   --w-spine,
|                                                                                  |   pleine
| 1-9 : EVERYTHING                                           (ligne 1 : court AU-DESSUS de la figure)   hauteur
|       IS UNDER                               | 9-11 : [ FIGURE 56×24   ]        |   du hero,
|       CONTROL.                               |        [ gravure 2 encres ]        |   texte
|                                              |        Fig. 01 — singularity on the line · 56×24  |   tourné
| 1-5 : FILE NOTE 01 ─────                                                         |   90°)
|       Every branch is observed. Every deviation is filed.                         |
|       The present is in order.                      (vide)                        |
|       Replay the entry sequence                                                    |
|                                                                                  |
|                               (vide : ≈ 18 % de la hauteur)                      |
|                                                                                  |
| 1-10 : TIMELINE SVG 160px ─────┼──╱──────╱───▣ nexus ─────╱──────────── (s'arrête col. 10)
|  ▌[ ENTER THE SYSTEM → ]  CONSULT THE ARCHIVES   ← stations posées SUR la ligne      |
```

Détails :

- **Nav** (hauteur 64 px, filet 1 px Sage dessous ; pas de `position: sticky` : la nav n'est pas collante, le site défile naturellement) : à gauche le monogramme (cercle dans un carré, 20 px, trait 1 px Sage, SVG inline `aria-hidden`) + « CHRONOS » (Space Grotesk 500 1rem) ; au centre-droit les 4 entrées numérotées en mono-label, liens d'ancre réels ; à droite le `StatusIndicator` « ▪ TIMELINE NOMINAL · T+0.000 » (carré 6 px CSS, **jamais un rond, jamais un glyphe**, mot Paper, relevé `--t-mono-readout` à 1rem tabulaire) puis le bouton « MOTION ON » (mono-label, `aria-pressed`, bascule globale persistée dans `localStorage` `chronos:motion`).
- **Le dos** (`EdgeBand` configuré) : bande Sage verticale collée au bord droit du viewport, largeur `--w-spine`, pleine hauteur du hero, texte tourné à 90° (`writing-mode: vertical-rl; transform: rotate(180deg)`, lecture de bas en haut) en mono-label Obsidian : « CHRONOS / TVA TERMINAL — DOSSIER 00-07 — GENERAL CIRCULATION — SPECIMEN » ; en bas le folio « 01/07 » en `--t-folio`. Vérifier qu'il tient à 768 px de haut (il tient : ≈ 62 caractères × 9 px ≈ 560 px).
- **Division** colonnes 1-4, trois lignes mono-label Sage.
- **Titre** colonnes 1-9, `--t-display`, fer à gauche, trois lignes forcées (`<h1>` avec trois `<span class="line">` dans des masques `overflow: hidden`), démarrant à 18vh. La première ligne « EVERYTHING » court au-dessus de la figure ; les lignes 2-3 sont plus courtes et la laissent respirer : typo et illustration s'emboîtent.
- **Figure** colonnes 9-11 (≈ 320 px) : la gravure, deux `<pre class="art">` superposés dans une cellule à `container-type: inline-size`, bord haut calé sur la hauteur de capitale de « IS UNDER » (`margin-top` = position de la ligne 2 : calculé en CSS par `calc(var(--display-lh) * 1)` sur la même grille de lignes), légende dessous en `--t-mono-deco` Sage : « FIG. 01 — SINGULARITY ON THE LINE · 56×24 CELLS ».
- **Sous-titre** colonnes 1-5 (max 36ch), précédé du label « FILE NOTE 01 » et d'un filet 1 px Sage de 48 px ; Inter `--t-body` Paper à 92 % ; dessous le bouton texte « Replay the entry sequence » (mono-label, souligné, visible après la séquence, toujours visible quand Motion est off : c'est la façon volontaire de voir l'animation).
- **Timeline SVG** en bas du hero, hauteur 160 px, colonnes 1-10 (elle s'arrête avant le dos : Gold sur Sage = 1,04:1) : `viewBox 0 0 1000 160`, ligne principale Gold 1.5 px à y = 112 (70 %), cinq ramifications Sage 1 px partant de x = 120 / 260 / 430 / 620 / 760 (sur 1000) et montant à 20-35° sur 40-120 px de haut, terminées par un cercle vide r = 3 ; marqueur nexus à x = 620 (62 %) : carré creux 8 px Sage au repos, plein orange en variance. Les deux **stations** sont posées sur la ligne (la ligne passe derrière, un `rect` Obsidian de 4 px de marge la coupe) : « ENTER THE SYSTEM → » (rectangle plein Paper, texte Obsidian mono-label, 48 px de haut, `href="#explorer"`, précédé d'une **barre d'action orange 4 px × 48 px sur l'Obsidian**, à 8 px à gauche du rectangle : le seul orange au repos de l'écran) colonnes 1-2 ; « CONSULT THE ARCHIVES » (filet 1 px Paper, texte Paper, `href="#registry"`) colonnes 3-4.
- Les boutons des marqueurs : `<button class="nexus" aria-pressed="false">Simulate a variance event</button>` positionné en absolu sur le marqueur (44 × 44 px, libellé visuellement masqué + tooltip mono au focus).
- Espace négatif : tout le centre-bas entre le sous-titre et la timeline reste vide ; rien à droite de la figure sous la légende.

**Mobile** (ordre DOM, le titre enveloppe l'instrument) :

```
| nav : ◻ CHRONOS            ▪ NOMINAL · T+0.000     INDEX |   ← INDEX ouvre une feuille Sage plein écran (7 planches + MOTION)
| bande Sage 44px : TVA TERMINAL · DOSSIER 00-07 · F.01/07   |   ← le dos devient bandeau
| DIV. 07 — TEMPORAL RECORDS · CHRONOS-4 · CLEARANCE GENERAL  |
| EVERYTHING                                                  |
| IS UNDER                                                    |
| [ FIGURE 48×20 pleine largeur, crop() de la même pièce ]    |   ← entre les lignes 2 et 3
| CONTROL.                                                    |
| ┃ FILE NOTE 01                                               |   ← filet Gold VERTICAL à x = 24px,
| ┃ Every branch is observed…                                  |      du sous-titre jusqu'aux coupons,
| ┃──╲ Simulate a variance event (rangée 48px, aria-pressed)   |      branches Sage partant vers la droite
| ┃──╲ [ ▌ENTER THE SYSTEM → ]  coupon pleine largeur, bord haut perforé (pointillé)
| ┃──╲ [ CONSULT THE ARCHIVES ] coupon
```

Pas de `100svh` forcé ; figure `max-width: 100%`, 48 × 20 cellules (`crop(piece, { x: 4, y: 2, cols: 48, rows: 20 })`, mesuré OK) ; séquence raccourcie (titre 420 ms, tracé 900 ms) ; horloge de la gravure à 12 fps.

**Typographie** : titre `--t-display` Paper ; sous-titre `--t-body` ; division, nav, dos, états `--t-mono-label` ; folio `--t-folio` ; actions mono-label tracking 0.1em ; légende de figure `--t-mono-deco` (aria-hidden, la figure a son `aria-label`).

**ASCII — la gravure « singularity on the line »** (`components/ascii/pieces/etching.ts`, `"use client"`, deux pièces texte du même champ, **zéro canvas**) :

```ts
import { TAU, field, crop, smoothstep } from "ascii.rest/kit";

const spec = { cols: 56, rows: 24, period: 12, ramp: " .,:;-=+*#", dither: true, invert: false, still: 3, fps: 24,
  options: { variance: 0 } } as const;

/** parts of the picture at one cell; variance 0 = nominal, 1 = a branch peels off the line and the ring tears */
const parts = (x: number, y: number, at: { phase: number; r: number; a: number; options: { variance: number } }) => {
  const w = TAU * at.phase, v = at.options.variance, r = at.r, a = at.a;
  const line = Math.exp(-((y * 16) ** 2));                                        // the sacred line, horizontal ridge
  const core = Math.exp(-r * r * 10);                                             // dense core
  const gap = v * Math.exp(-(((a + 0.6) * 2.2) ** 2));                            // the ring tears at the branch's exit
  const ring = Math.exp(-(((r - 0.55) * 12) ** 2)) * (0.55 + 0.45 * (0.5 + 0.5 * Math.sin(3 * a - w))) * (1 - gap);
  const arms = 0.10 * (0.5 + 0.5 * Math.sin(2 * a + 8 * r - w)) * Math.exp(-r * 1.1);  // two faint arms
  const grain = 0.05 * Math.sin(x * 37 + w) * Math.sin(y * 29 - w);               // plate grain
  const branch = v * Math.exp(-(((y + v * 0.45 * (x - 0.15)) * 16) ** 2)) * smoothstep(0.15, 0.35, x); // peels up-right
  return { line, core, ring, arms, grain, branch };
};

export const etchingLine = field({ name: "etching line", note: "the sacred line through a singularity, gold ink", ...spec },
  (x, y, t, at) => { const q = parts(x, y, at); return q.line < 0.35 ? null : Math.min(1, q.line + 0.3 * q.core); });

export const etchingField = field({ name: "etching field", note: "a singularity on the line, sage ink", ...spec },
  (x, y, t, at) => { const q = parts(x, y, at); if (q.line >= 0.35) return null;
    const v = Math.max(q.core, q.ring, q.branch) + q.arms + q.grain; return v < 0.04 ? null : v; });

export const etchingLineMobile = crop(etchingLine, { x: 4, y: 2, cols: 48, rows: 20 });
export const etchingFieldMobile = crop(etchingField, { x: 4, y: 2, cols: 48, rows: 20 });
```

Vérifié le 24/10 : les deux pièces se construisent (56×24, loop 12, still 3, `palette: none` = pièces texte), `default({ variance: 1 })` fonctionne, une image des deux encres coûte 0,3 ms. Rendu : deux `<pre class="art">` dans la même cellule de grille (`display: grid; > * { grid-area: 1 / 1 }`), le premier en `color: var(--c-gold)` (ligne), le second en `color: var(--c-sage)` (champ) ; `font-size: clamp(7px, 100cqw / 33.6, 12px)` (56 colonnes × 0,6 em), hauteur = 24 × 1,2 × font-size (réservée par le contenu lui-même : la première image est dans le HTML). Le `<pre>` or porte `role="img" aria-label="Etching of a singularity on the sacred line; a branch detaches under variance"`, le `<pre>` sauge est `aria-hidden`.

**Ces pièces ne sont pas jouées par `<Ascii>`** mais par `AsciiClock` (§6.3) : `const frames = { 0: [etchingLine.default({ variance: 0 }), etchingField.default({ variance: 0 })], 1: [...variance 1] }`, une boucle rAF plafonnée à 24 fps (12 sur mobile) écrit `pre.textContent = frame(clock.t)` ; `clock.t` est un objet que GSAP tweene (lecture normale : `t += dt`), coupé par `IntersectionObserver` hors écran, figé à `still` (3 s) en reduced-motion et Motion off. Première image serveur : `etchingLine.default({ variance: 0 })(3)` et `etchingField.default({ variance: 0 })(3)` rendues dans un Server Component (`AsciiStill`) : le hero est complet sans JS et sans CLS. Repli si la construction du kit lève (`safePiece`) : les deux frames figées committées dans `public/ascii/etching-line.txt` et `etching-field.txt` (générées au build par `snapshot(piece, 3).text`). Recette de repli artistique si le champ déçoit en revue : `ripple({ drops: 1, speed: "slow", cols: 56, rows: 24 })` en `mono` (mesuré OK, une encre).

**Couleur** : Obsidian fond ; Paper titre, sous-titre, station pleine ; Sage dos, nav, filets, branches, division, états, encre du champ ; Gold ligne principale SVG + encre de la ligne gravée ; Orange au repos : la barre d'action de 4 px seulement ; en anomalie : double du titre, branche nexus, marqueur, carré d'état.

**Beats** (timeline GSAP unique `heroEntry`, démarrée à la fin du boot ou, sans boot, dès `document.fonts.ready` plafonné à 300 ms ; pré-masquage des éléments animés par `html[data-motion="ok"] [data-entry] { opacity: 0 }` posé avant la première peinture, avec une sécurité CSS `animation: entry-safety 0s 3s forwards` qui les rend visibles si GSAP ne tournait jamais) :

1. **0 ms — Composition** : les 3 lignes du titre sortent de leur masque (`yPercent 100 → 0`, 560 ms, `power3.out`, stagger 70 ms).
2. **+200 ms** : métadonnées (division, dos, nav) `opacity 0 → 1` + `y 8 → 0`, 320 ms, `power2.out`, stagger 50 ms.
3. **+500 ms — Tracé** : la ligne Gold se dessine de gauche à droite (`pathLength="1"`, `stroke-dashoffset 1 → 0`, 1400 ms, `power1.inOut`) ; chaque branche démarre quand la ligne atteint son origine (délai = position × 1400 ms, 600 ms chacune, `power2.out`) ; les deux stations et le marqueur nexus apparaissent (opacity 240 ms) quand la ligne passe sous eux.
4. **+900 ms** : les deux `<pre>` de la gravure passent de `opacity 0 → 1` en 400 ms (ils étaient dans le HTML, masqués par `[data-entry]`) et l'horloge démarre à t = 3 s.
5. **+1 900 ms — première variance scriptée** : quand la ligne atteint le marqueur nexus, HORS-REPÉRAGE (§5.2) tenu 600 ms, retour en repère, tampon REGISTERED, relevé à T+0.000. Ensuite le bouton « Replay the entry sequence » apparaît.

Reduced-motion / Motion off : tout est en place à l'arrivée (CSS = état final, aucun `from` posé), timeline entièrement dessinée (`stroke-dashoffset` n'est jamais écrit dans le HTML), gravure figée à `still`, la variance reste un changement d'état instantané déclenché par le bouton.

**Contenus** (`config/site.ts` et `data/hero.ts`) : titre « EVERYTHING / IS UNDER / CONTROL. » ; division « DIV. 07 — TEMPORAL RECORDS / SYSTEM CHRONOS-4 / CLEARANCE GENERAL » ; dos « CHRONOS / TVA TERMINAL — DOSSIER 00-07 — GENERAL CIRCULATION — SPECIMEN » ; label « FILE NOTE 01 » ; sous-titre « Every branch is observed. Every deviation is filed. The present is in order. » ; actions « ENTER THE SYSTEM → » (#explorer) et « CONSULT THE ARCHIVES » (#registry) ; états « TIMELINE NOMINAL » / « VARIANCE DETECTED » ; cartouche « FOLIO 01/07 » / « FOLIO 01/07-B » ; bouton « Simulate a variance event » ; bouton « Replay the entry sequence » ; légende « FIG. 01 — SINGULARITY ON THE LINE · 56×24 CELLS ».

### 4.3 Section 03 — Variant Registry (folio 02)

**Nature** : une planche de fiches de registre composée à la main (trois rangs), pas une grille automatique. Huit fiches, cinq représentations, un seul contrat de données.

**Composition desktop** :

```
| 1 … 7 : [02 en bannière tall 12×7]  Variant Registry (h2)        | 9 … 12 : FOLIO 02/07 · VARIANT REGISTRY · DESK 7
|         lead Inter 2 lignes                                        |          ONGLETS d'index (liste verticale mono) :
|                                                                    |          [ALL 08] ANOMALIES 03 · PROJECTS 03 · ARCHIVE 02
| rang 1 (340px min) : [ VR-0117 diagram  6 col ] [ VR-0455 type 3 ] [ VR-0203 pattern 3 ]
| rang 2             : [ VR-0318 etching 4 ] [ VR-0609 readings 4 ] [ VR-0740 etching 4 ]
| rang 3             : [ VR-0022 type 6 (fond Paper) ] [ VR-0088 diagram 6 ]
```

Les trois rangs **sont** les trois filtres : ANOMALIES = rang 1 (6+3+3), PROJECTS = rang 2 (4+4+4), ARCHIVE = rang 3 (6+6), ALL = les trois. Une vue filtrée est donc toujours une composition complète ; la taille (`plate: "wide" | "tall" | "square"`) est une donnée de la fiche. Gouttière 24 px, rangées `minmax(340px, auto)`, `grid-auto-flow: dense` par sécurité.

Onglets d'index (comme les onglets latéraux d'un dossier) : `<button aria-pressed>` en mono-label avec compteurs réels, onglet actif inversé (fond Sage, texte Obsidian), cibles 44 px ; région `aria-live="polite"` annonçant « 3 records shown ». Commutation sèche (§5.1 n° 6) : aucun Flip.

**Anatomie d'une fiche** (`<article>`, pas de coins arrondis, pas d'ombre, pas de fond sauf VR-0022) :

```
──────────────────────────────── filet haut 1px Sage (3px au survol)
VR-0117                      ▪ ANOMALY        ← mono-label : identifiant (inversé Sage au survol) · statut (carré CSS + mot Paper)
[ PLANCHE : ratio 16/9 wide · 4/5 tall · 1/1 square ]
Loom Drift                                    ← h3 Space Grotesk
VARIANCE · SECTOR 7                           ← catégorie mono-label Sage
A branch that will not settle; its reading drifts   ← Inter small, 2 lignes max
by 0.3 σ every cycle and is refiled each morning.
Open file →                                   ← lien réel vers /registry/vr-0117 ; toute la fiche cliquable via ::after
```

Le lien étendu (`::after` couvrant l'article) ne contient aucun autre élément interactif : le bouton « PLAY » (reduced-motion) des planches gravées est placé **au-dessus** du lien (`z-index: 2`, `position: relative`), dans le cartouche de la planche.

**Mobile** : une colonne, ordre conservé, ratios conservés ; onglets en rangée de 4 puces mono-label sous l'en-tête (tiennent en 358 px à 0.75rem avec compteurs) ; zone « Open file » de 48 px ; pas de survol : les planches vivantes s'animent à 60 % de visibilité et se mettent en pause en sortant (comportement natif des pièces hors écran).

**Typographie** : h2 `--t-h2` ; noms `--t-h3` ; identifiant, statut, catégorie, onglets `--t-mono-label` ; descriptions `--t-small` ; compositions typographiques des planches Space Grotesk 500 `clamp(4rem, 12vw, 11rem)` rognées.

**Les cinq représentations** (`representation` discriminant dans `data/variants.ts`, un composant par type dans `components/chronos/variant-registry/plates/`, jamais le même composant recoloré) :

1. **`diagram`** (VR-0117, VR-0088) — SVG inline `viewBox 320×180`, ligne principale Gold 1.5 px à y = 110, 1 à 4 branches Sage 1 px définies par `{ at: 0.3, angle: -28, length: 0.45, pruned?: true }`, marqueurs carrés 6 px, graduations mono tous les 10 %. La branche anormale de VR-0117 est Orange ; les branches `pruned` de VR-0088 sont en pointillé 4-3 terminées par un trait de coupe perpendiculaire 8 px **Sage** (pas Brown : 2,6:1). Révélation : Tracé 600 ms ; survol : les branches se prolongent (dashoffset partiel → complet, 240 ms).
2. **`type`** (VR-0455 « Ø-14 », VR-0022 « 0022 ») — texte seulement : le code en Space Grotesk 500 `clamp(4rem, 12vw, 11rem)` rogné par la planche (débord à droite et en bas, `overflow: hidden`), une seconde ligne mono tournée à 90° le long du bord gauche (« RESIDUE SAMPLE / 3 OF 3 »), un filet Gold court de 48 px sous la ligne de base (sur Obsidian ; sur la fiche Paper VR-0022 le filet est Obsidian 2 px). Survol : double Sage décalé de 2 px (hors-repérage amical) ; sur Paper, double Brown.
3. **`etching`** (VR-0318, VR-0740) — une recette du kit par fiche, 36 × 14, `<pre class="art">` en encre Sage, au repos une **image fixe** (`AsciiStill` à `t = 3`), au survol/focus (desktop) ou à 60 % de visibilité (tactile) `AsciiLive` monte `<Ascii piece mono options={{ fps: 24 }}>` et reste vivante tant que la fiche est en vue (la pièce se met en pause hors écran d'elle-même) ; garde de 120 ms sur `pointerenter` ; cartouche mono-deco en bas à droite : « ETCHING · 36×14 · LOOP 8S ». Reduced-motion / Motion off : image fixe + bouton « PLAY » visible qui passe `options={{ motion: true, fps: 24 }}` à cette seule planche (API documentée : `motion` seulement derrière un bouton de lecture).
4. **`pattern`** (VR-0203) — SVG `<pattern>` plein Sage sur Obsidian : « quarter-circles » (quarts de cercle alternés 40 px) pour VR-0203 ; une cellule manquante (carré Obsidian cerclé Sage 1 px) placée par donnée = l'anomalie dans la trame. Survol : la trame se décale d'une cellule (`patternTransform`, 240 ms). Autres motifs disponibles dans le composant pour un autre univers : « stripes » (45°, pas 24, épaisseur 8), « squares » (carrés concentriques 48 px).
5. **`readings`** (VR-0609) — tableau mono de 4 lectures (`<table>` réel : clé Sage, valeur Paper tabulaire, unité Sage) sous un filet, puis le `sparkline` du kit : `sparkline([2, 3, 2, 5, 8, 4, 3, 3], { label: "variance", width: 24, height: 4 })` (mesuré : 35 × 4, braille, se dessine en 1,5 s puis tient, `still` 1.5), en `mono`, encre Sage, au repos `AsciiStill` à `t = 1.5` (courbe complète) ; la dernière valeur en Gold si elle est la plus haute (ici 3 : non). Le braille exige la police de secours §6.5.

**Couleur** : Obsidian ; Paper noms et descriptions ; Sage filets, identifiants, planches, trames, branches ; Gold ligne principale des diagrammes et filet des compositions ; Orange : le carré des statuts ANOMALY (VR-0117 rang 1, VR-0740 rang 2 : ≤ 1 par rang) et la branche divergente de VR-0117 ; VR-0022 : fond Paper, texte Obsidian, hachures Brown (4,56:1), statut ARCHIVED en Obsidian avec carré ⊠ Brown.

**Beats** :

1. **Tirage** à l'entrée de la planche (ScrollTrigger `once`, 20 % visible, uniquement pour les fiches sous le pli à l'hydratation) : chaque fiche révélée par `clip-path: inset(0 100% 0 0) → inset(0)`, 480 ms `power2.out`, décalage 60 ms en ordre de lecture ; **3 fiches au plus par viewport en clip-path**, les suivantes en opacity ; `will-change: clip-path` posé par le tween et retiré à `onComplete` ; sur `(pointer: coarse)` : opacity 200 ms.
2. **Tenue** au survol/focus-within (160-240 ms `power2.out`, `(hover: hover)` seulement) : filet haut 1 → 3 px, identifiant inversé, la planche vit (voir chaque représentation), le soulignement de « Open file → » s'étend.
3. **Commutation** au filtre : onglet actif permute à 0 ms (`steps(1)`), fiches sortantes `opacity 0` + `scale 0.98` 160 ms, entrantes `opacity 1` 240 ms, aucune animation de position ; tuer les ScrollTriggers de Tirage avant de filtrer.
   Reduced-motion : aucune révélation, filtre instantané, planches fixes avec PLAY.

**Contenus** (`data/variants.ts`, type `VariantRecord` §8.3) :

| id | plate | representation | name | status | category | description (Inter, 2 lignes) |
| --- | --- | --- | --- | --- | --- | --- |
| VR-0117 | wide | diagram (branche orange à 0.62, −28°) | Loom Drift | ANOMALY | VARIANCE · SECTOR 7 | A branch that will not settle. Its reading drifts by 0.3 σ every cycle and is refiled each morning. |
| VR-0455 | tall | type (« Ø-14 », légende « RESIDUE SAMPLE / 3 OF 3 ») | Residue Sample Ø-14 | REVIEW | VARIANCE · DESK 7 | Temporal residue recovered from a pruned branch. Inert, catalogued, re-weighed weekly. |
| VR-0203 | tall | pattern (quarter-circles, cellule manquante en 3;2) | Cell Archive K | NOMINAL | VARIANCE · ARCHIVE K | One cell of the archive trame is missing. The missing cell has itself been filed. |
| VR-0318 | square | etching `rings({ to: "in", speed: "slow", scale: "large", cols: 36, rows: 14 })` | Quiet Vortex | NOMINAL | PROJECT · OBSERVATION | A slow collapse observed from Desk 7. Nothing enters, nothing leaves, nothing changes. |
| VR-0609 | square | readings (lectures : DRIFT 0.08 u · DEVIATION 0.42 σ · CYCLES 12 · LAST 3) | Desk 7 Readings | REVIEW | PROJECT · INSTRUMENT | Eight readings taken at the hour. The instrument is believed accurate to its clearance. |
| VR-0740 | square | etching `ripple({ drops: 2, cols: 36, rows: 14 })` | Nexus Ripple | ANOMALY | PROJECT · CONTAINMENT | Two drops on a still surface where there should be none. Contained; origin under review. |
| VR-0022 | wide | type (« 0022 », fond Paper, légende « FOLIO 1962 / COPY 2 ») | Folio 1962 | ARCHIVED | ARCHIVE · DESK 7 | The first folio filed by this desk. Kept for the record. It describes a calm year. |
| VR-0088 | wide | diagram (3 branches pruned, traits de coupe) | Pruned Sector 4 | ARCHIVED | ARCHIVE · SECTOR 4 | Three branches cut at the line, in the correct order. Sector 4 reads nominal since. |

Pages de détail : une seule route `app/registry/[id]/page.tsx` (`generateStaticParams` depuis `data/variants.ts`) : la planche reprise en grand (etching en 48 × 16 : nouvelle instance `rings({ ..., cols: 48, rows: 16 })`, pas un zoom CSS), métadonnées en `<dl>` mono (origin, class, deviation, disposition, related branch), description, lien « View branch in explorer → » (`/#explorer?branch=BR-0419` géré par le hash), lien retour « ‹ Registry ». Même en-tête, même footer, même grammaire ; pas de mise en page unique par fiche.

Règles de contenu testées (`tests/content.test.ts`) : ≤ 1 statut ANOMALY par rang ; jamais deux représentations identiques côte à côte ; chaque rang somme à 12 ; chaque filtre produit des rangs complets ; tout texte de bannière passe `drawable()`.

### 4.4 Section 04 — Timeline Explorer (folio 03, « PLATE IV — BRANCH SURVEY, SECTOR 7 »)

**Nature** : une planche technique dépliante d'un rapport d'État, avec son panneau d'information. Six branches, une nexus.

**Composition desktop (≥ 1024 px)** :

```
| 1 … 3 : PLATE IV — BRANCH SURVEY, SECTOR 7 (mono-label)   | 9 … 12 : FOLIO 03/07 · BRANCH SURVEY · DESK 7
|         Timeline Explorer (h2)                             |
|         All records are fictional specimens.               |
|         LEGEND  ■ filed  □ review  ⊡ pruned  ⊠ nexus  ◌ projected   ← formes + mots, jamais la couleur seule
|         BRANCH : [ BR-0419 ▾ ]  ← <select> natif, visuellement discret, lié à la même sélection
| 1 … 8 : ⊕ PLANCHE SVG 440px, filet Sage, repères ⊕ ────────────────── | 9 … 12 : PANNEAU (filets haut et bas, min-height fixe)
|   ────────■────────□─────────■────────⊠(orange)────□──────────◌──    |  BR-0419               ← mono-readout
|           ╲        ╱         ╲        ╱            ╲         ╱        |  Loom Drift            ← h3 (double orange 2px si active)
|   ligne Gold 1.5px à 55 % ; branches aux x 12/27/44/61/76/90 %      |  ▪ NEXUS EVENT         ← carré orange + mot Paper
|   alternant dessus/dessous, 25-35°, 90-160px, étiquettes au bout      |  DIVERGENCE  +0.42 σ   ← <dl> mono, clé Sage / valeur Paper
|   (positions choisies à la main dans la donnée, jamais superposées)   |  VARIANCE    notable
|                                                                       |  STATUS      anomalous
|                                                                       |  DESK        7
|                                                                       |  note Inter 3 lignes
|                                                                       |  [ trace braille 40×8 ]  FIG. 03.4 — DEVIATION TRACE
|                                                                       |  Open record VR-0117 →
```

Les vrais contrôles : une `<div role="tablist" aria-label="Branches">` de six `<button role="tab" aria-selected aria-controls="branch-panel">` positionnés en absolu sur les marqueurs (mêmes coordonnées en %, 44 × 44 px, roving tabindex, ←/→ et Home/End pour passer d'une branche à l'autre, Entrée/Espace sélectionne) ; nom accessible complet (« BR-0419, Loom Drift, nexus event, anomalous ») ; le SVG est `aria-hidden` ; le panneau est `role="tabpanel"` avec un `aria-live="polite"` interne annonçant « Branch BR-0419 selected ». Le `<select>` de la légende est une seconde commande de la même sélection (alternative honnête). Sélection au clavier bloquée pendant le Tracé initial (1,2 s), pas après.

Marqueurs (typés dans `TimelineSpec`) : `filed` carré plein 8 px Sage ; `review` carré creux ; `pruned` carré creux + trait de coupe ; `nexus` carré barré ⊠ Orange (le seul marqueur orange) ; `projected` carré pointillé, branche en `dasharray 1 6` à 60 %. Branche sélectionnée : passe Gold (temporellement importante), marqueur rempli ; BR-0419 sélectionnée : branche Orange.

**Mobile (< 1024 px)** : la planche tourne et devient un **diagramme-liste** : ligne Gold verticale à x = 32 px, une rangée de 64 px par branche (marqueur sur la ligne, branche courte vers la droite, identifiant + désignation à droite, le `<select>` en tête), tap = accordéon : le panneau s'ouvre sous la rangée (trace braille 32 × 6), aucun panneau ailleurs, aucun défilement horizontal, mêmes boutons (clavier complet), étiquettes dans la rangée (pas dans le SVG).

**Typographie** : h2 `--t-h2` ; titre de planche et légende `--t-mono-label` ; identifiants `--t-mono-data` dans le SVG (`<text>` 12 px, Sage), `--t-mono-readout` dans le panneau ; désignation `--t-h3` ; métadonnées `--t-mono-data` ; note `--t-small` lh 1.5.

**ASCII — la trace de déviation** (`components/ascii/pieces/trace.ts`, vérifiée) :

```ts
import { braille, piece } from "ascii.rest/kit";
export const deviationTrace = piece(
  { name: "deviation trace", cols: 40, rows: 8, fps: 24, still: 2, options: { k: 1, amp: 0.4, phase: 0 } },
  (t, s, ctx) => {
    const { k, amp, phase } = ctx.options as { k: number; amp: number; phase: number };
    const b = braille(s);
    const progress = Math.min(1, t / 2);                       // the trace writes itself in 2 s, then holds
    b.plot((x) => amp * Math.sin(k * x + phase) * Math.exp(0.12 * x), { x0: 0, x1: 6.28 * progress, y0: -1, y1: 1 });
    b.draw();
  });
export const deviationTraceMobile = piece({ ...same, cols: 32, rows: 6 }, sameDraw);
```

Rendu `<Ascii piece={deviationTrace} mono className="art" options={{ k, amp, phase }} label={`Deviation trace of ${id}`} />` : changer `options` **redémarre la pièce à t = 0** (documenté), donc chaque sélection re-trace la courbe en 2 s sans code d'animation. Encre Sage ; Orange tant que BR-0419 est active (`color` CSS du `<pre>`, pas une couleur de pièce). Boîte réservée : 40 × 0,6 em × 8 × 1,2 em à `font-size: 11px` (264 × 106 px). Première image serveur à `t = 2` (`still`). Reduced-motion : la pièce tient `still: 2` = trace complète. Police braille : §6.5 ; repli par flag `site.ascii.trace = "blocks"` : la même pièce dessinée en rampe `eighths` (` ▁▂▃▄▅▆▇█`, 40 × 4), vérifiée.

Pas de `blinking()` : l'état LIVE est un carré orange statique + le mot « LIVE » en Paper dans la ligne de statut (« ▪ NEXUS EVENT · LIVE »).

**Couleur** : Obsidian ; Gold ligne principale et branche sélectionnée ; Sage branches, marqueurs, filets, clés ; Paper désignations, valeurs ; Orange : marqueur ⊠ de BR-0419, sa branche quand elle est sélectionnée, son carré d'état, l'encre de sa trace, le double du titre du panneau ; aucun Brown.

**Beats** :

1. **Tracé** à l'entrée (une fois) : ligne Gold 1200 ms `power1.inOut`, branches 500 ms chacune au passage de la ligne, marqueurs 200 ms opacity ; la branche active par défaut (BR-1962-K, pas la nexus) est tracée en Gold.
2. **Commutation + Tracé** à la sélection : l'ancienne branche repasse Sage à 0 ms (`steps(1)`), la nouvelle se redessine en Gold (Tracé 240 ms), son marqueur se remplit (scale 0 → 1 du carré intérieur, 160 ms), le contenu du panneau fond (`opacity 0 → 1` + `y 6 → 0`, 160 ms) sans changer de hauteur, la trace se réécrit (2 s, native).
3. **Écho hors-repérage** : sélectionner BR-0419 → double orange 2 px du titre du panneau (120 ms `steps(3)`), tenu tant qu'elle est active ; la trace passe à l'encre Orange.
4. Survol d'un marqueur non sélectionné (`hover: hover`) : étiquette Sage 60 % → 100 %, branche Sage → Sage pleine, 150 ms : aperçu sans engagement.
   Reduced-motion : tracé déjà fait, sélection instantanée, double orange statique.

**Contenus** (`data/branches.ts`, type `BranchRecord`) :

| id | x (%) | side | kind | designation | divergence | variance | status | desk | readings (8) | trace k/amp/phase | note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BR-1893-A | 12 | up | pruned | Kepler Residue | +0.12 σ | minor | pruned | 4 | 1 1 2 1 1 0 0 0 | 1.0 / 0.25 / 0 | Cut at the line in 1893-A. The residue is sample Ø-14. |
| BR-1931-C | 27 | down | filed | Archive Fold | +0.05 σ | minor | nominal | 7 | 1 2 1 1 2 1 1 1 | 1.5 / 0.2 / 1.2 | A fold in the archive, read twice, filed once. |
| BR-1962-K | 44 | up | filed | Desk Seven Origin | 0.00 σ | none | nominal | 7 | 2 2 2 2 2 2 2 2 | 0.5 / 0.1 / 0 | Where this desk begins. Reads flat by definition. |
| BR-0419 | 61 | down | nexus | Loom Drift | +0.42 σ | notable | anomalous | 7 | 2 3 2 5 8 4 3 3 | 2.0 / 0.6 / 0.5 | Will not settle. Refiled every morning; see VR-0117. |
| BR-2004-M | 76 | up | review | Quiet Vortex | +0.08 σ | minor | review | 7 | 1 1 1 2 1 1 1 1 | 1.2 / 0.3 / 2.0 | Observed collapse; nothing changes. See VR-0318. |
| BR-2077-R | 90 | down | projected | Projection R | +0.30 σ (est.) | notable | projected | 9 | 0 0 0 1 1 2 2 3 | 2.5 / 0.5 / 1.0 | Not yet on record. Drawn as the desk expects it. |

Étiquettes des branches posées au bout de chaque branche, à la main (`labelOffset` dans la donnée), jamais superposées ; vérifié à 1024 px : les cibles de 44 px aux positions 12/27/44/61/76/90 % ont ≈ 100 px d'écart.

### 4.5 Section 05 — TVA Directives (folio 04)

**Nature** : une suite d'affiches ; la page devient la planche elle-même. Cinq compositions toutes différentes, un règlement en mono, une seule bannière.

**Composition desktop** :

```
| 1 … 7 : [04 tall] TVA Directives (h2)  lead 2 lignes       | 9 … 12 : FOLIO 04/07 · DIRECTIVES · DESK 7
|                                                             |          RÈGLEMENT (6 articles mono-data, retrait négatif 4ch)
| PLANCHE 01 — colonnes 1-12, hauteur clamp(480px, 72svh, 720px), aplat Sage          ⊕ aux 4 coins, cartouche « DIRECTIVE 01 / 05 · ISSUED DESK 7 »
| PLANCHE 02 — colonnes 1-6, carrée, aplat Paper   | PLANCHE 03 — colonnes 7-12, carrée, Obsidian (filet Sage)
| PLANCHE 04 — colonnes 1-8, ratio 4/3, aplat Sage | 9-12 : colonne de texte : le message et le lien « Declare a nexus event → » (#report)
| PLANCHE 05 — colonnes 1-12, bande 21/9, aplat Sage : la bannière « UNDER CONTROL »
```

Les planches se touchent par des filets Obsidian de 1 px (jamais un dégradé). Chaque planche est un `DirectivePlate` : `ground`, `ink`, cartouche, repères, et une composition dédiée (`components/chronos/directives/plate-0n.tsx`) qui définit **deux viewBox** : `portrait` (desktop) et `landscape` (mobile), recomposés et non rognés.

**Les cinq planches** (toutes originales, aucune citation de la série) :

- **01 « OBSERVE BEFORE YOU ACT. »** — Sage, encre Obsidian. Un cercle de diamètre 110 % de la hauteur, centre à x = 78 %, y = 50 %, qui déborde à droite et en haut/bas : trait 2 px, puis plein à partir d'un rayon intérieur de 40 % (l'iris). Titre `--t-h1` sur 3 lignes dans le quadrant bas-gauche (colonnes 1-6), message sur 2 lignes au-dessus du titre : « Nothing is corrected that was not first observed. », cartouche en haut à gauche. Mobile 4/5 : le cercle garde son débord à droite (centre x = 82 %).
- **02 « ONE LINE. NO EXCEPTIONS. »** — Paper, encre Obsidian. Une ligne horizontale **Obsidian 2 px** à 38 % de hauteur (pas d'or sur papier : 1,31:1) ; dessous, 7 branches descendantes à 30° coupées net par un pointillé horizontal Brown à 70 % (la ligne de coupe), chaque branche terminée par un trait perpendiculaire ; titre en 2 lignes dans le quart haut-gauche, le point final seul sur la ligne. Message : « A second line is a filing error. ». Mobile 1/1.
- **03 « FILE EVERYTHING. TWICE. »** — Obsidian, encre Paper. Deux rectangles de 56 % × 68 % de la planche : le premier Paper, le second **Brown plein** décalé de 12 px vers le bas-droite derrière lui (la copie carbone) ; le titre composé À CHEVAL sur le rectangle avant et le fond (lettres Obsidian sur Paper, Paper sur Obsidian, deux calques de texte découpés par `clip-path`) ; deux folios mono « COPY 1 » / « COPY 2 » aux coins bas. Message : « The second copy is the one that survives. ». Mobile 1/1, décalage de 12 px conservé (il fait le sens).
- **04 « REPORT VARIANCE WITHIN THE HOUR. »** — Sage, encre Obsidian, ratio 4/3. Un cadran sans chiffres : quatre arcs de quart (traits 2 px, rayons 46 % et 40 % alternés) autour d'un centre à x = 64 % ; un secteur plein Obsidian de 12 h à 1 h (le délai d'une heure) ; au bout du secteur un **cartouche Obsidian de 24 px portant le seul carré Orange** (12 px) de la section (Orange sur Sage = 2,24:1 interdit, d'où le cartouche). Titre dans le tiers gauche sur 4 lignes ; colonnes 9-12 hors planche : le message « The hour is counted from the first reading, not the second. » et le lien « Declare a nexus event → » (#report), la seule directive qui mène à une action. Mobile 4/3.
- **05 « UNDER CONTROL »** — Sage, bande 21/9 (16/9 sur mobile). La bannière ASCII en encre Obsidian, fer à gauche à la colonne 2, un filet Obsidian 1 px pleine largeur au-dessus et au-dessous ; à droite (colonnes 10-12) le message « Issued for all desks. Reissued every hour. » et le cartouche « DIRECTIVE 05 / 05 ».

**Règlement** (colonnes 9-12 de l'en-tête, `<ol>` mono-data, numéro Sage, texte Paper, lh 1.6 ; sur mobile un `<details open>` entre les planches 03 et 04) :

```
§ 1.1  A branch is recorded before it is judged.
§ 1.2  The desk files twice, reads once.
§ 2.1  Variance is reported within the hour.
§ 2.4  Nothing is pruned on a Friday.
§ 3.1  Every folio has a spine.
§ 3.3  The desk is never closed.
```

**Typographie** : titres de planche `--t-h1` MAJUSCULES (la seule famille de titres en capitales avec le hero) ; messages Inter `clamp(1rem, 1.1vw, 1.25rem)` max 28ch ; cartouches `--t-mono-label` ; règlement `--t-mono-data`. Sur mobile les titres gardent `clamp` min 2.5rem.

**ASCII — la bannière plombée** (vérifiée) : `<Banner text="UNDER CONTROL" font="wide" pixel={1} gap={2} shadow="none" fill="█" glint={{ every: 9, sweep: 1.6, width: 2 }} label="Under control, set in block letters" className="art" />` sans `color` → `<pre>` en encre Obsidian sur l'aplat Sage ; le kit lit la couleur du texte, détecte une page claire et choisit lui-même les caractères du glint (`chars` laissé par défaut : « ▒▓ » sur page claire). **Mesuré : 101 colonnes × 5 rangées** (`max={72}` ne change rien : « at one column a pixel it can still be wider than max »). Taille : `font-size: clamp(4px, 100cqw / 60.6, 14px)` dans sa cellule (101 × 0,6 = 60,6) → à 1360 px la zone des colonnes 2-9 (≈ 890 px) donne 14 px (848 px de large, 84 px de haut). **Sous 768 px** : seconde bannière `<Banner text="UNDER CONTROL" font="slim" pixel={1} gap={1} shadow="none" effect="still" … />` (**50 × 5 mesuré**, `font-size: 100cqw / 30` → 11,9 px à 358 px), la première masquée par `display: none` (une pièce masquée ne joue pas). Le glint toutes les 9 s est l'une des deux seules boucles permanentes du site ; `effect="still"` sous 768 px et quand Motion est off. Première image serveur : `banner(text, opts).default()(0, { paper: true })` dans un `<pre>` (la planche est claire : `paper: true` obligatoire, sinon la rampe SSR change à l'hydratation). Test de build : `drawable("UNDER CONTROL") === "UNDER CONTROL"` et `banner(...).meta.cols * 0.6 * fontSize ≤ zone` aux trois breakpoints.

**Couleur** : la seule section à grands aplats ; Orange = un carré de 12 px sur cartouche Obsidian (planche 04) ; Gold = absent ; Brown = ligne de coupe de la planche 02 sur Paper (4,56:1) et le rectangle « copie carbone » de la planche 03 sur Obsidian (aplat décoratif, jamais porteur seul).

**Beats** :

1. **Tirage** : l'aplat de chaque planche est « imprimé » (`clip-path: inset(0 100% 0 0) → inset(0)`, 640 ms `power2.out`) à 20 % de visibilité, une fois, jamais deux planches en même temps (décalage forcé de 160 ms si deux entrent ensemble) ; sur `(pointer: coarse)` : opacity 200 ms.
2. **Composition** : titre par lignes masquées 560 ms `power3.out` stagger 70 ms, message +240 ms opacity.
3. **Tracé** : formes géométriques dessinées (cercle en dashoffset 800 ms `power1.inOut` ; branches coupées 400 ms ; rectangles décalés `translate 12px → 0` 400 ms) ; le carré orange de la planche 04 en dernier (+200 ms) : l'œil finit sur l'attention.
4. Rien ne boucle sauf le glint de la planche 05. Aucun survol : une affiche ne réagit pas.
   Reduced-motion : tout apparaît sans transition, bannière `still` (comportement natif).

**Contenus** (`data/directives.ts`) : les cinq titres, messages, cartouches ci-dessus + `figure: "circle" | "cut" | "carbon" | "dial" | "banner"`, `ground: "sage" | "paper" | "obsidian"`, `ratio: { portrait, landscape }`.

### 4.6 Section 06 — Report a Nexus Event (folio 05, « FORM NX-7 »)

**Nature** : un formulaire de déclaration imprimé sur papier, avec sa copie carbone qui écrit ce qu'on tape. Validation réelle côté client (`lib/validation.ts`, schéma typé partagé avec les tests), aucune transmission, état de confirmation marqué DEMONSTRATION.

**Composition desktop** :

```
| 1 … 7 : [05 tall] Report a Nexus Event (h2)   lead      | 9 … 12 : FOLIO 05/07 · DECLARATION · DESK 7
| 2 … 8 : FEUILLE PAPER (padding 48px)                     | 9 … 12 : COPIE CARBONE (Brown, Paper ink, mono-data)
|   ╔══════════════════════════════════════╗ (filet double Brown)  |   CARBON · COPY 2 OF 2            ← mono-label Paper
|   FORM NX-7 — DECLARATION OF VARIANCE · DEMONSTRATION ONLY     |   DESIGNATION   ·····              ← reflète la saisie (aria-live="off")
|   ┊ mini-échelle verticale 48px (6 crans, Brown ; cran plein Obsidian descend d'un champ valide)  |   SECTOR        ·
|   EVENT DESIGNATION •            [ texte, 3-80 ]          |   OBSERVED AT   ·
|   ─────────────────────────────── (filet bas 1px Brown)   |   VARIANCE      ·
|   SECTOR •                       [ select 1-9 ]           |   DESCRIPTION   0 / 600
|   OBSERVED AT •   [ date ] [ time ] (dates fictives acceptées)   |   ATTESTATION   ·
|   VARIANCE LEVEL  ▢ minor  ▢ notable  ▢ critical (radios carrées 16px)  |   (3 lignes réservées pour le reçu ASCII)
|   DESCRIPTION •   [ textarea, 20-600 ]        0 / 600     |
|   ▢ I declare this record accurate to my clearance level. |   HOW TO FILE (Obsidian, Sage) : 3 lignes + « No personal data is requested.
|   [ ▌FILE THE DECLARATION ]  (bouton Obsidian, texte Paper, 52px ; la barre d'action Orange 4px est À L'INTÉRIEUR du bouton, sur son Obsidian : 4,19:1)   Clear form |   This form validates in your browser and transmits nothing. See docs/ARCHITECTURE.md → Connecting a service. »
```

La feuille Paper (colonnes 2-8) et, derrière elle, décalée de 10 px vers le bas et la droite, la **copie carbone** Brown de mêmes dimensions ; la marge visible de la carbone à droite porte le bloc « CARBON · COPY 2 OF 2 » qui reflète les champs au fur et à mesure (HTML mono-data Paper sur Brown 4,56:1, `aria-live="off"`, `aria-hidden` pour les lecteurs d'écran : c'est une redite visuelle). Colonnes 9-12 au-dessus de la carbone : le bloc d'instructions mono sur Obsidian.

Champs, tous à ligne de base (filet bas 1 px Brown, pas de boîte), hauteur 48 px, labels mono-label Brown au-dessus, aide `--t-small` Brown :

| champ | type | règle | message d'erreur (mono-data Obsidian, « ▪ » = carré CSS) |
| --- | --- | --- | --- |
| Event designation • | `<input type="text">` | 3-80 caractères | ▪ Designation needs 3 to 80 characters. |
| Sector • | `<select>` 1-9 | requis | ▪ Choose a sector from 1 to 9. |
| Observed at • | `<input type="date">` + `<input type="time">` | les deux requis, toute date acceptée (fictive) | ▪ Give a date and a time of observation. |
| Variance level | `<fieldset>` 3 radios minor / notable / critical | défaut : minor | — |
| Description • | `<textarea>` | 20-600, compteur mono « 0 / 600 » aligné à droite | ▪ Describe the event in 20 to 600 characters. |
| Attestation • | `<input type="checkbox">` | requis | ▪ The declaration must be attested. |

Erreurs : à la perte de focus et à l'envoi ; résumé en tête de feuille sous forme de **bande Obsidian inversée** (texte Paper, carré orange, filet gauche 4 px orange : les deux sur Obsidian, ≥ 3:1), liste de liens vers chaque champ, focus déplacé dessus ; sous chaque champ le message mono relié par `aria-describedby`, `aria-invalid="true"`, filet du champ à 2 px. Jamais d'orange en texte sur papier (2,83:1). Sur mobile le résumé n'est **pas** collant : il reçoit le focus et la page défile vers lui.

Succès : la feuille reçoit le **tampon** « RECEIVED · DEMONSTRATION · NOT TRANSMITTED » (SVG : double anneau 1.5 px, deux lignes courbes en `textPath`, rotation −6°, encre Obsidian, 220 px ; 160 px sur mobile) en haut à droite ; la copie carbone glisse de 10 px à 28 px pour se montrer et **tape le reçu ASCII** ; un bouton « File another » apparaît ; le formulaire reste lisible derrière, désactivé. Numéro de reçu issu d'un compteur de session (`NX-DEMO-0001`, `0002`…), jamais une constante.

Mini-échelle (`Scale` générique, orientation verticale) : 6 crans Brown dans la marge gauche de la feuille, un cran plein **Obsidian** (pas or : Gold/Paper 1,31) descend à chaque champ valide, 240 ms `power2.out` ; doublée d'un texte `sr-only` « 3 of 6 fields complete » (`aria-live="polite"`, annoncé à la perte de focus seulement).

**Mobile** : une colonne ; instructions en `<details>` au-dessus ; feuille pleine largeur (padding 20 px) ; la carbone ne glisse plus latéralement (elle apparaît **sous** la feuille, pleine largeur, décalée de 6 px) ; champs 16 px (pas de zoom iOS), cibles 48 px ; radios en 3 rangées de 48 px ; bouton pleine largeur de 56 px non collant ; tampon 160 px en bas de feuille.

**Typographie** : labels `--t-mono-label` Brown sur Paper ; saisies Inter 1rem Obsidian ; aides et compteur mono-data Brown ; erreurs mono-data Obsidian ; titre de formulaire Space Grotesk 500 1.5rem Obsidian ; tampon Space Grotesk 500 0.875rem tracking 0.18em ; reçu carbone mono-data Paper sur Brown.

**ASCII — le reçu tapé** (vérifié ; `cursor` est **booléen**) :

```ts
import { column, delay, typewriter } from "ascii.rest/kit";
export const receipt = (ref: string) => column(
  [typewriter(ref, { hold: "forever", cursor: true }),
   delay(typewriter("FILED · COPY 2 OF 2 · NOT TRANSMITTED", { hold: "forever", cursor: false }), 1.4)],
  { align: "left", gap: 0 });
```

Mesuré : 37 × 2, se tape en ≈ 2,5 s puis tient pour toujours (`loop: undefined`, `still` 3.97) ; le curseur du premier typewriter clignote une fois la tenue atteinte. Rendu `<Ascii piece={receipt(ref)} mono className="art" label={`Receipt ${ref}`} />` en encre Paper dans la feuille Brown (`font-size: 12px`, 3 lignes réservées = 43 px avant l'envoi pour éviter tout saut). Construit avec `useMemo` sur `ref` (pas dans le rendu). Aucun ASCII dans les champs. Reduced-motion : texte entièrement écrit (natif). Quand Motion est off, le reçu est rendu statiquement par `receipt(ref).default()(6)`.

**Couleur** : Paper feuille ; Brown carbone, labels, filets des champs, crans ; Obsidian texte saisi, bouton, tampon, erreurs, cran plein ; Sage cartouche et instructions sur Obsidian ; Orange seulement dans la bande de résumé d'erreurs (carré + filet sur Obsidian) et sur la barre d'action du bouton (sur Obsidian) ; Gold absent ; aucun vert de succès.

**Beats** : focus d'un champ → filet bas 1 px Brown → 2 px Obsidian (120 ms, pas d'étiquette flottante) ; erreur → **Commutation** (bande de résumé descend 200 ms `power2.out`, messages de champ sans mouvement, carré du résumé permute à 0 ms) ; champ valide → cran suivant (240 ms) ; succès → **Tampon** (180 ms `power4.out`), carbone 10 → 28 px en 320 ms `power2.inOut`, reçu tapé à +300 ms (natif), focus sur le tampon (`tabindex="-1"`, `role="status"`). Reduced-motion : tampon et carbone en place, reçu écrit.

**Contenus** : secteurs « Sector 1 … Sector 9 » ; aide de la désignation « e.g. LOOM DRIFT, DESK 7 » ; instructions « How to file : 01 Name the event. 02 Place it in a sector and an hour. 03 Describe what deviated. » ; « No personal data is requested. This form validates in your browser and transmits nothing. See docs/ARCHITECTURE.md → Connecting a service. ».

### 4.7 Section 07 — Footer / System Status (folio 06, « COLOPHON »)

**Nature** : colophon et quatrième de couverture du dossier ; la ligne sacrée revient et, pour la première fois, se termine.

**Composition desktop** :

```
═══════════════════════════════════ filet double Sage (1px, 3px d'écart), pleine largeur
| 1 … 4 : ◻ CHRONOS / TVA TERMINAL        | 5 … 8 : INDEX                         | 9 … 12 : colophon (Inter small, --ink-3)
|         [ CHRONOS-4 en bannière slim ]   |   00 · Transmission slip · F.00/07     |   Set in Space Grotesk, IBM Plex Mono and Inter.
|         ▪ SYSTEM OPERATIONAL · T+0.000   |   01 · Sacred Timeline · F.01/07      |   ASCII by ascii.rest. Version 0.1.0 · build a1b2c3d
|                                          |   02 · Variant Registry · F.02/07     |   No cookies, no tracking, no transmission.
|                                          |   03 · Branch Survey · F.03/07        |   All records are fictional specimens.
|                                          |   04 · Directives · F.04/07           |   Independent experiment. Not affiliated with
|                                          |   05 · Declaration · F.05/07          |   Marvel Studios or Disney.
|                                          |   06 · Colophon · F.06/07             |   README · docs/ARCHITECTURE.md (liens réels du dépôt)
|                                                                                   FOLIO 06/07 · COLOPHON (avec son numéral 06 tall)
| ────┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───■ END OF RECORD        (vide 12 %)
|      règle Sage 1px graduée (traits tous les 24px, majeurs tous les 120px), s'arrête à 88 % sur un carré Gold 6px
|                                   (96px de vide)
| // NOTHING FOLLOWS //▌                                                                              ← typewriter, mono Sage
┼ repère ⊕                                                                                 repère ⊕ ┼  (coins bas de la feuille)
```

**Mobile** : trois blocs empilés (identité, index, colophon) séparés par des filets simples Sage ; la règle finale garde sa marque or ; « NOTHING FOLLOWS » centré en dernier, 64 px de marge sous lui pour la barre du téléphone ; cibles d'index 48 px.

**Typographie** : index `--t-mono-data` (numéro Sage, titre Paper, folio Sage), liens d'ancre réels ; colophon `--t-small` `--ink-3` lh 1.5 ; état `--t-mono-label` ; mention de fin mono-label Sage tracking 0.12em ; « END OF RECORD » mono-deco Sage-70.

**ASCII** (vérifié) :

- `<Banner text="CHRONOS-4" font="slim" pixel={1} shadow="none" effect="type" label="Chronos-4" className="art" />` sans couleur → `<pre>` Paper ; **mesuré 43 × 5**, se tape en 1,47 s quand il entre en vue puis tient (natif) ; `font-size: 10px` → 258 × 60 px (8 px sur mobile → 206 px). Première image serveur = la version `effect: "still"` (lettres complètes) pour le no-JS ; au montage `<Banner>` prend la place (vide tant qu'il est hors écran, puis se tape).
- Fin : `typewriter("// NOTHING FOLLOWS //", { hold: "forever", cursor: true, speed: "slow" })` du kit en `mono` (mesuré 22 × 1, tapé en ≈ 4 s, curseur qui clignote ensuite) : la **seconde boucle permanente autorisée** (un curseur). Espace réservé (1 ligne). Motion off : rendu statique `default()(8)`.
- Numéral « 06 » en bannière `tall` (12 × 7) dans le cartouche.

**Couleur** : Obsidian ; Paper bannière, titres d'index, colophon (Sage-70) ; Sage filets, numéros, état, règle, mention de fin, repères ; **Gold : le carré de fin, unique** (l'entorse justifiée : l'événement temporel final) ; ni orange ni brun.

**Beats** : la bannière se tape à l'entrée en vue (natif) ; +600 ms l'index apparaît ligne par ligne (opacity + y 6 → 0, 160 ms, stagger 40 ms) ; la règle finale se trace quand elle entre à 80 % (**Tracé** 1400 ms `power1.inOut`), puis le carré or apparaît (scale 0 → 1, 200 ms, sans rebond) et « END OF RECORD » fond en 300 ms ; le relevé « T+0.000 » de l'état compte de la dernière valeur du hero à 0 en 800 ms (`snap: 0.001`) ; « NOTHING FOLLOWS » se tape quand il entre en vue. Reduced-motion : tout complet, curseur fixe.

**Contenus** (`config/site.ts` → `footer`) : identité « CHRONOS / TVA TERMINAL », système « CHRONOS-4 », état « SYSTEM OPERATIONAL », index des 7 folios, colophon ci-dessus, `version` lue de `package.json`, `build` = hash court injecté au build (`NEXT_PUBLIC_BUILD_SHA`, ligne non rendue s'il est absent), mention de fin « // NOTHING FOLLOWS // ».

## 5. Grammaire d'animation

Toutes les animations sont GSAP (`gsap` 3.15, `@gsap/react` `useGSAP` avec `scope`), un `gsap.context()` par composant, revert au démontage, `ScrollTrigger` uniquement en `once: true` (aucun `scrub`, aucun `pin`), transform + opacity en priorité, `stroke-dashoffset` pour les SVG, `clip-path` limité à 3 éléments par viewport, `color` pour l'encre d'un `<pre>` (une propriété peinte, un seul élément). Motion (la librairie) n'est utilisé que pour les micro-états de composants hors GSAP (onglets, accordéon mobile), jamais en doublon.

**Règle dure (héritée de l'Atlas)** : le CSS décrit toujours l'état final (titres visibles, timeline tracée, aplats imprimés, planches en place). GSAP ne pose ses états `from` qu'à l'intérieur de `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` **et** quand `html[data-motion="ok"]`, jamais sur un élément déjà visible à l'hydratation (`getBoundingClientRect().top < innerHeight` → pas de `from`), et jamais dans le HTML (aucun `stroke-dashoffset` initial, aucun `opacity: 0` en ligne). Le pré-masquage du hero passe par l'attribut `data-entry` posé avant la première peinture (§4.2) avec sa sécurité CSS à 3 s. Sans JS, en reduced-motion ou Motion off, la page est complète par construction.

### 5.1 Les six primitives

1. **TIRAGE** (le passage de presse) : révélation d'un aplat ou d'une fiche par `clip-path: inset(0 100% 0 0) → inset(0)`, 480-640 ms, `power2.out`, déclenchée à 20 % de visibilité, une fois ; remplacée par `opacity` 200 ms sur `(pointer: coarse)` ; `will-change` posé par le tween et retiré à `onComplete`.
2. **COMPOSITION** (la casse) : lignes de titre dans des masques `overflow: hidden`, `yPercent 100 → 0`, 560 ms, `power3.out`, stagger 70 ms ; métadonnées à +200 ms, `opacity 0 → 1` + `y 8 → 0`, 320 ms, stagger 50 ms. Lancée après `document.fonts.ready` (plafond 300 ms) pour que les métriques soient celles de Space Grotesk.
3. **TRACÉ** (le tire-ligne) : SVG par `pathLength="1"` + `stroke-dashoffset 1 → 0`, ligne principale 1200-1400 ms `power1.inOut`, chaque branche 500-600 ms démarrant quand la ligne atteint son origine (délai = position × durée), marqueurs `opacity` 200-240 ms ; toujours dans le sens du temps (gauche → droite, haut → bas sur mobile) ; jamais piloté par le scroll.
4. **HORS-REPÉRAGE** (l'anomalie) : couche double en Orange, `translate(3px, -2px)` + `opacity 0 → 1` en 120 ms `steps(3)`, tenue, retour 80 ms `steps(2)` ; déclenché uniquement par un événement de variance ; version Sage 2 px pour le survol des compositions typographiques ; en reduced-motion l'état change sans glissement.
5. **TAMPON** (le cachet) : `scale 1.15 → 1` + `opacity 0 → 1`, 180 ms, `power4.out`, rotation −6° fixe, encre 100 % une image puis 92 % ; réservé au boot (REGISTERED), au retour en repère du hero, au succès du formulaire.
6. **COMMUTATION** (le commutateur) : tout changement d'état administratif — onglet d'index, mot et carré de statut, sélection de branche, bande d'erreurs, ligne d'état du boot — permute à 0 ms en `steps(1)` (couleur, inversion, glyphe), le contenu fond en 120-160 ms, aucun easing élastique, aucun Flip : « un changement de dossier administratif est sec ».

Règles de retenue du mouvement : une seule primitive narrative active par viewport en plus des pièces ASCII ; tout est déclenché une fois ; aucune boucle hors pièces ascii.rest (deux boucles permanentes visibles au total : le glint de la planche 05 au-dessus de 768 px, le curseur de « NOTHING FOLLOWS ») ; durées ≤ 700 ms sauf Tracé et étirement du boot ; pas de parallaxe, pas de Lenis, pas de scroll-snap vertical, pas de blur, pas de `scale` > 1.15, aucun rebond ; survols 160-240 ms sous `(hover: hover)` ; `focus-visible` = même état que le survol + contour 2 px Paper décalé de 4 px (Obsidian sur surfaces claires) ; ≤ 12 éléments animés par viewport ; nettoyage intégral au démontage ; un contrôle global « MOTION ON/OFF » (nav desktop, feuille INDEX mobile, persistance `localStorage`, `MotionProvider`) qui équivaut à reduced-motion pour tout le site (WCAG 2.2.2).

### 5.2 L'interaction signature, pas à pas (HORS-REPÉRAGE du hero)

Précondition : `heroEntry` terminée (ou absente) ; état `variance = false` ; `clock.t` de la gravure avance à 24 fps.

| temps | élément | geste |
| --- | --- | --- |
| 0 ms | `<button class="nexus" aria-pressed>` | `pointerenter`/`focus` (ou tap = bascule) → `setVariance(true)` ; `aria-pressed="true"` |
| 0 → 120 ms | titre `.title-ghost` (copie `aria-hidden` du h1, `color: var(--c-orange)`, derrière) | `opacity 0 → 1`, `x 0 → 3`, `y 0 → -2`, `ease: "steps(3)"` |
| 0 → 120 ms | filets `.rule[data-shift]` du hero (filet de nav, filet FILE NOTE) | même tween sur leur pseudo-élément double |
| 0 ms | gravure | `clock.t -= 0.5` (saut sec) ; `frames = frames[1]` (variance 1) : le bras se détache de la ligne, l'anneau se déchire, au même `t` |
| 0 → 240 ms | branche nexus du SVG (`#branch-nexus`) | `stroke: sage → orange` (Commutation à 0 ms) puis `stroke-dashoffset 0.4 → 0` (la branche se prolonge, `power2.out`) ; marqueur : carré creux → plein orange à 0 ms |
| 0 → 120 ms | `StatusIndicator` de la nav | carré Sage → Orange à 0 ms ; mot « TIMELINE NOMINAL » → « VARIANCE DETECTED » à 0 ms (Paper) ; relevé `T+0.000 → T+0.003` en `steps(3)` (`snap: 0.001`) |
| 0 ms | cartouche du hero | « FOLIO 01/07 » → « FOLIO 01/07-B » |
| 0 ms | région `aria-live="polite"` | « Variance detected on branch BR-0419 » |
| tenue | — | tant que le pointeur/focus reste (ou jusqu'au second tap) ; aucune boucle, rien ne pulse |
| relâchement +0 → 80 ms | titre, filets | retour `opacity 0`, `x 0`, `y 0`, `ease: "steps(2)"` |
| +0 ms | gravure, branche, marqueur, indicateur, cartouche | retour à l'état nominal à 0 ms (Commutation) ; `clock.t` ne saute pas au retour |
| +80 → 260 ms | tampon « REGISTERED » à droite de l'indicateur | TAMPON (180 ms `power4.out`), reste 900 ms, puis `opacity 0` 120 ms |
| +80 → 480 ms | relevé | `T+0.003 → T+0.000` (`snap: 0.001`, `power1.out`) |
| +0 ms | `aria-live` | « Variance registered » |

Variante scriptée (fin du Tracé d'entrée) : identique, tenue 600 ms, déclenchée par `onComplete` du tween de la branche nexus, une seule fois par chargement ; ignorée en reduced-motion. Échos (Explorer BR-0419, registre) : voir §4.3-4.4. Tests : `tests/hero-variance.test.tsx` vérifie les états ARIA, les textes, l'absence de texte orange et l'idempotence tap/tap.

---

## 6. Plan ascii.rest

### 6.1 Principes

- L'ASCII est de l'encre : **tout est rendu en `<pre class="art">`**, dans la `color` CSS de la section. Aucun canvas. Toute pièce du kit qui a une palette (looks, widgets : vérifié, `rings`/`ripple` ont 32 couleurs, `progressBar`/`spinner`/`sparkline`/`typewriter` 12) est montée avec **`mono`**, obligatoire dans `AsciiLive`.
- Chaque pièce a une fonction : gravure = l'anomalie, barre = progression réelle, sparkline et trace = donnée, machine à écrire = reçu et fin, bannières = caractères plombés (folios, directive, système).
- Les pièces du kit sont des modules : construites **une fois, hors composant**, dans des fichiers `"use client"` (`components/ascii/pieces/*.ts`) ; `useMemo` quand une option dépend des props (reçu, trace) ; un Server Component ne passe jamais un module.
- Première image côté serveur pour toute pièce texte : `piece.default(options)(t, { paper })` dans `AsciiStill` (Server Component, `<pre role="img" aria-label>`), `paper: true` sur Sage/Paper ; `t` = `meta.still` ou la valeur indiquée. Zéro CLS : la hauteur est celle du texte.
- Pause hors écran : native pour `<Ascii>`/`<Banner>` ; `IntersectionObserver` pour `AsciiClock`.
- Reduced-motion et Motion off : natifs (une image à `still`, bannières tapées complètes) ; `options.motion = true` seulement derrière le bouton PLAY d'une planche.
- Couleurs : aucune passée au kit ; les six hex vivent dans `config/palette.ts` si un autre univers en a besoin.

### 6.2 Inventaire (toutes vérifiées le 24/10 contre `ascii.rest@0.4.0`)

| section | pièce / recette exacte | import | taille mesurée | rendu | encre | première image | reduced / off |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 boot | `progressBar({ label: "integrity", value: () => p, style: "blocks", width: 24, percent: true })` | `ascii.rest/kit` | 39×1 | `<Ascii mono options={{ fps: 24 }}>` | Sage | `default()(0)` | jamais monté |
| 01 boot | `spinner("line", { label: "syncing" })` | kit | 9×1 | `<Ascii mono>` | Sage | — | jamais monté |
| 02 hero | `etchingLine` / `etchingField` (§4.2, `field()` × 2, `options: { variance }`, `still: 3`, `period: 12`) + `crop(…, { x: 4, y: 2, cols: 48, rows: 20 })` mobile | kit | 56×24 / 48×20 | `AsciiClock` (deux `<pre>` superposés) | Gold / Sage | `default({ variance: 0 })(3)` | image à 3 s |
| 02 hero (repli) | `ripple({ drops: 1, speed: "slow", cols: 56, rows: 24 })` | kit | 56×24 | `<Ascii mono>` | Sage | `default()(0)` | still |
| 02-07 numéraux | `<Banner text="02" font="tall" pixel={1} shadow="none" effect="still" />` (« 02 » … « 06 ») | `ascii.rest/react` | 12×7 | `<pre>` (sans `color`) | Sage | `banner(...).default()(0)` | natif |
| 03 registry | `rings({ to: "in", speed: "slow", scale: "large", cols: 36, rows: 14 })` ; `ripple({ drops: 2, cols: 36, rows: 14 })` ; détail 48×16 | kit | 36×14 | `AsciiStill` → `AsciiLive` (`mono`, `fps: 24`) | Sage | `default()(3)` | still + PLAY |
| 03 registry | `sparkline([2,3,2,5,8,4,3,3], { label: "variance", width: 24, height: 4 })` | kit | 35×4, `still` 1.5 | `AsciiStill` à 1.5 | Sage | `default()(1.5)` | still |
| 04 explorer | `deviationTrace` (§4.4, `piece()` + `braille()`, `options: { k, amp, phase }`, `still: 2`) ; mobile 32×6 | kit | 40×8 | `<Ascii mono options={{ k, amp, phase }}>` (changement d'options = re-tracé) | Sage / Orange | `default(opts)(2)` | still 2 |
| 05 directives | `<Banner text="UNDER CONTROL" font="wide" pixel={1} gap={2} shadow="none" fill="█" glint={{ every: 9, sweep: 1.6, width: 2 }} />` ; sous 768 px `font="slim" gap={1} effect="still"` | react | 101×5 / 50×5 | `<pre>` | Obsidian sur Sage | `banner(...).default()(0, { paper: true })` | natif (`still`) |
| 06 report | `column([typewriter(ref, { hold: "forever", cursor: true }), delay(typewriter("FILED · COPY 2 OF 2 · NOT TRANSMITTED", { hold: "forever", cursor: false }), 1.4)], { align: "left", gap: 0 })` | kit | 37×2 | `<Ascii mono>` (useMemo sur `ref`) | Paper sur Brown | espace réservé 3 lignes | `default()(6)` |
| 07 footer | `<Banner text="CHRONOS-4" font="slim" pixel={1} shadow="none" effect="type" />` | react | 43×5, 1,47 s | `<pre>` | Paper | version `still` | natif |
| 07 footer | `typewriter("// NOTHING FOLLOWS //", { hold: "forever", cursor: true, speed: "slow" })` | kit | 22×1 | `<Ascii mono>` | Sage | 1 ligne réservée | `default()(8)` |
| build | `drawable(text)` ; `banner(text, opts).meta.cols` ; `snapshot(piece, t)` | `ascii.rest/banner`, kit | — | tests et génération des replis | — | — | — |

Non utilisés, volontairement : `glitch()`, `blinking()`, `scene()`/`cube()`, `layer()`, `stars()`, `galaxy()`, `gauge()`, `panel()`, `big-text`, `boot-log`, toute pièce de bibliothèque colorée.

### 6.3 Composants (`components/ascii/`)

- `AsciiStill` (Server Component) : `{ piece, t, options?, paper?, label, className, ink }` → `<pre class="art" role="img" aria-label style="color: var(--ink)">` avec `piece.default(options)(t, { paper })`. Utilisé seul (sparkline au repos, numéraux, bannières no-JS) ou comme première image de `AsciiLive`.
- `AsciiLive` (`"use client"`) : enveloppe `<Ascii>` : `mono` forcé, `className="art"`, `label` obligatoire, `options` (`fps` 24 max, 12 sur mobile, 0 interdit : on démonte plutôt), `useHydrated()` pour montrer `AsciiStill` jusqu'au montage, `ArtBoundary` (error boundary) → `fallback` (frame committée ou texte Space Grotesk pour une bannière). Pour les bannières, `AsciiBanner` fait de même autour de `<Banner>` et détecte le `<pre>` vide (`<Banner>` rend null et `console.warn` sur une option refusée) : `.banner:empty + .banner-fallback { display: block }`.
- `AsciiClock` (`"use client"`) : `{ layers: { el: ref, frames: Record<0|1, Frame> }[], still, fps, state }` ; un seul rAF plafonné ; `clock = { t }` possédé par GSAP (`gsap.ticker` ou `gsap.to(clock, …)`), `clock.t` initialisé à `still` ; `IntersectionObserver` (seuil 0.1) coupe la boucle ; reduced/off : écrit une fois `frames[state](still)`. C'est la seule pièce « jouée par nous », documentée par la page TypeScript (« Draw a frame yourself / Run your own loop »).
- `pieces/` : `boot.ts`, `etching.ts`, `trace.ts`, `receipt.ts`, `banners.ts` (options des bannières, pas d'appel `banner()` côté serveur hors `AsciiStill`), `index.ts` = le **thème de pièces** (`{ hero: { line, field, lineMobile, fieldMobile }, registry: { etchings, sparkline }, explorer: { trace, traceMobile }, report: { receipt }, footer: { ending }, banners: {...} }`) référencé par `config/site.ts`. Un autre univers remplace `hero.field` par `sea({ palette: "mono" })` sans toucher aux composants.
- `safePiece(make, fallbackPath)` : try/catch autour de chaque construction du kit ; sert la frame committée dans `public/ascii/*.txt` (générée par `scripts/ascii-snapshots.ts` avec `snapshot(piece, t).text`, exécuté avant `next build`).

### 6.4 Dimensions (règle unique)

Un `<pre>` ascii se dimensionne par **container query** : `font-size = clamp(min, 100cqw / (cols × 0.6), max)` (IBM Plex Mono avance de 0,6 em), hauteur = `rows × 1.2 × font-size`. Valeurs : gravure 56 col → `/ 33.6`, clamp 7-12 px ; etchings 36 col → `/ 21.6`, clamp 7-12 px ; bannière 101 col → `/ 60.6`, clamp 4-14 px ; bannière slim 50 col → `/ 30` ; CHRONOS-4 43 col fixe 10 px (8 px mobile) ; numéraux 12 col fixes 10 px (72 × 84 px) ; trace 40 col fixe 11 px ; barre du boot 24 col 13 px desktop / 11 px mobile ; reçu et fin 12 px. Un test (`tests/ascii-sizes.test.ts`) lit `meta.cols` de chaque pièce et vérifie `cols × 0.6 × fontMax ≤ largeur de la cellule` à 358, 768 et 1360 px.

### 6.5 Polices des caractères spéciaux

- `.art` : `font-family: var(--font-plex-mono), "ascii.rest mono", ui-monospace, monospace` + le `@font-face` documenté : `font-family: "ascii.rest mono"; src: url("https://ascii.rest/fonts/ascii-rest-mono.woff2") format("woff2"); unicode-range: U+00B0, U+00B7, U+2022, U+2500-259F, U+25CF; font-display: swap;` — à auto-héberger dans `public/fonts/` (3 Ko) pour ne dépendre d'aucun domaine tiers.
- **Braille** (sparkline, trace : U+2800-28FF) : hors de cette plage et absent d'IBM Plex Mono → `@font-face "chronos-braille"` auto-hébergé, sous-ensemble U+2800-28FF de DejaVu Sans Mono (licence libre, ≈ 4 Ko), `unicode-range: U+2800-28FF`, placé avant Plex dans `.art-braille`. Tester sur Android et iOS réels ; si une rangée perd sa largeur, basculer `site.ascii.trace = "blocks"` (rampe `eighths`, couverte par U+2580-259F) et remplacer le sparkline par la même pièce blocs.
- Les carrés d'état « ▪ » (U+25AA, hors plage) ne sont jamais des glyphes dans le HTML : ce sont des pseudo-éléments CSS de 6 px. Dans les pièces texte on n'utilise que « · », « ▌ », « █ », les blocs et le braille.

### 6.6 Budget

≤ 4 pièces en lecture simultanée par viewport (hero : 2 `<pre>` = une horloge ; registre : 2 etchings vivantes au plus ; explorer : 1 trace ; directives : 1 glint ; footer : 1 banner typé + 1 curseur) ; 24 fps maximum, 12 sur `(pointer: coarse)` pour l'horloge du hero ; mesure DevTools Performance sur un téléphone milieu de gamme : aucune long task au survol d'une fiche (le redémarrage d'une pièce à 36 × 14 coûte < 1 ms).

## 7. Règles de retenue (ce qu'on ne fait PAS)

- Pas de texture papier, pas de tache, pas de grain d'image, pas d'ombre portée, pas d'arrondi, pas de dégradé : l'imprimé est évoqué par la composition, les filets, les cartouches et le hors-repérage, jamais par des images.
- Pas de lueur, pas de scanline, pas de courbure CRT, pas de flicker, pas de néon, pas de blur, pas de violet : la sauge n'est pas du vert phosphore ; l'ASCII est de l'encre dans un `<pre>`.
- Pas de canvas, pas de Three.js, pas de pièce colorée, pas de `glitch()`, pas de `blinking()`, pas de bande qui défile, pas de voyant qui clignote, pas de cadre `┌─ TITRE ──`.
- Pas d'icônes, pas de grille de 3 « features », pas de carrousel, pas de slider : les directives sont cinq affiches aux compositions toutes différentes et le règlement est du texte mono numéroté.
- Pas de cartes identiques recolorées : cinq représentations qui diffèrent par le DOM, le ratio, le survol et le repli ; tailles composées en rangs ; pas de coins arrondis ; pas d'ombre au survol.
- Pas de hero « titre + 2 boutons + image à droite » : emboîtement typo/illustration, dos, stations sur la ligne, indicateur d'état dans la nav, séquence synchronisée.
- Pas d'animation gratuite : six primitives nommées, une fois, ≤ 700 ms (sauf Tracé), aucune boucle hors deux, pas de parallaxe, pas de Lenis, pas de scroll piégé, pas de pin, pas de rebond, pas de Flip.
- Pas de texte orange sous 24 px ; pas d'or ni d'orange sur Sage ou Paper ; pas de Sage sur Paper ; pas de Brown en texte ou en bordure sur Obsidian ; pas d'information portée par la couleur seule (toujours une forme + un mot).
- Pas de glyphe « ▪ » dans le HTML ; pas de « · » ni d'accent dans un texte de bannière ; pas de `banner()` appelé dans un rendu ; pas de `color` passé au kit ; pas de `fps: 0` pour arrêter une pièce (on la démonte ou on montre `AsciiStill`).
- Pas de `from` GSAP sur un élément visible à l'hydratation ; pas de `stroke-dashoffset` ni d'`opacity: 0` dans le HTML ; pas de lecture de `sessionStorage` pendant le rendu React ; pas d'écoute « n'importe quelle touche ».
- Pas de fausse donnée : SPECIMEN / DEMONSTRATION seulement au bordereau, au dos du hero, à l'en-tête du formulaire et au colophon ; identifiants et dates fictifs par construction ; le formulaire dit qu'il ne transmet rien ; pas de réseaux sociaux, pas d'adresse, pas de domaine fictif déclaré.
- Pas de français dans l'UI, pas de libellé emprunté au concept 2 ; pas de réplique d'écran de la série, pas de citation.
- Pas plus de trois props booléennes par composant ; les variantes sont des unions de chaînes ; aucune `any`.

## 8. Générique vs spécifique TVA

### 8.1 Architecture (dossiers réels du dépôt `chronos-tva`)

```
app/                     layout.tsx (fonts, script de garde data-boot/data-motion, metadata), page.tsx, registry/[id]/page.tsx, not-found.tsx
components/ui/           Container, Section, SectionHeader, Grid, Button, Badge, StatusIndicator, Metadata, Panel, Card, Divider,
                         EdgeBand, CornerMarks, Stamp, Scale, FilterTabs, Form (FormField, ErrorSummary, RadioSquares, Counter), VisuallyHidden
components/layout/       SiteHeader (nav + StatusIndicator + MotionToggle), MobileIndex (feuille Sage plein écran), SiteFooter, SkipLink
components/animation/    MotionProvider (reduced + localStorage), Reveal (Tirage/opacity, once), AnimatedText (Composition), DrawPath (Tracé),
                         useGsapContext, useCommutation (steps(1) + fondu), useRegistration (Hors-repérage : couche double + callbacks)
components/ascii/        AsciiStill, AsciiLive, AsciiBanner, AsciiClock, ArtBoundary, safePiece, pieces/{boot,etching,trace,receipt,banners,index}.ts
components/chronos/      BootSlip, hero/ (HeroDossier, SacredTimeline, NexusButton, HeroEtching), variant-registry/ (VariantRegistry, VariantFiche,
                         plates/{Diagram,Type,Etching,Pattern,Readings}), timeline-explorer/ (BranchExplorer, BranchPanel, BranchList (mobile)),
                         directives/ (DirectivePlate, plate-01 … plate-05, Rulebook), nexus-report/ (NexusReportForm, CarbonCopy, Receipt),
                         SystemFooter, RecordPage
config/                  site.ts (nom, titre, description, nav, folios, footer, flags : boot, variance, replay, motionToggle, ascii.trace), palette.ts
data/                    boot.ts, hero.ts, variants.ts, branches.ts, directives.ts, sectors.ts
hooks/                   use-hydrated, use-media-query, use-reduced-motion, use-session-counter
lib/                     gsap.ts (plugins enregistrés, matchMedia helper), validation.ts (schéma du formulaire), cn.ts, build-info.ts
styles/                  tokens.css (@theme), base.css (.art, @font-face, repères, filets), fonts.ts (next/font : Space Grotesk 500, Inter 400/500, IBM Plex Mono 400/500)
types/                   content.ts (VariantRecord, BranchRecord, DirectiveRecord, TimelineSpec, StatusTone, Representation)
tests/                   validation, nexus-report, timeline-explorer, variant-registry, hero-variance, content, tokens, ascii-sizes, banners (drawable)
scripts/                 ascii-snapshots.ts (replis), build-info (sha)
docs/                    ARCHITECTURE.md (dont « Connecting a service »), THEMING.md (changer d'univers), ce fichier (design-bible.md)
public/ascii/            frames de repli ; public/fonts/ : ascii-rest-mono.woff2, chronos-braille.woff2
```

### 8.2 Génériques (ne connaissent ni l'or, ni l'orange, ni la TVA)

`Container` (largeur et gouttières par tokens) · `Section` (rythme vertical, slot cartouche) · `SectionHeader` (slots numeral / title / lead / aside) · `Grid` (spans par classes, `dense` optionnel) · `Button` (`variant: "solid" | "outline" | "text"`, `size`, rendu `<a>` ou `<button>` selon `href`, slot `marker` pour la barre d'action) · `Badge` · `StatusIndicator` (`tone: "nominal" | "attention" | "review" | "archived" | "temporal"`, `shape` dérivée du tone, libellé obligatoire, slot `readout`) · `Metadata` (`<dl>` mono) · `Panel` (filets haut/bas, titre, `minHeight`) · `Card` (filet haut + header / plate / body slots, lien étendu) · `Divider` (`variant: "simple" | "double" | "perforated"`) · `EdgeBand` (bande de bord verticale ou horizontale à texte tourné) · `CornerMarks` · `Stamp` (texte, encre, rotation, forme `rect | ring`) · `Scale` (règle graduée : orientation, pas, traits majeurs, marqueur typé) · `FilterTabs` (`aria-pressed`, compteurs, live region) · `Timeline` (SVG depuis un `TimelineSpec { main, branches[], markers[] }`, sélection contrôlée, tablist, orientation `horizontal | vertical`, rendu liste pour la verticale) · `TerminalPanel` (liste mono de lignes + slot progression) · `Form*` · `Reveal`, `AnimatedText`, `DrawPath`, `useCommutation`, `useRegistration` (reçoit des cibles et des callbacks, ignore ce qu'est une variance) · `AsciiStill`, `AsciiLive`, `AsciiBanner`, `AsciiClock`, `ArtBoundary`, `safePiece`.

### 8.3 Spécifiques TVA (`components/chronos` + `data` + `config`)

Ce sont eux qui nomment FOLIO, DESK 7, BR-0419, la gravure, les cinq affiches, la copie carbone et « NOTHING FOLLOWS ». Types (`types/content.ts`) :

```ts
export type StatusTone = "nominal" | "anomaly" | "review" | "archived";
export type Plate = "wide" | "tall" | "square";
export type Representation =
  | { kind: "diagram"; branches: { at: number; angle: number; length: number; pruned?: boolean; anomalous?: boolean }[] }
  | { kind: "type"; code: string; caption: string; ground?: "paper" }
  | { kind: "etching"; recipe: "rings" | "ripple"; caption: string }
  | { kind: "pattern"; motif: "quarter-circles" | "stripes" | "squares"; missing: [number, number] }
  | { kind: "readings"; rows: { key: string; value: string; unit?: string }[]; series: number[] };
export interface VariantRecord { id: string; slug: string; name: string; status: StatusTone; category: string; filter: "anomalies" | "projects" | "archive";
  plate: Plate; representation: Representation; description: string; meta: { origin: string; class: string; deviation: string; disposition: string; branch?: string } }
export interface BranchRecord { id: string; x: number; side: "up" | "down"; kind: "filed" | "review" | "pruned" | "nexus" | "projected"; designation: string;
  divergence: string; variance: "none" | "minor" | "notable" | "critical"; status: string; desk: number; readings: number[]; trace: { k: number; amp: number; phase: number };
  note: string; record?: string; labelOffset: [number, number] }
export interface DirectiveRecord { index: number; title: string; message: string; figure: "circle" | "cut" | "carbon" | "dial" | "banner"; ground: "sage" | "paper" | "obsidian";
  ratio: { portrait: string; landscape: string }; cartouche: string; action?: { label: string; href: string } }
```

### 8.4 Changer d'univers (`docs/THEMING.md`)

1. `styles/tokens.css` : six couleurs → mêmes rôles sémantiques ; `--radius`, `--shadow`, polices.
2. `config/site.ts` : nom, nav, folios, flags, footer, `ascii` (thème de pièces, `trace`).
3. `data/*.ts` : fiches, branches, directives, boot.
4. `components/ascii/pieces/index.ts` : remplacer la gravure, les etchings, les bannières.
5. `components/chronos/*` : réécrire les compositions (hero, planches, formulaire) ; les génériques et la grammaire d'impression (folios, repères, tirage, tampon, commutation) servent tels quels à une archive maritime ou à un rapport scientifique.

## 9. Liste de contrôle d'acceptation (à cocher section par section)

Brief §19 : confusion possible avec un template ? hiérarchie travaillée ? espace négatif intentionnel ? typographie à rôle graphique ? détails administratifs qui enrichissent ? l'animation raconte ? lisible sans animation ? mobile conçu ? réutilisable ? — et les corrections de jury :

- [ ] Aucune fonction `color`/`palette` sur `field()` ; la gravure = deux `<pre>` ; `snapshot()` committé pour les deux encres.
- [ ] Aucun texte orange < 24 px ; chaque statut = forme + mot ; carrés en CSS.
- [ ] Aucun filet/bordure/texte Brown sur Obsidian ; hachures Brown seulement sur Paper.
- [ ] Largeurs de bannières lues dans `meta.cols` (101 / 50 / 43 / 12 / 19) ; `drawable()` au build ; tailles par cqw.
- [ ] `mono` sur toute pièce du kit ; `typewriter` avec `cursor: true/false` ; `spinner("line")`.
- [ ] Boot SSR, garde `data-boot` avant peinture, SKIP = premier focalisable, touches limitées, jamais en reduced-motion ; mobile ≤ 1,4 s.
- [ ] Hero : display borné `13svh`, `min-height`, dos lisible à 768 px, première variance scriptée, bouton nexus `aria-pressed`, Replay visible.
- [ ] Registre : rangs = filtres, ≤ 1 anomalie par rang, commutation sèche, PLAY hors du lien étendu, `aria-live` « n records shown », pages `/registry/[id]` depuis un gabarit.
- [ ] Explorer : tablist + `<select>`, légende de formes, trace braille avec police auto-hébergée (ou flag blocks), pas de blinking, sélection bloquée pendant le Tracé initial.
- [ ] Directives : second viewBox mobile, carré orange sur cartouche Obsidian, ligne Obsidian sur Paper, glint `still` sous 768 px et Motion off, `paper: true` en SSR.
- [ ] Formulaire : labels Brown AA, erreurs Obsidian, résumé non collant sur mobile, carbone fonctionnelle, compteur de session, reçu réservé 3 lignes, cran Obsidian.
- [ ] Footer : règle finale + carré or unique, mention d'indépendance, build sha réel ou ligne absente, curseur = seule boucle avec le glint.
- [ ] Global : `html lang="en"`, `data-motion`, MOTION ON/OFF persistant, deux boucles max, ≤ 3 clip-path par viewport, `will-change` temporaire, aucun `from` sur élément visible, `document.fonts.ready`, `(hover: hover)` / `(pointer: coarse)` séparés, Lighthouse mobile Perf ≥ 90 / A11y ≥ 95 / BP ≥ 95 / SEO ≥ 90, zéro erreur console et hydratation.

Fin du document. // NOTHING FOLLOWS //
