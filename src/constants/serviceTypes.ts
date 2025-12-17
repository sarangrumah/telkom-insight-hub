import { apiFetch } from '@/lib/apiClient';

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
  try {
    const resp = (await apiFetch('/panel/api/services')) as { services?: Service[] };
    servicesCache = resp.services || [];
    return servicesCache;
  } catch (e) {
    console.error('Error fetching services:', e);
    return [];
  }
}

// Fetch all sub-services from database
export async function fetchSubServices(): Promise<SubService[]> {
  if (subServicesCache) return subServicesCache;
  try {
    const resp = (await apiFetch('/panel/api/sub-services')) as {
      sub_services?: SubService[];
    };
    subServicesCache = resp.sub_services || [];
    return subServicesCache;
  } catch (e) {
    console.error('Error fetching sub-services:', e);
    return [];
  }
}

// Get sub-services for a specific service
export async function getSubServicesForService(
  serviceId: string
): Promise<SubService[]> {
  // Use cached list then filter to minimize requests
  const all = await fetchSubServices();
  return all.filter(ss => ss.service_id === serviceId);
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
export async function getSubServiceById(
  id: string
): Promise<SubService | null> {
  const subServices = await fetchSubServices();
  return subServices.find(ss => ss.id === id) || null;
}

// Legacy function for backward compatibility - now loads from database
export const getSubServices = async (
  serviceCode: string
): Promise<string[]> => {
  const subServices = await getSubServicesForService(serviceCode);
  return subServices.map(ss => ss.name);
};
