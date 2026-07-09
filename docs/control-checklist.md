# Control Checklist

## Source et cadrage

- [ ] Le PDF original est conserve dans `source-materials/`.
- [ ] Le texte extrait du PDF est conserve dans `source-materials/`.
- [ ] Les exigences du PDF sont couvertes dans `docs/case-study-brief.md`.
- [ ] La carte PAC est conservee et identifiee comme contexte non obligatoire.

## Fonctionnel

- [ ] Recherche par mot-cle.
- [ ] Filtre par date.
- [ ] Filtre par categorie.
- [ ] Filtre par source.
- [ ] Preferences de sources.
- [ ] Preferences de categories.
- [ ] Preferences d'auteurs.
- [ ] Flux personnalise visible.
- [ ] Etats chargement, vide, erreur et succes partiel.
- [ ] Liens vers articles originaux.

## Sources de donnees

- [ ] NewsAPI.org integre ou mocke explicitement.
- [ ] The Guardian integre ou mocke explicitement.
- [ ] New York Times integre ou mocke explicitement.
- [ ] Les donnees de chaque provider sont normalisees vers `Article`.
- [ ] Les quotas, erreurs et indisponibilites sont geres sans casser toute la page.

## Securite

- [ ] Aucun secret dans le code source.
- [ ] Aucun secret dans `.env.example`.
- [ ] Les vrais `.env` sont ignores par Git.
- [ ] Les cles API ne sont pas exposees dans le bundle navigateur.

## UI et accessibilite

- [ ] Interface lisible sur mobile.
- [ ] Interface lisible sur desktop.
- [ ] Controles interactifs semantiques.
- [ ] Labels accessibles pour champs et controles.
- [ ] Focus visible.
- [ ] Texte des cartes non tronque de maniere bloquante.

## Qualite

- [ ] Code TypeScript sans `any` inutile.
- [ ] Adaptateurs provider separes.
- [ ] Logique de filtrage testable.
- [ ] Preferences testables.
- [ ] Pas de duplication excessive.
- [ ] Pas d'abstraction speculative.

## Validation

- [ ] Format ou lint execute.
- [ ] Typecheck execute.
- [ ] Tests executes.
- [ ] Build execute.
- [ ] Docker build execute.
- [ ] Docker run execute.
- [ ] Smoke test local effectue.
- [ ] Diff scanne pour secrets.

## Documentation livraison

- [ ] `README.md` explique l'installation.
- [ ] `README.md` explique le lancement local.
- [ ] `README.md` explique le lancement Docker.
- [ ] `.env.example` liste toutes les variables.
- [ ] Limitations et mocks sont documentes.
