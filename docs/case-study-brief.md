# Case Study Brief

Source principale: `source-materials/cs-frontend-developer-2025.pdf`, extrait texte disponible dans `source-materials/cs-frontend-developer-2025.txt`.

Date de verification locale: 9 juillet 2026.

## Mission

Creer l'interface utilisateur d'un site d'agregation de news qui recupere des articles depuis plusieurs sources et les presente dans un format propre et facile a lire.

## Exigences produit

- Recherche d'articles par mot-cle.
- Filtrage des resultats par date, categorie et source.
- Flux personnalise configurable par sources, categories et auteurs preferes.
- Optimisation mobile responsive.

## Exigences techniques

- Projet frontend en React.js avec TypeScript.
- Au moins trois sources de donnees choisies dans la liste du brief.
- Application containerisee avec Docker.
- Documentation claire pour lancer le projet dans un container Docker.
- Code conforme aux principes DRY, KISS et SOLID.

## Sources listees dans le brief

- NewsAPI.
- OpenNews.
- NewsCred.
- The Guardian.
- New York Times.
- BBC News.
- NewsAPI.org.

## Sources recommandees pour l'implementation

Les trois sources recommandees pour demarrer sont:

1. NewsAPI.org.
2. The Guardian Open Platform.
3. New York Times APIs.

Raison: ce sont les options les plus directement exploitables avec des documentations publiques et des endpoints adaptes a la recherche, au filtrage ou a la recuperation d'articles.

## Points d'attention

- NewsAPI et NewsAPI.org semblent designer la meme famille de service dans le brief. Ne pas les compter comme deux sources independantes sans validation explicite.
- BBC News peut etre couvert via NewsAPI avec `bbc-news`, mais cela ne remplace pas une integration BBC independante si l'evaluateur exige trois fournisseurs distincts.
- Les cles API ne doivent pas etre exposees dans le bundle client. Prevoir un proxy serveur ou un mode mock selon les cles disponibles.
- La personnalisation doit etre visible dans l'interface, pas seulement stockee en interne.
