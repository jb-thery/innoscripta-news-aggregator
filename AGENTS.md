# AGENTS.md - Signal Desk

Ces regles s'appliquent au depot Git Signal Desk.

## Perimetre

- Construire et maintenir un agregateur de news React + TypeScript livre avec son BFF.
- Ne pas commit, push ou creer de remote sans demande explicite.
- Le brief anonymise est la source produit autoritaire: `docs/case-study-brief.md`.
- Ne pas reintegrer de nom d'entreprise, de document source identifiant ou de marque d'evaluateur dans le depot.
- Le texte PAC est un contexte conserve: `source-materials/portail-academique-screen-map.md`. Ne pas en faire une exigence produit de l'agregateur de news sans instruction explicite.

## Communication et fichiers

- Repondre a l'utilisateur en francais.
- Ecrire le code, les identifiants, les commentaires, les noms de fichiers et les commits en anglais.
- Garder les documents de projet en francais, sauf le README public et le contenu utilisateur ou API en anglais.
- Le README peut nommer les outils IA et workflows utilises afin de documenter explicitement la methodologie professionnelle demandee pour cette candidature.
- Ne jamais utiliser de tiret long U+2014.
- Preferer des diffs courts, lisibles et strictement lies a la demande.

## Securite

- Ne jamais commiter de secret, de cle API, de token ou de fichier `.env`.
- Garder les vrais secrets dans `.env.local`, un secret manager ou les variables Docker/CI.
- `.env.example` doit contenir uniquement des noms de variables et des valeurs factices non sensibles.
- Les cles NewsAPI, Guardian et NYT ne doivent pas etre exposees dans le bundle navigateur.
- Si une API exige une cle secrete, passer par un proxy local, un serveur minimal, une route backend ou un mode mock documente.

## Stack actuelle

- Frontend: React 19 + TypeScript strict + Vite 8.
- Monorepo: workspace pnpm avec `apps/frontend`, `apps/backend` et packages reutilisables sous `packages/`.
- Contrats et chemins partages: `packages/contracts`.
- Filtrage et fixtures partages: `packages/news-domain`.
- Primitives UI reutilisables: `packages/ui`.
- Package manager: `pnpm` 10.34.4 via Corepack.
- Runtime local: Node 22.22.3 et commandes partagees via `mise`.
- Styling: Tailwind CSS v4 et CSS editorial mobile-first.
- Etat: URL pour recherche/filtres partageables, `localStorage` pour preferences utilisateur.
- Donnees: TanStack Query, TanStack Router, schema `Article` Zod et un adaptateur serveur par source.
- BFF: Hono contract-first dans `apps/backend`, OpenAPI partage et client Orval genere dans `apps/frontend`.
- Runtime: un container Node sert la SPA et `/api` sur le port 3000.
- Configuration frontend: Vite charge les variables publiques `VITE_*` depuis la racine du monorepo; Docker les recoit au build, les secrets fournisseurs restent au runtime.

## Commandes de reference

- `pnpm dev`: client Vite 5173 et serveur Hono 3000.
- `pnpm check`: format et lint Biome.
- `pnpm typecheck`: TypeScript strict.
- `pnpm test`: tests Vitest.
- `pnpm test:coverage`: tests Vitest avec seuils de couverture obligatoires.
- `pnpm test:e2e`: smoke Playwright, a lancer hors session navigateur live.
- `pnpm build`: build client et bundle serveur autonome.
- `pnpm build:pages`: build statique GitHub Pages avec base path et routing hash.
- `pnpm build:static-demo`: build client autonome avec fixtures locales, sans serveur API.
- `mise run local`: installation des dependances et lancement Vite 5173 + Hono 3001.
- `mise run docker`: build et lancement du container sur le port hote 4174.
- `mise run stop`: arret et suppression de la stack Docker locale.
- `mise run verify`: Biome, TypeScript, couverture et build de production.
- `mise run docker:verify`: build, smoke `/api/health` et `/api/search`, puis arret propre.

## JCode skills disponibles

Les skills du repo `jcode-agent-skills` sont installees localement et peuvent etre utilisees dans ce dossier quand elles correspondent a la tache:

- `docs-cartographer`: synchroniser README, docs et consignes agent avec l'etat reel du dossier.
- `dependency-tune-up`: auditer ou mettre a jour les dependances JavaScript/TypeScript.
- `browser-proof`: prouver un comportement navigateur avec console, DOM, reseau, captures et viewport.
- `commit-surgeon`: preparer des commits atomiques seulement si l'utilisateur demande de committer.
- `ship`: publier via GitHub seulement apres initialisation Git et demande explicite.
- `release-pilot`: piloter une promotion d'environnement seulement quand un vrai pipeline existe.
- `issue-forensics`: traiter un ticket GitHub, GitLab ou Notion en partant de la source tracker.
- `ticket-hound`: traiter une tache Notion en detail avec checklist de verification humaine.
- `seo-monster-audit`: auditer le SEO si une surface publique est creee.
- `skill-garage`: reparer ou mettre a jour l'installation locale des skills.
- `skill-scout`: auditer une skill externe avant de l'adapter.
- `voice-forge`: produire une narration audio si une demande de contenu audio apparait.

## Sources de news recommandees

Utiliser au moins trois sources issues du brief anonymise:

- NewsAPI.org;
- The Guardian Open Platform;
- New York Times APIs.

Avant implementation, revalider les limites, les endpoints et les conditions d'usage avec les docs officielles. Si une source est indisponible, documenter le remplacement et garder au moins trois sources utilisables.

## Exigences fonctionnelles minimales

- Recherche par mot-cle.
- Filtrage par date, categorie et source.
- Flux personnalise par sources, categories et auteurs preferes.
- Cartes articles lisibles avec titre, source, auteur si disponible, date, description et lien original.
- Etats de chargement, vide, erreur et donnees partielles par source.
- Responsive mobile, tablette et desktop.

## Qualite et validation

- Appliquer KISS, DRY et des responsabilites separees sans abstraction speculative.
- Appliquer SOLID uniquement aux frontieres qui le justifient et YAGNI avant toute generalisation.
- Remplacer les magic strings et magic numbers significatifs par des constantes ou contrats partages.
- Supprimer le code mort, duplique, obsolete, commente ou de debug au lieu de le conserver.
- Refuser l'over-engineering, les couches generiques sans besoin actuel et les tests de couverture superficiels.
- Mesurer la couverture Vitest sur la logique TypeScript non generee et couvrir les composants/routes par les parcours Playwright.
- Preferer les tests de comportement sur les fonctions de normalisation, filtrage et preferences.
- Avant de declarer une livraison prete, executer les plus petits controles pertinents:
  - format/lint;
  - typecheck;
  - tests unitaires ou integration;
  - build;
  - build statique de demonstration;
  - build Docker;
  - smoke test local du container.
- Mettre a jour `README.md`, `.env.example` et la documentation Docker avec chaque changement qui affecte l'execution.

## Definition of Done

- Le projet demarre localement avec la commande documentee.
- Le container Docker demarre avec la commande documentee.
- Les trois sources sont integrees ou remplacees par des mocks documentes si les cles manquent.
- Les fonctionnalites du brief sont couvertes.
- Aucune cle API ni valeur secrete n'apparait dans le diff.
- La checklist `docs/control-checklist.md` est completee ou explicitement annotee.
