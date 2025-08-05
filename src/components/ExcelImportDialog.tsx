import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExcelColumnMapper } from './ExcelColumnMapper';
import { ExcelDataPreview } from './ExcelDataPreview';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ExcelImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export interface ExcelRow {
  [key: string]: any;
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
}

export const ExcelImportDialog: React.FC<ExcelImportDialogProps> = ({
  open,
  onOpenChange,
  onImportComplete,
}) => {
  const [currentStep, setCurrentStep] = useState('upload');
  const [file, setFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importing, setImporting] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: ''
        }) as any[][];
        
        if (jsonData.length === 0) {
          toast.error('File is empty');
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1).map((row: any[]) => {
          const obj: ExcelRow = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });

        setColumns(headers);
        setExcelData(rows);
        setCurrentStep('mapping');
        toast.success('File uploaded successfully');
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Error reading file. Please check the format.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleMappingComplete = (mapping: Record<string, string>) => {
    setColumnMapping(mapping);
    setCurrentStep('preview');
  };

  const validateData = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    excelData.forEach((row, index) => {
      // Check required fields
      if (!row[columnMapping.company_name]?.trim()) {
        errors.push({
          row: index + 1,
          column: 'company_name',
          message: 'Company name is required'
        });
      }
      
      if (!row[columnMapping.service_type]?.trim()) {
        errors.push({
          row: index + 1,
          column: 'service_type',
          message: 'Service type is required'
        });
      }
    });

    return errors;
  };

  const handleImport = async () => {
    const errors = validateData();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setImporting(true);
    setImportProgress(0);

    try {
      // Process data in batches
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < excelData.length; i += batchSize) {
        batches.push(excelData.slice(i, i + batchSize));
      }

      let processed = 0;
      
      for (const batch of batches) {
        // Process each batch
        await processBatch(batch);
        processed += batch.length;
        setImportProgress((processed / excelData.length) * 100);
      }

      toast.success(`Successfully imported ${excelData.length} records`);
      onImportComplete();
      onOpenChange(false);
      resetDialog();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const processBatch = async (batch: ExcelRow[]) => {
    // Implementation will be added in the next step
    // This is a placeholder for batch processing logic
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  const resetDialog = () => {
    setCurrentStep('upload');
    setFile(null);
    setExcelData([]);
    setColumns([]);
    setColumnMapping({});
    setValidationErrors([]);
    setImportProgress(0);
    setImporting(false);
  };

  const handleClose = () => {
    if (!importing) {
      resetDialog();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Data from Excel</DialogTitle>
          <DialogDescription>
            Upload your Excel file and map the columns to import telekom data.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" disabled={importing}>
              Upload File
            </TabsTrigger>
            <TabsTrigger value="mapping" disabled={!file || importing}>
              Map Columns
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!columnMapping || importing}>
              Preview & Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-muted-foreground/25 hover:border-primary'
              }`}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              {isDragActive ? (
                <p className="text-lg">Drop the Excel file here...</p>
              ) : (
                <div>
                  <p className="text-lg mb-2">
                    Drag & drop an Excel file here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports .xlsx, .xls, and .csv files
                  </p>
                </div>
              )}
            </div>

            {file && (
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="text-sm">{file.name}</span>
                <Badge variant="secondary">{excelData.length} rows</Badge>
              </div>
            )}
          </TabsContent>

          <TabsContent value="mapping" className="space-y-4">
            {columns.length > 0 && (
              <ExcelColumnMapper
                columns={columns}
                onMappingComplete={handleMappingComplete}
              />
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Found {validationErrors.length} validation errors. Please fix them before importing.
                </AlertDescription>
              </Alert>
            )}

            <ExcelDataPreview
              data={excelData.slice(0, 10)}
              columnMapping={columnMapping}
              validationErrors={validationErrors}
            />

            {importing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing data...</span>
                  <span>{Math.round(importProgress)}%</span>
                </div>
                <Progress value={importProgress} />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={importing}
          >
            Cancel
          </Button>
          
          {currentStep === 'preview' && (
            <Button
              onClick={handleImport}
              disabled={importing || validationErrors.length > 0}
            >
              {importing ? 'Importing...' : `Import ${excelData.length} Records`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};