import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ExcelColumnMapperProps {
  columns: string[];
  onMappingComplete: (mapping: Record<string, string>) => void;
}

const DATABASE_FIELDS = [
  { key: 'company_name', label: 'Company Name', required: true },
  { key: 'service_type', label: 'Service Type', required: true },
  { key: 'sub_service_type', label: 'Sub Service Type', required: false },
  { key: 'license_number', label: 'License Number', required: false },
  { key: 'license_date', label: 'License Date', required: false },
  { key: 'province', label: 'Province', required: false },
  { key: 'kabupaten', label: 'Kabupaten/Kota', required: false },
  { key: 'region', label: 'Region (Legacy)', required: false },
  { key: 'status', label: 'Status', required: false },
  { key: 'latitude', label: 'Latitude (Legacy)', required: false },
  { key: 'longitude', label: 'Longitude (Legacy)', required: false },
];

export const ExcelColumnMapper: React.FC<ExcelColumnMapperProps> = ({
  columns,
  onMappingComplete,
}) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [autoMapped, setAutoMapped] = useState(false);

  useEffect(() => {
    if (!autoMapped && columns.length > 0) {
      autoMapColumns();
      setAutoMapped(true);
    }
  }, [columns, autoMapped]);

  const autoMapColumns = () => {
    const newMapping: Record<string, string> = {};
    
    // Auto-map based on column name similarity
    DATABASE_FIELDS.forEach(field => {
      const matchingColumn = columns.find(col => {
        const normalizedCol = col.toLowerCase().replace(/[^a-z]/g, '');
        const normalizedField = field.key.toLowerCase().replace(/[^a-z]/g, '');
        
        // Exact match
        if (normalizedCol === normalizedField) return true;
        
        // Partial matches
        if (field.key === 'company_name' && (
          normalizedCol.includes('company') || 
          normalizedCol.includes('nama') ||
          normalizedCol.includes('perusahaan')
        )) return true;
        
        if (field.key === 'service_type' && (
          normalizedCol.includes('service') ||
          normalizedCol.includes('layanan')
        )) return true;
        
        if (field.key === 'license_number' && (
          normalizedCol.includes('license') ||
          normalizedCol.includes('izin') ||
          normalizedCol.includes('nomor')
        )) return true;
        
        if (field.key === 'province' && (
          normalizedCol.includes('province') ||
          normalizedCol.includes('provinsi')
        )) return true;
        
        if (field.key === 'kabupaten' && (
          normalizedCol.includes('kabupaten') ||
          normalizedCol.includes('kota') ||
          normalizedCol.includes('city')
        )) return true;
        
        return false;
      });
      
      if (matchingColumn) {
        newMapping[field.key] = matchingColumn;
      }
    });
    
    setMapping(newMapping);
  };

  const handleMappingChange = (fieldKey: string, columnName: string) => {
    setMapping(prev => ({
      ...prev,
      [fieldKey]: columnName
    }));
  };

  const getUsedColumns = () => {
    return Object.values(mapping).filter(Boolean);
  };

  const isColumnUsed = (columnName: string, currentField?: string) => {
    const usedColumns = getUsedColumns();
    const currentMapping = currentField ? mapping[currentField] : null;
    return usedColumns.includes(columnName) && columnName !== currentMapping;
  };

  const canProceed = () => {
    const requiredFields = DATABASE_FIELDS.filter(f => f.required);
    return requiredFields.every(field => mapping[field.key]);
  };

  const handleNext = () => {
    if (canProceed()) {
      onMappingComplete(mapping);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Map Excel Columns to Database Fields</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {DATABASE_FIELDS.map(field => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.required && <Badge variant="destructive">Required</Badge>}
              </div>
              
              <Select
                value={mapping[field.key] || ''}
                onValueChange={(value) => handleMappingChange(field.key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Excel column..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Skip this field --</SelectItem>
                  {columns.map(column => (
                    <SelectItem
                      key={column}
                      value={column}
                      disabled={isColumnUsed(column, field.key)}
                    >
                      {column}
                      {isColumnUsed(column, field.key) && ' (already mapped)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleNext} 
            disabled={!canProceed()}
            className="w-full"
          >
            Continue to Preview
          </Button>
          
          {!canProceed() && (
            <p className="text-sm text-muted-foreground mt-2">
              Please map all required fields to continue.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};