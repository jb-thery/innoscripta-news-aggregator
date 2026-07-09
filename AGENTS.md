# AGENTS.md - Innoscripta Frontend Case Study

Ces regles s'appliquent a ce dossier et au futur repo Git qui sera initialise ici.

## Perimetre

- Construire une application frontend React + TypeScript pour l'etude de cas Innoscripta.
- Ne pas initialiser Git, commit, push ou creer de remote sans demande explicite.
- Le brief PDF est la source autoritaire: `source-materials/cs-frontend-developer-2025.pdf`.
- Le texte PAC est un contexte conserve: `source-materials/portail-academique-screen-map.md`. Ne pas en faire une exigence produit de l'agregateur de news sans instruction explicite.

## Communication et fichiers

- Repondre a l'utilisateur en francais.
- Ecrire le code, les identifiants, les commentaires, les noms de fichiers et les commits en anglais.
- Garder les documents de projet en francais sauf contenu utilisateur ou API en anglais.
- Ne jamais utiliser de tiret long U+2014.
- Preferer des diffs courts, lisibles et strictement lies a la demande.

## Securite

- Ne jamais commiter de secret, de cle API, de token ou de fichier `.env`.
- Garder les vrais secrets dans `.env.local`, un secret manager ou les variables Docker/CI.
- `.env.example` doit contenir uniquement des noms de variables et des valeurs factices non sensibles.
- Les cles NewsAPI, Guardian et NYT ne doivent pas etre exposees dans le bundle navigateur.
- Si une API exige une cle secrete, passer par un proxy local, un serveur minimal, une route backend ou un mode mock documente.

## Stack attendu

- Frontend: React + TypeScript.
- Outil recommande: Vite avec le template `react-ts`.
- Package manager recommande: `pnpm`, sauf contrainte contraire.
- Styling: CSS modulaire ou solution legere, mobile-first, sans framework lourd sauf besoin justifie.
- Etat: URL pour recherche/filtres partageables, `localStorage` pour preferences utilisateur.
- Donnees: une interface `Article` normalisee et un adaptateur par source.

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

Utiliser au moins trois sources issues du brief:

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
- Preferer les tests de comportement sur les fonctions de normalisation, filtrage et preferences.
- Avant de declarer une livraison prete, executer les plus petits controles pertinents:
  - format/lint;
  - typecheck;
  - tests unitaires ou integration;
  - build;
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
