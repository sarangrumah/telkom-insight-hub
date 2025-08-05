import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLocationData } from '@/hooks/useLocationData';
import { fetchServices, fetchSubServices } from '@/constants/serviceTypes';

interface TelekomDataRow {
  id: string;
  company_name: string;
  service_type: string;
  sub_service_type?: string;
  license_number?: string;
  license_date?: string;
  region?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  province_id?: string;
  kabupaten_id?: string;
  created_at: string;
}

interface ExcelExportButtonProps {
  currentFilters?: any;
  className?: string;
}

export const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({
  currentFilters,
  className
}) => {
  const [exporting, setExporting] = useState(false);
  const { provinces, allKabupaten } = useLocationData();

  const generateTemplate = async () => {
    try {
      setExporting(true);
      
      // Fetch services and sub-services for template
      const services = await fetchServices();
      const subServices = await fetchSubServices();
      
      // Create template data
      const templateData = [
        {
          'Company Name': 'PT Example Company',
          'Service Type': 'fixed_broadband',
          'Sub Service Type': 'fiber_optic',
          'License Number': 'LIC123456',
          'License Date': '2024-01-15',
          'Province': 'DKI Jakarta',
          'Kabupaten/Kota': 'Jakarta Pusat',
          'Status': 'active'
        }
      ];

      // Create workbook with multiple sheets
      const workbook = XLSX.utils.book_new();
      
      // Main data sheet
      const mainSheet = XLSX.utils.json_to_sheet(templateData);
      XLSX.utils.book_append_sheet(workbook, mainSheet, 'Data Template');
      
      // Service types reference sheet
      const serviceData = services.map(s => ({
        'Service Code': s.code,
        'Service Name': s.name,
        'Description': s.description || ''
      }));
      const serviceSheet = XLSX.utils.json_to_sheet(serviceData);
      XLSX.utils.book_append_sheet(workbook, serviceSheet, 'Service Types');
      
      // Sub-service types reference sheet
      const subServiceData = subServices.map(ss => ({
        'Sub Service Code': ss.code,
        'Sub Service Name': ss.name,
        'Parent Service': ss.service?.name || '',
        'Description': ss.description || ''
      }));
      const subServiceSheet = XLSX.utils.json_to_sheet(subServiceData);
      XLSX.utils.book_append_sheet(workbook, subServiceSheet, 'Sub Service Types');
      
      // Provinces reference sheet
      const provinceData = provinces.map(p => ({
        'Province Code': p.code,
        'Province Name': p.name,
        'Latitude': p.latitude,
        'Longitude': p.longitude
      }));
      const provinceSheet = XLSX.utils.json_to_sheet(provinceData);
      XLSX.utils.book_append_sheet(workbook, provinceSheet, 'Provinces');
      
      // Kabupaten reference sheet
      const kabupaténData = allKabupaten.map(k => ({
        'Kabupaten Code': k.code,
        'Kabupaten Name': k.name,
        'Type': k.type,
        'Province': provinces.find(p => p.id === k.province_id)?.name || '',
        'Latitude': k.latitude,
        'Longitude': k.longitude
      }));
      const kabupaténSheet = XLSX.utils.json_to_sheet(kabupaténData);
      XLSX.utils.book_append_sheet(workbook, kabupaténSheet, 'Kabupaten');
      
      // Download template
      XLSX.writeFile(workbook, 'telekom_data_template.xlsx');
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Failed to generate template');
    } finally {
      setExporting(false);
    }
  };

  const exportCurrentData = async () => {
    try {
      setExporting(true);
      
      // Build query with current filters
      let query = supabase
        .from('telekom_data')
        .select(`
          *,
          province:provinces(name),
          kabupaten:kabupaten(name, type)
        `);
      
      // Apply filters if provided
      if (currentFilters) {
        if (currentFilters.service_type) {
          query = query.eq('service_type', currentFilters.service_type);
        }
        if (currentFilters.status) {
          query = query.eq('status', currentFilters.status);
        }
        if (currentFilters.province_id) {
          query = query.eq('province_id', currentFilters.province_id);
        }
        if (currentFilters.kabupaten_id) {
          query = query.eq('kabupaten_id', currentFilters.kabupaten_id);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.error('No data to export');
        return;
      }
      
      // Transform data for Excel export
      const exportData = data.map((row: any) => ({
        'Company Name': row.company_name,
        'Service Type': row.service_type,
        'Sub Service Type': row.sub_service_type || '',
        'License Number': row.license_number || '',
        'License Date': row.license_date || '',
        'Province': row.province?.name || '',
        'Kabupaten/Kota': row.kabupaten?.name || '',
        'Region (Legacy)': row.region || '',
        'Status': row.status || '',
        'Latitude (Legacy)': row.latitude || '',
        'Longitude (Legacy)': row.longitude || '',
        'Created At': new Date(row.created_at).toLocaleDateString(),
        'Data Source': row.data_source || ''
      }));
      
      // Create workbook and export
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Telekom Data');
      
      const fileName = `telekom_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success(`Exported ${data.length} records successfully`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting} className={className}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={generateTemplate}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Download Template
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportCurrentData}>
          <Download className="h-4 w-4 mr-2" />
          Export Current Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};