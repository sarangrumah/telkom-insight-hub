import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Building2, Phone, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface PublicData {
  provinces: any[];
  services: any[];
  subServices: any[];
  faqs: any[];
}

export default function PublicDataView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<PublicData>({
    provinces: [],
    services: [],
    subServices: [],
    faqs: []
  });
  const [filteredData, setFilteredData] = useState<PublicData>({
    provinces: [],
    services: [],
    subServices: [],
    faqs: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicData();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchQuery, data]);

  const fetchPublicData = async () => {
    try {
      const [provincesRes, servicesRes, subServicesRes, faqsRes] = await Promise.all([
        supabase.from('provinces').select('*').order('name'),
        supabase.from('services').select('*').order('name'),
        supabase.from('sub_services').select('*, service:services(name)').order('name'),
        supabase.from('faqs').select('*, category:faq_categories(name)').eq('is_active', true).order('created_at', { ascending: false })
      ]);

      setData({
        provinces: provincesRes.data || [],
        services: servicesRes.data || [],
        subServices: subServicesRes.data || [],
        faqs: faqsRes.data || []
      });
    } catch (error) {
      console.error('Error fetching public data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (!searchQuery.trim()) {
      setFilteredData(data);
      return;
    }

    const query = searchQuery.toLowerCase();
    setFilteredData({
      provinces: data.provinces.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.code.toLowerCase().includes(query)
      ),
      services: data.services.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.code.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
      ),
      subServices: data.subServices.filter(ss => 
        ss.name.toLowerCase().includes(query) || 
        ss.code.toLowerCase().includes(query) ||
        ss.description?.toLowerCase().includes(query) ||
        ss.service?.name.toLowerCase().includes(query)
      ),
      faqs: data.faqs.filter(f => 
        f.question.toLowerCase().includes(query) || 
        f.answer.toLowerCase().includes(query) ||
        f.category?.name.toLowerCase().includes(query)
      )
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading public data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">TelekomViz Public Data</h1>
              <p className="text-muted-foreground mt-2">
                Explore public telecommunication data and resources
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/faq')}>
                FAQ
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Login
              </Button>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search provinces, services, FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Provinces</p>
                    <p className="text-2xl font-bold">{data.provinces.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Wrench className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Services</p>
                    <p className="text-2xl font-bold">{data.services.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Sub Services</p>
                    <p className="text-2xl font-bold">{data.subServices.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Phone className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">FAQs</p>
                    <p className="text-2xl font-bold">{data.faqs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services */}
          {filteredData.services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Telecommunication Services
                </CardTitle>
                <CardDescription>
                  Available telecommunication service types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredData.services.map((service) => (
                    <div key={service.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{service.code}</Badge>
                      </div>
                      <h3 className="font-semibold">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Provinces */}
          {filteredData.provinces.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Provinces
                </CardTitle>
                <CardDescription>
                  Indonesian provinces covered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {filteredData.provinces.map((province) => (
                    <Badge key={province.id} variant="outline" className="justify-center p-2">
                      {province.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* FAQs */}
          {filteredData.faqs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Common questions and answers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredData.faqs.slice(0, 5).map((faq) => (
                    <div key={faq.id} className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      {faq.category && (
                        <Badge variant="secondary" className="mt-2">
                          {faq.category.name}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {data.faqs.length > 5 && (
                    <div className="text-center">
                      <Button variant="outline" onClick={() => navigate('/faq')}>
                        View All FAQs
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {searchQuery && 
           filteredData.provinces.length === 0 && 
           filteredData.services.length === 0 && 
           filteredData.subServices.length === 0 && 
           filteredData.faqs.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No results found for "{searchQuery}". Try a different search term.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Want to access more data?</h2>
              <p className="text-muted-foreground mb-4">
                Register and get validated to access detailed telecommunication data and analytics
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate('/public-register')}>
                  Register Now
                </Button>
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}