export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'],
  },
  DOCUMENTS: {
    ALL: ['documents'],
    PREVIEW: (id: string) => ['documents', 'preview', id],
  },
} as const;
