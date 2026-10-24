# Design system et direction artistique

## 1. Thèse

L'écran est une **feuille de dossier classifié imprimée en 1962** sur une presse d'État : une grille de douze colonnes, deux encres (Warm White et Archive Paper sur l'obsidienne), un papier réservé au formulaire, l'olive de l'imprimé administratif pour les dos et les copies carbone. L'administration est calme et sûre d'elle ; elle range le temps comme on range des fiches : folios, cartouches, filets, repères de repérage, tampons.

Le temps est la seule chose qui déborde, et il déborde **comme un défaut d'impression** : un hors-repérage de l'encre orange, rare, bref, toujours régularisé. Le teal n'imprime qu'une chose : la matière temporelle (la ligne sacrée, les orbitales, les lumières). Le vert profond est la couleur des instruments : derrière la glace de la chambre, sur la plaque du champ, sur le plan des branches, l'administration ouvre une fenêtre sur ce qu'elle observe.

Trois registres d'image cohabitent, chacun à sa place : la **gravure au trait** (SVG, ASCII dans l'encre de la page), la **chambre** (une scène 3D à silhouette unique, un artefact strié dans trois orbitales), le **champ** (un shader d'interférence). Jamais de 3D décorative : la chambre et le champ sont des instruments de lecture, légendés en HTML, et chaque état qu'ils montrent existe aussi en mots.

Cette direction est issue d'un atelier à trois concepts (affiche/dossier, terminal, atlas scientifique) jugés par trois lentilles (direction artistique, accessibilité/mobile, faisabilité) ; le concept « dossier » l'a emporté, enrichi des deux autres. La couche GPU s'y est greffée sous la même règle : une interface rigide interrompue par des anomalies belles et contrôlées.

## 2. Signature : le hors-repérage, partagé

Au repos, la page est parfaitement repérée. Un **événement temporel** (`triggerTemporalEvent`) fait glisser une troisième encre, l'orange, de 3 px vers la droite et 2 px vers le haut, en paliers (`steps(5)`) ; la lumière de la fenêtre d'observation passe à l'orange, l'indicateur annonce « Variance detected » ; dans la chambre, Theatre.js joue la plage EVENT (la caméra pousse, l'artefact se hérisse et brûle orange, la lumière monte) ; le champ reçoit une enveloppe de 2,4 s (cœur plus vif, pics orange, frange chromatique) ; l'en-tête et le relevé final comptent l'événement. Quand le bureau enregistre, tout revient en repère d'un coup et un tampon « Registered » s'imprime.

Déclencheurs : scripté une fois à 4,6 s de l'entrée, quand la chambre est posée ; « Simulate a variance event » dans le hero ; « Trigger a variance » dans la section Anomalie. Un seul signal, cinq réponses.

En mouvement réduit, les états permutent sans glissement et la chambre tient sa pose : l'état se lit sans mouvement.

## 3. Tokens

### Couleurs (`styles/tokens.css`, miroir dans `config/palette.ts`)

| Swatch | Hex | Rôle |
| --- | --- | --- |
| Obsidian | `#171914` | fond, encre sur les plaques claires |
| Deep TVA Green | `#29584F` | profondeur : fond de la chambre, plaques immersives (Anomalie, Explorateur), encre temporelle sur papier |
| TVA Sage | `#959A83` | texte secondaire (`--fg-muted`), surfaces et plaques, états stables, art ASCII |
| Temporal Orange | `#D6720C` | **actions et anomalies uniquement** ; 5,3:1 sur l'obsidienne, donc texte et aplats exacts |
| Olive Archive | `#6F6318` | surfaces structurelles : dos de dossier, copie carbone, une planche ; jamais en texte |
| Muted Teal | `#5F7A6E` | matière temporelle : rails, marqueurs, lumières, orbitales (3,8:1 : graphiques seulement) ; texte via `--temporal-text` `#7D9A8C` (5,8) |
| Archive Paper | `#D9D3C5` | texte courant, actions primaires, la feuille du formulaire |
| Warm White | `#F2EBDD` | titres (`--fg-strong`), texte sur olive et vert |

Registre sur l'obsidienne : Warm 14,9 · Paper 11,9 · Sage 6,1 · `--fg-subtle` 5,2 · Orange 5,3 · teal-texte 5,8 · Teal 3,8 (graphique). Sur le vert profond : Warm 6,8 · Paper 5,4 ; le teal s'y éclaircit (`#B4D0C5`, 4,9) et l'orange des marqueurs aussi (`#E8863A`, 3,0 ; texte `#F6B885`, 4,65). Sur le papier : obsidienne 11,9 · vert 5,4 · olive 4,1 (filets) ; l'orange n'y lit qu'en brûlé (`#8A4605`, 4,75) et garde l'aplat exact avec texte obsidienne. `tests/palette.test.ts` tient ce registre.

### Typographie

Trois familles, rôles stricts : **Space Grotesk** titres et accroches ; **IBM Plex Mono** identifiants, données, cartouches, terminaux ; **Inter** corps et composants. L'art ASCII est composé dans la monospace du système (`--font-art-stack`), seule à garantir une chasse unique pour lettres, espaces et blocs.

| Rôle | Taille | Interlignage | Approche |
| --- | --- | --- | --- |
| display (hero) | `clamp(2.875rem, 1rem + 6vw, 7rem)` | 0,92 | −0,035em |
| title (h2 de section, planches) | `clamp(2.125rem, 1.3rem + 3.2vw, 4.25rem)` | 1,0 | −0,025em |
| heading (h3) | `clamp(1.375rem, 1.15rem + 1vw, 1.875rem)` | 1,15 | −0,015em |
| lead | `clamp(1.0625rem, 1rem + 0.4vw, 1.3125rem)` | 1,5 | −0,005em |
| body | 1rem | 1,6 | 0 |
| small | 0,875rem | 1,5 | 0 |
| mono (données) | 0,8125rem | 1,55 | 0 |
| micro (cartouches, légendes des instruments) | 0,75rem | 1,4 | +0,08em, capitales |

Les capitales sont réservées au titre du hero, aux titres des planches et aux microlabels. Les titres de section sont en bas de casse : c'est la voix du site, pas celle de la propagande.

### Espace, forme, profondeur

Rayons quasi nuls (2–3 px), aucune ombre portée décorative (une seule, sous le dialogue et le menu), gouttières fluides, rythme de section `clamp(5rem, 6rem + 6vw, 11rem)`, largeur de contenu 84rem. Les instruments (chambre, fenêtre, plaque du champ) partagent le même cadre à coins marqués (`Frame`), avec un intitulé posé sur le filet, une lumière et un tampon.

## 4. Grammaire d'animation

| Primitive | Moteur | Geste | Valeurs |
| --- | --- | --- | --- |
| Composition | GSAP | les lignes du titre sortent de leur masque | `yPercent 110→0`, 0,9 s, `power3.out`, décalage 0,1 s |
| Tracé | GSAP | la ligne se dessine, les branches suivent | `drawSVG`, 1,4–1,8 s ; les pointillés se fondent |
| Hors-repérage | CSS + signal | la troisième encre glisse | `translate(3px, −2px)`, `steps(5)`, 160 ms |
| Tampon | CSS | le cachet frappe | 260 ms, `steps(5)` |
| Entrée de la chambre | Theatre.js | la caméra descend, l'artefact se calme, les orbitales se déploient | plage 0–4 s, pose de repos |
| Variance de la chambre | Theatre.js | poussée de caméra, distorsion, pulse, lumière | plage 4,5–8 s, retour à la pose |
| Champ | GLSP (uniforms) | anneaux, déplacement, cœur ; `uScroll` resserre, `uEvent` embrase, `uCollapse` replie | par image, jamais de recompilation |
| Parallaxe | boucle de rendu | la chambre penche vers le pointeur | ±0,45 u, amortie (λ = 4) |
| Révélation | GSAP | entrée au scroll, une fois ; dérive de quelques pixels pour les planches | `opacity + y 28→0`, 0,9 s ; dérive ±18–28 px scrubbée |
| Section épinglée | GSAP ScrollTrigger | la plaque du champ reste, trois phases la lisent | pin sur ≥ 64rem et mouvement autorisé, `+=120%` |
| Sélection | Motion | l'indicateur glisse d'un onglet ou d'un filtre à l'autre | `layoutId`, ressort amorti |
| Cartes et menu | Motion | lever de 3 px, pression 1 %, menu sur ressort | ressorts `bounce 0` |

Règles de retenue : une seule section épinglée ; aucune boucle permanente hors des instruments et du curseur final ; aucun blur animé ; pas de défilement doux ; `prefers-reduced-motion` : tout est en place à l'arrivée, les scènes tiennent une pose, les shaders une image basse cadence.

## 5. Plan des images

| Où | Registre | Pièce |
| --- | --- | --- |
| Hero, chambre | 3D | artefact strié (shader `artifact`), trois orbitales, poussière ; fond vert profond ; plaque SVG `ChamberFallback` dessous |
| Hero, fenêtre d'observation | ASCII | `nexus-field` 44×15 (kit), canvas bichrome |
| Section 03, plaque du champ | shader | `temporal-field` ; plaque SVG `FieldPlate` dessous |
| Registre | SVG, numéraux, ASCII, géométrie, shader | schémas, `Banner` numéral, `fern`, trame géométrique, deux vignettes `temporal-field` (reactor / shadow) sur `FieldPlate` |
| Explorateur | SVG | plan des branches, rail teal, nexus orange ; la branche choisie allume une orbitale de la chambre |
| Directives | SVG | six planches, grounds sauge / obsidienne / papier / vert / olive / obsidienne, accent et marque par ground |
| Formulaire | ASCII | reçu `typed-line` sur la copie carbone olive |
| Colophon | ASCII + HTML | `Banner` « CHRONOS », relevé de session, `nexus-field` à l'encre, `// NOTHING FOLLOWS //` |

## 6. Composition par section

1. **Boot** : un bordereau de transmission, deux secondes, « Skip · Esc », une fois par session, jamais en mouvement réduit.
2. **Hero** : titre en trois lignes (7 colonnes) ; la chambre carrée à droite (5 colonnes), aussi haute que titre et note réunis, le cue de défilement sous elle ; sous le titre, la note de dossier et les deux commandes à côté de la fenêtre d'observation ; le rail traverse la feuille et les deux actions sont des stations posées dessus ; dos de dossier olive au bord droit. Mobile : bandeau, titre, chambre 4:3, note, fenêtre, actions, rail.
3. **Anomalie** : plaque vert profond pleine largeur ; copie à gauche (trois phases, l'active soulignée d'orange), plaque du champ à droite (7 colonnes) épinglée au défilement ; curseur d'intensité, « Collapse the field », « Trigger a variance ».
4. **Registre** : filtres réels avec indicateur glissant ; grille réglée de huit dossiers, cinq familles de planche ; les cartes se lèvent au survol ; « Open file » ouvre un `<dialog>`.
5. **Explorateur** (vert profond) : légende forme + couleur ; plan SVG ; `tablist` au clavier avec indicateur glissant ; panneau en cadre à lumière et tampon ; la sélection remonte dans l'en-tête et dans la chambre.
6. **Directives** : six affiches 4:5 en alternance 7/5, figures qui dérivent de quelques pixels au défilement.
7. **Formulaire NX-7** : feuille de papier avec copie carbone olive, champs numérotés, validation réelle ; au succès le tampon frappe et la copie tape le reçu.
8. **Colophon** : nom en lettres plombées, état, index, colophon ; relevé de session (branche, dossiers, variances, mouvement, effets) et dernière lecture du champ à l'encre ; la ligne graduée s'arrête sur un carré teal, « NOTHING FOLLOWS ».

## 7. Ce qui est générique, ce qui est TVA

Générique : tokens, `Container`, `Section`, `SectionHeader`, `Grid`, `Card`, `Frame`, `Button`, `Badge`, `StatusIndicator`, `Metadata`, `Divider`, `Stamp`, `EdgeBand`, `CornerMarks`, `TerminalPanel`, formulaires, `Reveal`, `AnimatedText`, `MotionCard`, `MotionProvider`, `ScrollSignals`, `AsciiScene`, `AsciiBanner`, `ArtBoundary`, `SceneBoundary`, `ShaderCanvas`, `FieldPlate`, les pièces de la chambre, `lib/signals.ts`.

TVA : tout `components/chronos` (mots, folios, tampons, chorégraphies, phases du champ, spec Theatre), `data/*`, la pièce `nexus-field`, l'icône.

La grammaire d'impression (folios, repères, tirage, tampon, hors-repérage) et le motif « plaque en HTML, instrument par-dessus » restent utilisables tels quels pour une archive maritime, un rapport scientifique ou un studio : seuls les mots, les couleurs et les données changent.
