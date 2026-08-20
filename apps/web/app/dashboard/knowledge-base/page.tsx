'use client';

import { DocumentUpload } from '@/features/documents/components/document-upload';
import { DocumentList } from '@/features/documents/components/document-list';

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground mt-2">
          Manage documents for the agent to reference.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr] items-start">
        <div className="order-2 md:order-1 space-y-6">
          <DocumentUpload />
        </div>
        
        <div className="order-1 md:order-2 space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-semibold tracking-tight">Documents</h2>
          </div>
          <DocumentList />
        </div>
      </div>
    </div>
  );
}
