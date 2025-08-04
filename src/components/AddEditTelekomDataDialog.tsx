import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Database } from "@/integrations/supabase/types";

type TelekomData = Database["public"]["Tables"]["telekom_data"]["Row"];
type TelekomDataInsert = Database["public"]["Tables"]["telekom_data"]["Insert"];

const formSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  service_type: z.enum(["jasa", "jaringan", "telekomunikasi_khusus", "isr", "tarif", "sklo", "lko"]),
  license_number: z.string().optional(),
  license_date: z.string().optional(),
  region: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddEditTelekomDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: TelekomData | null;
  onSuccess: () => void;
}

export const AddEditTelekomDataDialog = ({ 
  open, 
  onOpenChange, 
  data, 
  onSuccess 
}: AddEditTelekomDataDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      service_type: "jasa",
      license_number: "",
      license_date: "",
      region: "",
      status: "active",
      latitude: undefined,
      longitude: undefined,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        company_name: data.company_name,
        service_type: data.service_type as "jasa" | "jaringan" | "telekomunikasi_khusus" | "isr" | "tarif" | "sklo" | "lko",
        license_number: data.license_number || "",
        license_date: data.license_date || "",
        region: data.region || "",
        status: (data.status as "active" | "inactive" | "pending") || "active",
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
      });
    } else {
      form.reset({
        company_name: "",
        service_type: "jasa",
        license_number: "",
        license_date: "",
        region: "",
        status: "active",
        latitude: undefined,
        longitude: undefined,
      });
    }
  }, [data, form]);

  const onSubmit = async (values: FormData) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const submitData: TelekomDataInsert = {
        company_name: values.company_name,
        service_type: values.service_type,
        status: values.status,
        created_by: user.id,
        latitude: values.latitude || null,
        longitude: values.longitude || null,
        license_date: values.license_date || null,
        license_number: values.license_number || null,
        region: values.region || null,
      };

      if (data) {
        // Update existing data
        const { error } = await supabase
          .from('telekom_data')
          .update(submitData)
          .eq('id', data.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Telecommunications data updated successfully",
        });
      } else {
        // Create new data
        const { error } = await supabase
          .from('telekom_data')
          .insert([submitData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Telecommunications data created successfully",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "Error",
        description: "Failed to save telecommunications data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {data ? "Edit Telecommunications Data" : "Add New Telecommunications Data"}
          </DialogTitle>
          <DialogDescription>
            {data 
              ? "Update the telecommunications data entry details below."
              : "Fill in the details below to create a new telecommunications data entry."
            }
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
                name="service_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="jasa">Jasa</SelectItem>
                        <SelectItem value="jaringan">Jaringan</SelectItem>
                        <SelectItem value="telekomunikasi_khusus">Telekomunikasi Khusus</SelectItem>
                        <SelectItem value="isr">ISR</SelectItem>
                        <SelectItem value="tarif">Tarif</SelectItem>
                        <SelectItem value="sklo">SKLO</SelectItem>
                        <SelectItem value="lko">LKO</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
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
                        step="any"
                        placeholder="Enter latitude"
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                        step="any"
                        placeholder="Enter longitude"
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : data ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};