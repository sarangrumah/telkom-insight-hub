import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FileUpload } from './FileUpload';
import { useLocationData } from '@/hooks/useLocationData';
// Removed direct Supabase dependency; using backend REST via React Query hooks
import {
  useCreateTelekomData,
  useUpdateTelekomData,
} from '@/hooks/useTelekomData';
import {
  fetchServices,
  fetchSubServices,
  getSubServicesForService,
  type Service,
  type SubService,
} from '@/constants/serviceTypes';
import { UploadAPI } from '@/lib/apiClient';

// Minimal type for edit context (subset of fields we care about). In future unify with TelekomDataRecord if needed.
interface TelekomDataEditRecord {
  id: string;
  company_name: string;
  sub_service_id: string | null;
  license_number: string | null;
  license_date: string | null;
  province_id: string | null;
  kabupaten_id: string | null;
  region: string | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
  file_url: string | null;
  service_type?: string | null;
  sub_service_type?: string | null;
  sub_service?: {
    id: string;
    name: string;
    service?: { id: string; name: string; code?: string | null } | null;
  } | null;
}

const numberFromInput = z.preprocess(val => {
  if (val === '' || val === null || typeof val === 'undefined')
    return undefined;
  if (typeof val === 'number') return isNaN(val) ? undefined : val;
  if (typeof val === 'string') {
    const n = parseFloat(val.trim());
    return isNaN(n) ? undefined : n;
  }
  return undefined;
}, z.number().finite().optional());

const formSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  sub_service_id: z.string().min(1, 'Sub-service is required'),
  license_number: z.string().optional(),
  license_date: z.string().optional(),
  province_id: z.string().optional(),
  kabupaten_id: z.string().optional(),
  region: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  latitude: numberFromInput,
  longitude: numberFromInput,
  file_url: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddEditTelekomDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: TelekomDataEditRecord | null;
  onSuccess: () => void;
}

