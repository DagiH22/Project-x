'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useUploadDocument } from '../hooks/use-documents';
import { toast } from 'sonner';

export function DocumentUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocument();

  const handleUpload = (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      toast.error('Unsupported file format. Please upload PDF or TXT.');
      return;
    }

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit.');
      return;
    }

    uploadMutation.mutate(file, {
      onSuccess: () => {
        toast.success(`${file.name} uploaded successfully.`);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Failed to upload document.');
      },
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Add a new document to the knowledge base. Supported formats: PDF, TXT (Max 5MB).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleUpload(file);
          }}
        >
          <div className="bg-muted p-4 rounded-full mb-4">
            {uploadMutation.isPending ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {uploadMutation.isPending ? 'Uploading...' : 'Click or drag file to this area to upload'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Support for a single upload.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.txt,application/pdf,text/plain"
            onChange={onFileChange}
            disabled={uploadMutation.isPending}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            variant="outline"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Select File'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
