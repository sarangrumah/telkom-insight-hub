import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { ExcelRow, ValidationError } from './ExcelImportDialog';

interface ExcelDataPreviewProps {
  data: ExcelRow[];
  columnMapping: Record<string, string>;
  validationErrors: ValidationError[];
}

export const ExcelDataPreview: React.FC<ExcelDataPreviewProps> = ({
  data,
  columnMapping,
  validationErrors,
}) => {
  const getErrorsForRow = (rowIndex: number) => {
    return validationErrors.filter(error => error.row === rowIndex + 1);
  };

  const getErrorsForCell = (rowIndex: number, fieldKey: string) => {
    return validationErrors.filter(error => 
      error.row === rowIndex + 1 && error.column === fieldKey
    );
  };

  const mappedFields = Object.entries(columnMapping).filter(([_, columnName]) => columnName);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Preview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Showing first 10 rows. Total: {data.length} records
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                {mappedFields.map(([fieldKey, columnName]) => (
                  <TableHead key={fieldKey}>
                    {fieldKey.replace(/_/g, ' ').toUpperCase()}
                    <div className="text-xs text-muted-foreground font-normal">
                      from: {columnName}
                    </div>
                  </TableHead>
                ))}
                <TableHead>Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => {
                const rowErrors = getErrorsForRow(index);
                const hasErrors = rowErrors.length > 0;
                
                return (
                  <TableRow key={index} className={hasErrors ? 'bg-destructive/10' : ''}>
                    <TableCell className="font-medium">
                      {index + 1}
                    </TableCell>
                    
                    {mappedFields.map(([fieldKey, columnName]) => {
                      const cellErrors = getErrorsForCell(index, fieldKey);
                      const hasError = cellErrors.length > 0;
                      
                      return (
                        <TableCell 
                          key={fieldKey}
                          className={hasError ? 'bg-destructive/20' : ''}
                        >
                          <div className="max-w-32 truncate">
                            {row[columnName] || '-'}
                          </div>
                          {hasError && (
                            <div className="text-xs text-destructive mt-1">
                              {cellErrors.map(error => error.message).join(', ')}
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                    
                    <TableCell>
                      {hasErrors ? (
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <Badge variant="destructive" className="text-xs">
                            {rowErrors.length} error{rowErrors.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          OK
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {validationErrors.length > 0 && (
          <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
            <h4 className="font-medium text-destructive mb-2">
              Validation Errors ({validationErrors.length})
            </h4>
            <div className="space-y-1 text-sm">
              {validationErrors.slice(0, 10).map((error, index) => (
                <div key={index}>
                  Row {error.row}, {error.column}: {error.message}
                </div>
              ))}
              {validationErrors.length > 10 && (
                <div className="text-muted-foreground">
                  ...and {validationErrors.length - 10} more errors
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};