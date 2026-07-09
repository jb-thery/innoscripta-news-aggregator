# API Sources

References verifiees le 9 juillet 2026:

- NewsAPI documentation: https://newsapi.org/docs
- NewsAPI get started: https://newsapi.org/docs/get-started
- The Guardian Open Platform: https://open-platform.theguardian.com/
- The Guardian access levels: https://open-platform.theguardian.com/access/
- New York Times Article Search public spec: https://github.com/nytimes/public_api_specs/blob/master/article_search/article_search_v2.md

## Selection initiale

| Source | Usage dans l'app | Variables | Notes |
| --- | --- | --- | --- |
| NewsAPI.org | Recherche generale, top headlines, liste de sources | `NEWS_API_KEY`, `NEWS_API_BASE_URL` | Bon candidat pour recherche par mot-cle, date, source et categorie. Peut aussi exposer BBC via `bbc-news`. |
| The Guardian Open Platform | Articles Guardian, sections, recherche, contenu archive | `GUARDIAN_API_KEY`, `GUARDIAN_API_BASE_URL` | Cle developpeur non commerciale avec quota documente. Bon candidat pour categories et contenu riche. |
| New York Times APIs | Recherche d'articles NYT, filtres, facets | `NYT_API_KEY`, `NYT_API_BASE_URL` | Bon candidat pour recherche et filtres par date, section, source ou type de contenu. |

## Modele de donnees cible

Normaliser chaque provider vers un objet commun:

```ts
export interface Article {
  id: string;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  source: string;
  provider: "newsapi" | "guardian" | "nytimes";
  author: string | null;
  category: string | null;
  publishedAt: string;
}
```

## Contrat des adaptateurs

Chaque source doit exposer le meme contrat applicatif:

```ts
export interface ArticleSearchParams {
  query: string;
  fromDate?: string;
  toDate?: string;
  category?: string;
  source?: string;
  author?: string;
}

export interface ArticleProvider {
  id: Article["provider"];
  label: string;
  search(params: ArticleSearchParams): Promise<Article[]>;
}
```

## Strategie secrets

- Ne pas prefixer les cles API avec `VITE_`.
- Ne pas appeler une API necessitant un secret directement depuis le navigateur.
- Preferer un proxy minimal, une API route ou un serveur Docker qui lit les cles cote serveur.
- Si les cles ne sont pas disponibles, garder un mode mock explicite avec des fixtures realistes et documenter la limitation.

## Fallbacks a documenter si besoin

- Si NewsAPI bloque le navigateur ou le plan gratuit, passer par proxy ou fixtures.
- Si Guardian depasse le quota, afficher un etat partiel et continuer les autres providers.
- Si NYT ne retourne pas de contenu complet, afficher les metadonnees disponibles et le lien original.
