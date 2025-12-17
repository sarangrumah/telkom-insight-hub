import { useState, useRef } from 'react';
import { Upload, X, Download, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:4000';

interface FileUploadProps {
  value?: string;
  onChange?: (fileUrl: string | null) => void;
  disabled?: boolean;
  deferred?: boolean;
  onFileSelect?: (file: File | null) => void;
  acceptTypes?: string[];
  maxSizeBytes?: number;
}

export function FileUpload({
  value,
  onChange,
  disabled,
  deferred = false,
  onFileSelect,
  acceptTypes,
  maxSizeBytes,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; uploadedAt: Date } | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const acceptedTypes = acceptTypes ?? ['application/pdf'];
  const maxFileSize = typeof maxSizeBytes === 'number' ? maxSizeBytes : 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File) => {
    // Validate file type (MIME type and extension)
    const isValidMimeType = file.type === 'application/pdf';
    const isValidExtension = file.name.toLowerCase().endsWith('.pdf');

    if (!isValidMimeType || !isValidExtension) {
      toast({
        title: 'Error',
        description: 'Only PDF files are allowed. Please upload a valid PDF file.',
        variant: 'destructive',
      });
      return false;
    }

    if (file.size > maxFileSize) {
      toast({
        title: 'Error',
        description: 'File size must be less than 10MB.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    if (deferred) {
      setPendingFile(file);
      setFileInfo({
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
      });
      setUploadSuccess(false);
      setUploadProgress(0);
      onFileSelect?.(file);
      toast({
        title: 'File dipilih',
        description: 'File akan diunggah saat Anda menyimpan atau mengirim.',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    try {
      setUploadProgress(10);
      const token = localStorage.getItem('app.jwt.token');

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/panel/api/uploads`);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const resp = JSON.parse(xhr.responseText) as { file_url: string; file_name: string; size: number };
                setUploadProgress(100);

                setFileInfo({
                  name: file.name,
                  size: file.size,
                  uploadedAt: new Date(),
                });

                onChange?.(resp.file_url);
                setUploadSuccess(true);

                toast({
                  title: 'Success',
                  description: `${file.name} uploaded successfully!`,
                });

                resolve();
              } catch {
                reject(new Error('Invalid server response'));
              }
            } else {
              try {
                const resp = JSON.parse(xhr.responseText);
                reject(new Error(resp?.error || 'Upload failed'));
              } catch {
                reject(new Error('Upload failed'));
              }
            }
          }
        };

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(Math.min(99, Math.max(10, pct)));
          }
        };

        const form = new FormData();
        form.append('file', file);
        xhr.send(form);
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress(0);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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
    // Clear both pending and existing value
    setPendingFile(null);
    setFileInfo(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    onFileSelect?.(null);
    onChange?.(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  // Pending file card for deferred mode
  if (deferred && pendingFile) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 border rounded-md bg-muted/50">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-md">
            <FileText className="h-5 w-5 text-red-600" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{pendingFile.name}</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Size: {formatFileSize(pendingFile.size)}</p>
              <p>Selected: {new Date().toLocaleString()}</p>
              <p className="text-amber-600">Belum diunggah. File akan diunggah saat Anda menyimpan.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex items-center gap-1"
            >
              Ubah
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
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept={acceptedTypes.join(',')}
          disabled={disabled}
        />
      </div>
    );
  }

  if (value) {
    return (
      <div className="space-y-3">
        {uploadSuccess && (
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">File uploaded successfully!</span>
          </div>
        )}

        <div className="flex items-center gap-3 p-4 border rounded-md bg-muted/50">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-md">
            <FileText className="h-5 w-5 text-red-600" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{getFileName(value)}</p>
            {fileInfo && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Size: {formatFileSize(fileInfo.size)}</p>
                <p>Uploaded: {fileInfo.uploadedAt.toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadFile}
              disabled={disabled}
              className="flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Download
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
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive
          ? 'border-primary bg-primary/10'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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

      {uploading && !deferred ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Uploading PDF...</p>
            <Progress value={uploadProgress} className="w-48" />
            <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-full">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{deferred ? 'Click to select or drag and drop (deferred upload)' : 'Click to upload or drag and drop'}</p>
            <p className="text-xs text-muted-foreground">
              PDF files only (max 10MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}