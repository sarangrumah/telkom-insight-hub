import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, FileText, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PDFPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileName: string;
}

export function PDFPreviewModal({ open, onOpenChange, fileUrl, fileName }: PDFPreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleDownload = () => {
    window.open(fileUrl, '_blank');
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[90vw] p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" />
              <DialogTitle className="text-lg font-semibold truncate">
                {fileName}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="relative flex-1 min-h-[600px] bg-muted/30">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
              <Progress value={undefined} className="w-64" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-8">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Unable to preview PDF</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The PDF file could not be loaded for preview. You can still download the file.
                </p>
                <Button onClick={handleDownload} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}

          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full min-h-[600px] border-0"
            title={`PDF Preview: ${fileName}`}
            onLoad={handleLoad}
            onError={handleError}
            style={{ display: loading || error ? 'none' : 'block' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}