'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useDocumentPreview } from '../hooks/use-documents';
import { Loader2, AlertCircle } from 'lucide-react';

interface DocumentPreviewModalProps {
  documentId: string | null;
  filename: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentPreviewModal({
  documentId,
  filename,
  isOpen,
  onClose,
}: DocumentPreviewModalProps) {
  const { data, isLoading, isError, error } = useDocumentPreview(
    isOpen && documentId ? documentId : undefined
  );

  const [width, setWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        let maxWidth = window.innerWidth / 2; // Up to 50% of the screen
        const minWidth = 400; // Narrower minimum width
        
        // Ensure maxWidth doesn't mathematically break if the screen is very small
        if (maxWidth < minWidth) {
          maxWidth = minWidth;
        }
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setWidth(newWidth);
        } else if (newWidth > maxWidth) {
          setWidth(maxWidth);
        } else if (newWidth < minWidth) {
          setWidth(minWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.userSelect = '';
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.userSelect = '';
    };
  }, [isResizing, resize, stopResizing]);

  // Reset width if window gets too small
  useEffect(() => {
    const handleResize = () => {
      const maxWidth = window.innerWidth / 2;
      if (width > maxWidth) {
        setWidth(maxWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        // On mobile: w-full and standard max-w classes. On sm+: custom width.
        className="w-full !max-w-none flex flex-col p-0 transition-none"
        style={{
          width: typeof window !== 'undefined' && window.innerWidth >= 640 ? `${width}px` : undefined,
        }}
      >
        {/* Resize Handle (only visible on desktop) */}
        <div
          className="hidden sm:block absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/50 active:bg-primary z-50 transition-colors"
          onMouseDown={startResizing}
        />

        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="truncate pr-8">{filename || 'Document Preview'}</SheetTitle>
          <SheetDescription>Extracted text preview</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Loading preview...</p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center h-full text-destructive">
              <AlertCircle className="h-10 w-10 mb-4 opacity-50" />
              <p className="text-center">
                {/* @ts-expect-error error structure comes from axios */}
                {error?.response?.data?.message || 'Failed to load document preview.'}
              </p>
            </div>
          )}

          {!isLoading && !isError && data?.text && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-card p-6 rounded-lg border shadow-sm">
                {data.text}
              </pre>
            </div>
          )}

          {!isLoading && !isError && data && !data.text && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileTextIcon className="h-10 w-10 mb-4 opacity-20" />
              <p>No preview available</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}
