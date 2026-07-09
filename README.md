# Innoscripta Frontend Case Study

Dossier de preparation pour l'etude de cas Frontend Developer Innoscripta.

Ce dossier n'est pas un repo Git pour l'instant: il ne contient pas de dossier `.git`. Il est pret a devenir le futur repo quand on decidera de l'initialiser.

## Objectif

Construire et controler une application frontend React + TypeScript pour un agregateur de news:

- recherche d'articles par mot-cle;
- filtres par date, categorie et source;
- flux personnalise par sources, categories et auteurs preferes;
- design mobile responsive;
- integration d'au moins trois sources de news;
- execution documentee dans Docker.

## Structure

- `AGENTS.md`: consignes locales pour les agents qui travailleront ici.
- `.env.example`: variables d'environnement attendues, sans secret.
- `docs/case-study-brief.md`: synthese exploitable du PDF.
- `docs/api-sources.md`: sources API recommandees et points de vigilance.
- `docs/implementation-plan.md`: plan de construction du futur projet.
- `docs/control-checklist.md`: checklist de controle avant livraison.
- `docs/pac-context-summary.md`: synthese du texte colle sur le Portail Academique.
- `source-materials/`: sources originales conservees.

## Sources conservees

- `source-materials/cs-frontend-developer-2025.pdf`
- `source-materials/cs-frontend-developer-2025.txt`
- `source-materials/portail-academique-screen-map.md`

Le PDF Innoscripta est la source autoritaire pour l'etude de cas. La carte du Portail Academique est conservee comme contexte fourni, mais elle ne modifie pas le perimetre produit de l'agregateur de news sauf demande explicite.

## Prochaines actions

1. Confirmer les cles API disponibles pour NewsAPI, The Guardian et New York Times.
2. Initialiser Git uniquement quand demande.
3. Creer l'application React + TypeScript dans ce dossier.
4. Ajouter le proxy ou le mode mock necessaire pour ne jamais exposer de secrets cote navigateur.
5. Implementer, tester, dockeriser, puis verifier avec la checklist.
