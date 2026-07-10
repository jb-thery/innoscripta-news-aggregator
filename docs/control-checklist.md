# Control Checklist

Vérification locale du 10 juillet 2026.

## Source et cadrage

- [x] Les documents source identifiants de l'étude de cas ne sont pas suivis dans le dépôt.
- [x] Les exigences durables sont conservées dans `docs/case-study-brief.md`.
- [x] La méthodologie IA du README est présentée comme un différenciateur professionnel, pas comme une exigence inventée du brief.
- [x] `PLAN.md` reste ignoré et non suivi par Git.

## Fonctionnel

- [x] Recherche par mot-clé avec debounce, conservation du focus et synchronisation après navigation arrière.
- [x] Filtres date, catégorie, source et auteur dans l'URL.
- [x] Préférences de sources, catégories et auteurs.
- [x] Flux personnalisé visible et persistant après rechargement.
- [x] Validation accessible des doublons d'auteur, traduite en anglais et allemand.
- [x] États chargement, vide, erreur et succès partiel.
- [x] Liens vers six articles réellement publiés, sans destination `/mock/` en 404.
- [x] Interface anglais/allemand et thèmes clair/sombre.

## Sources de données

- [x] NewsAPI.org intégré avec fallback mock explicite.
- [x] The Guardian intégré avec fallback mock explicite.
- [x] New York Times intégré avec fallback mock explicite.
- [x] Chaque fournisseur est normalisé vers le schéma `Article`.
- [x] Une indisponibilité fournisseur conserve les autres résultats.

## Sécurité et configuration

- [x] Aucun secret détecté dans le diff ou les fichiers suivis.
- [x] Les fichiers `.env` réels sont ignorés par Git et Docker.
- [x] Les clés API restent côté serveur et ne sont pas injectées au build frontend.
- [x] Vite charge les valeurs publiques `VITE_*` depuis la racine du monorepo.
- [x] Compose transmet uniquement les valeurs PostHog publiques comme arguments de build.
- [x] Le serveur applique CSP et les en-têtes de sécurité documentés.
- [x] `pnpm audit --audit-level low` ne remonte aucune vulnérabilité connue.
- [x] PostHog reste désactivé et hors du chemin initial sans configuration, et ne capture pas le texte recherché.
- [x] Le conteneur s'exécute avec l'utilisateur non-root `node`.

## UI et accessibilité

- [x] Lien d'évitement clavier vers le contenu principal.
- [x] Contrôles sémantiques, labels, noms de formulaire et focus visible.
- [x] Régions live pour statut runtime, sources, résultats et erreurs de validation.
- [x] Images avec dimensions intrinsèques, priorité de la première image et lazy loading des suivantes.
- [x] Motion réduite respectée et transitions mortes des filtres supprimées.
- [x] Aucun overflow horizontal en viewport mobile `390 x 844`.
- [x] Header pleine largeur sur desktop et mobile, sans gouttières de fond latérales.
- [x] Console sans erreur ni avertissement applicatif.
- [x] Lighthouse mobile: 100 accessibilité, bonnes pratiques, SEO et navigation agentique.

## Monorepo et scripts

- [x] `mise run local` installe puis démarre Vite `5173` et Hono `3001`.
- [x] `mise run docker` construit et démarre la stack de revue sur `4174`.
- [x] `mise run stop` nettoie la stack Docker.
- [x] Le typecheck découvre automatiquement les cinq workspaces.
- [x] Les configurations racine et la spec Playwright sont typecheckées.
- [x] Vitest sépare les suites Node et jsdom.
- [x] `preview` et `preview:static` construisent leurs artefacts avant démarrage.
- [x] Node `22.22.3` et pnpm `10.34.4` sont épinglés.
- [x] Les configurations partagées `.zed` et `.codex` sont suivies, sans secret, avec Ragmir épinglé et exécutable.

## Qualité et validation

- [x] `mise run verify`: Biome, TypeScript, couverture et build de production.
- [x] 43 tests Vitest verts dans 11 fichiers.
- [x] Seuils de couverture: 80% statements/lines/functions et 65% branches.
- [x] Couverture logique TypeScript: 85,14% statements, 84,77% lines, 85,36% functions et 66,66% branches.
- [x] `pnpm test:e2e`: 5 parcours sur desktop et mobile Chromium, soit 10 exécutions vertes.
- [x] `pnpm build:static-demo` et `pnpm build:pages`.
- [x] `mise run docker:verify`: build, healthcheck, recherche API et nettoyage.
- [x] Smokes preview sur `/`, `/feed`, `/api/health` et `/api/search`.
- [x] React Doctor: 97/100, seul avertissement faux positif sur le setup Vitest référencé.
- [x] Actionlint valide les workflows GitHub Actions.
- [x] Client OpenAPI généré sans dérive.
- [x] `git diff --check`.

## Documentation et livraison

- [x] README public recentré sur la candidature et la méthodologie IA responsable.
- [x] Stack, observabilité, CI, sécurité, règles d'ingénierie et commandes principales documentées.
- [x] `docs/architecture.md` remplace l'ancien document nommé comme un plan.
- [x] Les chiffres de validation détaillés ne sont conservés que dans cette checklist datée.
- [x] Le workflow Pages attend une CI `main` réussie avant déploiement.
- [x] La branche `feature/architecture-improvements` est volontairement conservée.
- [x] Les changements sont regroupés en commits locaux signés sur la branche de travail.
- [x] Aucun push n'est effectué sans autorisation explicite.
- [ ] La CI distante de ces commits sera disponible après un prochain push autorisé.
