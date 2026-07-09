import { defineConfig } from "orval"

export default defineConfig({
  news: {
    input: "./openapi.json",
    output: {
      target: "./src/api/generated/news.ts",
      schemas: "./src/api/generated/model",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: "./src/api/http-client.ts",
          name: "httpClient",
        },
      },
    },
  },
  newsMocks: {
    input: "./openapi.json",
    output: {
      target: "./src/mocks/generated/news.ts",
      schemas: "./src/mocks/generated/model",
      client: "fetch",
      httpClient: "fetch",
      mock: {
        generators: [
          {
            type: "msw",
            baseUrl: "",
            useExamples: true,
          },
        ],
      },
      clean: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
})
