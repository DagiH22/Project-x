import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, uploadDocument, deleteDocument, getDocumentPreview } from '../api';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';

export const useDocuments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS.ALL,
    queryFn: getDocuments,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.ALL });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.ALL });
    },
  });
};

export const useDocumentPreview = (documentId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS.PREVIEW(documentId!),
    queryFn: () => getDocumentPreview(documentId!),
    enabled: !!documentId,
    retry: false,
  });
};
