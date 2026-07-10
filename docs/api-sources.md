# API Sources

References verifiees le 9 juillet 2026:

- NewsAPI documentation: https://newsapi.org/docs
- NewsAPI get started: https://newsapi.org/docs/get-started
- The Guardian Open Platform: https://open-platform.theguardian.com/
- The Guardian access levels: https://open-platform.theguardian.com/access/
- New York Times Article Search public spec: https://github.com/nytimes/public_api_specs/blob/master/article_search/article_search_v2.md

## Sources implementees

| Source | Usage dans l'app | Variables | Notes |
| --- | --- | --- | --- |
| NewsAPI.org | Endpoint `/everything`, recherche et dates | `NEWS_API_KEY`, `NEWS_API_BASE_URL` | Le BFF transmet la cle cote serveur et normalise la reponse. |
| The Guardian Open Platform | Endpoint `/search`, sections et champs enrichis | `GUARDIAN_API_KEY`, `GUARDIAN_API_BASE_URL` | Le BFF demande `trailText`, `thumbnail` et `byline`. |
| New York Times APIs | Article Search v2, dates et sections | `NYT_API_KEY`, `NYT_API_BASE_URL` | Le BFF adapte les champs `headline`, `byline`, `section_name` et `multimedia`. |

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
export interface SearchParams {
  q: string;
  from?: string;
  to?: string;
  category?: string;
  providers?: string;
  author?: string;
}

export interface ArticleProvider {
  id: Article["provider"];
  hasLiveCredentials(): boolean;
  search(params: SearchParams, signal?: AbortSignal): Promise<Article[]>;
}
```

## Strategie secrets

- Ne pas prefixer les cles API avec `VITE_`.
- Ne pas appeler une API necessitant un secret directement depuis le navigateur.
- Le BFF Hono est l'unique frontiere qui lit et transmet les cles fournisseurs.
- Docker Compose lit les cles depuis un `.env` ignore.
- En local, exporter les cles dans le shell avant `mise run local`; Vite ne les transmet pas au processus Hono.

## Comportement runtime

- Sans cle, l'adaptateur concerne utilise ses fixtures realistes.
- Avec une cle, une erreur HTTP, un quota depasse ou un schema invalide marque la source en erreur sans remplacer la reponse par des fixtures.
- Les autres fournisseurs continuent et leurs resultats restent visibles.
- `/api/health` decrit uniquement le mode de configuration `mock`, `mixed` ou `live` selon la presence des cles.
- `/api/search` expose le succes ou l'echec reel de chaque fournisseur pour la recherche courante.
- NewsAPI `/everything` ne fournit pas de categorie native. La precision du filtre categorie de cet adaptateur live reste une limite a traiter avant une production reelle.
