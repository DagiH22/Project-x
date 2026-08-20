'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, FileText, Loader2, File } from 'lucide-react';
import { useDocuments, useDeleteDocument } from '../hooks/use-documents';
import { toast } from 'sonner';

export function DocumentList() {
  const { data: documents, isLoading, isError } = useDocuments();
  const deleteMutation = useDeleteDocument();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string, filename: string) => {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) {
      return;
    }

    setDeletingId(id);
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`Document deleted successfully.`);
        setDeletingId(null);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Failed to delete document.');
        setDeletingId(null);
      },
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    return <File className="h-4 w-4 text-blue-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-lg">
        <p>Failed to load documents. Please try again later.</p>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center p-12 border rounded-lg bg-card text-card-foreground">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <h3 className="text-lg font-medium">No documents</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a document to get started building your knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Filename</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium flex items-center gap-2">
                {getFileIcon(doc.mimeType)}
                <span className="truncate max-w-[200px] sm:max-w-[300px]" title={doc.filename}>
                  {doc.filename}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs uppercase bg-muted px-2 py-1 rounded-md">
                  {doc.mimeType === 'application/pdf' ? 'PDF' : 'TXT'}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatSize(doc.size)}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    doc.status === 'uploaded' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    doc.status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    doc.status === 'ready' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(doc.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  disabled={deletingId === doc.id}
                  onClick={() => handleDelete(doc.id, doc.filename)}
                  title="Delete document"
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
