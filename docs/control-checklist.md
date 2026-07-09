# Control Checklist

Verification locale du 10 juillet 2026.

## Source et cadrage

- [x] Le PDF original est conserve dans `source-materials/`.
- [x] Le texte extrait du PDF est conserve dans `source-materials/`.
- [x] Les exigences du PDF sont couvertes dans `docs/case-study-brief.md` et `PLAN.md`.
- [x] La carte PAC est conservee et identifiee comme contexte hors perimetre.

## Fonctionnel

- [x] Recherche par mot-cle avec debounce.
- [x] Filtres date, categorie, source et auteur dans l'URL.
- [x] Preferences de sources, categories et auteurs.
- [x] Flux personnalise visible et persistant apres rechargement.
- [x] Etats chargement, vide, erreur et succes partiel.
- [x] Liens vers les articles originaux.
- [x] Interface anglais/allemand.
- [x] Themes clair/sombre.

## Sources de donnees

- [x] NewsAPI.org integre avec fallback mock explicite.
- [x] The Guardian integre avec fallback mock explicite.
- [x] New York Times integre avec fallback mock explicite.
- [x] Chaque provider est normalise vers le schema `Article`.
- [x] Une indisponibilite provider conserve les autres resultats.

## Securite

- [x] Aucun secret dans le code source ou `.env.example`.
- [x] Les fichiers `.env` reels sont ignores par Git et Docker.
- [x] Les cles API restent cote serveur et ne sont pas dans le bundle navigateur.
- [x] Le serveur applique CSP et en-tetes de securite.
- [x] Le conteneur s'execute avec l'utilisateur non-root `node`.

## UI et accessibilite

- [x] Interface controlee en 1440 x 1000 et 390 x 844.
- [x] Aucun overflow horizontal mobile.
- [x] Controles semantiques, labels et focus visible.
- [x] Filtres fermes absents de l'arbre accessible.
- [x] Cibles tactiles principales de 44 px minimum.
- [x] Texte des cartes lisible sans troncature bloquante.
- [x] Lighthouse mobile: Accessibility 100 et Best Practices 100.

## Qualite et validation

- [x] `pnpm check`.
- [x] `pnpm typecheck`.
- [x] `pnpm test`, 14 tests verts.
- [x] `pnpm test:e2e`, 2 scenarios Chromium verts.
- [x] `pnpm build`.
- [x] `pnpm build:static-demo`.
- [x] `docker build -t innoscripta-news-aggregator:local .`.
- [x] `docker run` sans cle en mode mock.
- [x] Smoke container sur `/`, `/api/health` et `/api/search`.
- [x] Console navigateur sans erreur ni avertissement.
- [x] Demo statique validee sans requete fetch ou XHR, y compris sur `/feed` apres rechargement.
- [x] Diff controle avec `git diff --check`.

## Documentation livraison

- [x] `README.md` explique architecture, installation, local, Docker et variables.
- [x] `.env.example` liste les variables sans valeur sensible.
- [x] Modes mock, mixed, live et demo statique documentes.
- [x] Limitations et suites documentees.
- [x] Captures production desktop et mobile presentes.

## Publication

- [x] Repo GitHub public cree.
- [ ] Branches Git poussees.
- [ ] CI GitHub distante verte.
- [ ] Tag `v1.0.0` publie sur `main`.
- [ ] Demo live accessible et liee depuis le README.
- [ ] Email de soumission envoye avec lien du repo et CV a jour.
