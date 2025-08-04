import { useState, useRef } from 'react';
import { Upload, File, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  value?: string;
  onChange: (fileUrl: string | null) => void;
  disabled?: boolean;
}

export function FileUpload({ value, onChange, disabled }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const acceptedTypes = ['application/pdf'];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const uploadFile = async (file: File) => {
    // Validate file type (MIME type and extension)
    const isValidMimeType = file.type === 'application/pdf';
    const isValidExtension = file.name.toLowerCase().endsWith('.pdf');
    
    if (!isValidMimeType || !isValidExtension) {
      toast({
        title: "Error",
        description: "Only PDF files are allowed. Please upload a valid PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxFileSize) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const timestamp = new Date().getTime();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `${user.id}/telekom-data/${fileName}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(data.path);

      onChange(publicUrl);
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    onChange(null);
  };

  const downloadFile = () => {
    if (value) {
      window.open(value, '_blank');
    }
  };

  const getFileName = (url: string) => {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.split('-').slice(1).join('-'); // Remove timestamp prefix
  };

  if (value) {
    return (
      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
        <File className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm flex-1 truncate">{getFileName(value)}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={downloadFile}
          disabled={disabled}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={removeFile}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept={acceptedTypes.join(',')}
        disabled={disabled || uploading}
      />
      
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">
              PDF files only (max 10MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}