export const AddEditTelekomDataDialog = ({
  open,
  onOpenChange,
  data,
  onSuccess,
}: AddEditTelekomDataDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const createMutation = useCreateTelekomData();
  const updateMutation = useUpdateTelekomData();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [availableSubServices, setAvailableSubServices] = useState<
    SubService[]
  >([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  interface KabupatenOption {
    id: string;
    name: string;
    type: string;
    latitude?: number;
    longitude?: number;
  }
  const [availableKabupaten, setAvailableKabupaten] = useState<
    KabupatenOption[]
  >([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const {
    provinces,
    getKabupaténByProvince,
    getKabupaténById,
    getProvinceById,
  } = useLocationData();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: '',
      sub_service_id: '',
      license_number: '',
      license_date: '',
      province_id: '',
      kabupaten_id: '',
      region: '',
      status: 'active',
      latitude: '',
      longitude: '',
      file_url: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      const [servicesData, subServicesData] = await Promise.all([
        fetchServices(),
        fetchSubServices(),
      ]);
      setServices(servicesData);
      setSubServices(subServicesData);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (data && subServices.length > 0) {
      const effectiveSubServiceId =
        data.sub_service_id || data.sub_service?.id || '';
      const subService = subServices.find(
        ss => ss.id === effectiveSubServiceId
      );
      if (subService) {
        setSelectedServiceId(subService.service_id);
        setAvailableSubServices(
          subServices.filter(ss => ss.service_id === subService.service_id)
        );
      } else {
        setAvailableSubServices([]);
      }

      // Location data
      if (data.province_id) {
        setSelectedProvinceId(data.province_id);
        const kabupatenList = getKabupaténByProvince(data.province_id);
        setAvailableKabupaten(kabupatenList);
      }

      // Format license_date to YYYY-MM-DD for date input
      const formattedLicenseDate = data.license_date
        ? (() => {
            const d = new Date(data.license_date);
            return isNaN(d.getTime())
              ? ''
              : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                  2,
                  '0'
                )}-${String(d.getDate()).padStart(2, '0')}`;
          })()
        : '';

      form.reset({
        company_name: data.company_name,
        sub_service_id: effectiveSubServiceId,
        license_number: data.license_number || '',
        license_date: formattedLicenseDate,
        province_id: data.province_id || '',
        kabupaten_id: data.kabupaten_id || '',
        region: data.region || '',
        status:
          (data.status as 'active' | 'inactive' | 'suspended') || 'active',
        latitude: data.latitude != null ? String(data.latitude) : '',
        longitude: data.longitude != null ? String(data.longitude) : '',
        file_url: data.file_url || '',
      });
    } else if (!data) {
      form.reset({
        company_name: '',
        sub_service_id: '',
        license_number: '',
        license_date: '',
        province_id: '',
        kabupaten_id: '',
        region: '',
        status: 'active',
        latitude: '',
        longitude: '',
        file_url: '',
      });
      setSelectedServiceId('');
      setAvailableSubServices([]);
      setSelectedProvinceId('');
      setAvailableKabupaten([]);
    }
    // Dependencies intentionally narrowed to prevent infinite re-renders due to unstable function references
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, subServices.length, open]);

  const onSubmit = async (values: FormData) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to perform this action',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const selectedSubService = subServices.find(
        ss => ss.id === values.sub_service_id
      );
      // Deferred upload handling for attachment
      let finalFileUrl: string | null = values.file_url || null;
      if (pendingFile) {
        const uploaded = await UploadAPI.uploadPdf(pendingFile);
        finalFileUrl = uploaded.file_url;
      }

      const basePayload = {
        company_name: values.company_name,
        sub_service_id: values.sub_service_id,
        status: values.status,
        province_id: values.province_id || null,
        kabupaten_id: values.kabupaten_id || null,
        latitude: typeof values.latitude === 'number' ? values.latitude : null,
        longitude:
          typeof values.longitude === 'number' ? values.longitude : null,
        license_date: values.license_date || null,
        license_number: values.license_number || null,
        region: values.region || null,
        file_url: finalFileUrl,
        // Legacy/backward compatibility fields
        service_type: selectedSubService?.service?.code || null,
        sub_service_type: selectedSubService?.name || null,
      };

      if (data) {
        await updateMutation.mutateAsync({ id: data.id, ...basePayload });
        toast({
          title: 'Success',
          description: 'Telecommunications data updated successfully',
        });
      } else {
        await createMutation.mutateAsync(basePayload);
        toast({
          title: 'Success',
          description: 'Telecommunications data created successfully',
        });
      }

      setPendingFile(null);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving data:', error);
      let message = 'Failed to save telecommunications data';
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        message = (error as { message: string }).message || message;
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = async (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const subServicesForService = await getSubServicesForService(serviceId);
    setAvailableSubServices(subServicesForService);
    form.setValue('sub_service_id', ''); // Reset sub-service when main service changes
  };

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    form.setValue('province_id', provinceId);
    form.setValue('kabupaten_id', ''); // Reset kabupaten when province changes

    const kabupatenList = getKabupaténByProvince(provinceId);
    setAvailableKabupaten(kabupatenList);
  };

  const handleKabupaténChange = (kabupaténId: string) => {
    form.setValue('kabupaten_id', kabupaténId);

    // Auto-populate coordinates from kabupaten
    const kabupaten = getKabupaténById(kabupaténId);
    if (kabupaten) {
      form.setValue(
        'latitude',
        kabupaten.latitude != null ? String(kabupaten.latitude) : ''
      );
      form.setValue(
        'longitude',
        kabupaten.longitude != null ? String(kabupaten.longitude) : ''
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {data
              ? 'Edit Telecommunications Data'
              : 'Add New Telecommunications Data'}
          </DialogTitle>
          <DialogDescription>
            {data
              ? 'Update the telecommunications data entry details below.'
              : 'Fill in the details below to create a new telecommunications data entry.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter company name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={() => (
                  <FormItem>
                    <FormLabel>Main Service Type *</FormLabel>
                    <Select
                      value={selectedServiceId}
                      onValueChange={handleServiceChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select main service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {availableSubServices.length > 0 && (
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="sub_service_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub Service Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub service type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {availableSubServices.map(subService => (
                              <SelectItem
                                key={subService.id}
                                value={subService.id}
                              >
                                {subService.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter license number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="province_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={handleProvinceChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {provinces.map(province => (
                          <SelectItem key={province.id} value={province.id}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kabupaten_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kabupaten/Kota</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={handleKabupaténChange}
                      disabled={!selectedProvinceId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              selectedProvinceId
                                ? 'Select kabupaten/kota'
                                : 'Select province first'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {availableKabupaten.map(kabupaten => (
                          <SelectItem key={kabupaten.id} value={kabupaten.id}>
                            {kabupaten.type === 'kota' ? 'Kota ' : 'Kabupaten '}
                            {kabupaten.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region (Legacy)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter region" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="Auto-filled from kabupaten"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="Auto-filled from kabupaten"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="file_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachment (Optional)</FormLabel>
                  <FormControl>
                    <FileUpload
                      value={field.value}
                      deferred
                      onFileSelect={(file) => setPendingFile(file)}
                      onChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  loading ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                {loading || createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : data
                  ? 'Update'
                  : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
