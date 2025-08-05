import { supabase } from "@/integrations/supabase/client";

// Types for the new database structure
export interface Service {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface SubService {
  id: string;
  service_id: string;
  name: string;
  code: string;
  description?: string;
  service?: Service;
}

// Cache for services and sub-services
let servicesCache: Service[] | null = null;
let subServicesCache: SubService[] | null = null;

// Fetch all services from database
export async function fetchServices(): Promise<Service[]> {
  if (servicesCache) return servicesCache;
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }
  
  servicesCache = data || [];
  return servicesCache;
}

// Fetch all sub-services from database
export async function fetchSubServices(): Promise<SubService[]> {
  if (subServicesCache) return subServicesCache;
  
  const { data, error } = await supabase
    .from('sub_services')
    .select(`
      *,
      service:services(*)
    `)
    .order('name');
    
  if (error) {
    console.error('Error fetching sub-services:', error);
    return [];
  }
  
  subServicesCache = data || [];
  return subServicesCache;
}

// Get sub-services for a specific service
export async function getSubServicesForService(serviceId: string): Promise<SubService[]> {
  const { data, error } = await supabase
    .from('sub_services')
    .select('*')
    .eq('service_id', serviceId)
    .order('name');
    
  if (error) {
    console.error('Error fetching sub-services for service:', error);
    return [];
  }
  
  return data || [];
}

// Clear cache (useful for refreshing data)
export function clearServiceCache() {
  servicesCache = null;
  subServicesCache = null;
}

// Helper function to get service by code
export async function getServiceByCode(code: string): Promise<Service | null> {
  const services = await fetchServices();
  return services.find(s => s.code === code) || null;
}

// Helper function to get sub-service by ID
export async function getSubServiceById(id: string): Promise<SubService | null> {
  const subServices = await fetchSubServices();
  return subServices.find(ss => ss.id === id) || null;
}

// Legacy function for backward compatibility - now loads from database
export const getSubServices = async (serviceCode: string): Promise<string[]> => {
  const subServices = await getSubServicesForService(serviceCode);
  return subServices.map(ss => ss.name);
};