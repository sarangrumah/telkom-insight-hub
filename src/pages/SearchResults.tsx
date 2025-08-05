import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Building2, FileText, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  company_name: string;
  service_type: string;
  license_number?: string;
  region?: string;
  status: string;
  created_at: string;
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    try {
      // Search in telekom_data table
      const { data, error, count } = await supabase
        .from('telekom_data')
        .select('*', { count: 'exact' })
        .or(`company_name.ilike.%${searchTerm}%,license_number.ilike.%${searchTerm}%,region.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) {
        console.error('Search error:', error);
        return;
      }

      setResults(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getServiceTypeColor = (serviceType: string) => {
    const colors: { [key: string]: string } = {
      'jasa': 'bg-blue-100 text-blue-800',
      'jaringan': 'bg-green-100 text-green-800',
      'telekomunikasi_khusus': 'bg-purple-100 text-purple-800',
      'isr': 'bg-orange-100 text-orange-800',
      'tarif': 'bg-red-100 text-red-800',
      'sklo': 'bg-yellow-100 text-yellow-800',
      'lko': 'bg-indigo-100 text-indigo-800'
    };
    return colors[serviceType] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">TelekomViz</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari data penyelenggaraan telekomunikasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleNewSearch()}
                />
              </div>
              <Button onClick={handleNewSearch} disabled={loading}>
                {loading ? 'Mencari...' : 'Cari'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Hasil Pencarian</h2>
          {query && (
            <p className="text-muted-foreground">
              Menampilkan {results.length} dari {totalCount} hasil untuk "{query}"
            </p>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Mencari data...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-6">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {result.company_name}
                      </CardTitle>
                      <CardDescription>
                        {result.license_number && `No. Izin: ${result.license_number}`}
                        {result.region && ` • ${result.region}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getServiceTypeColor(result.service_type)}>
                        {result.service_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Terdaftar: {new Date(result.created_at).toLocaleDateString('id-ID')}
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Lihat Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : query ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak Ada Hasil</h3>
              <p className="text-muted-foreground mb-4">
                Tidak ditemukan data yang sesuai dengan pencarian "{query}"
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Coba Pencarian Lain
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Mulai Pencarian</h3>
              <p className="text-muted-foreground">
                Masukkan kata kunci untuk mencari data penyelenggaraan telekomunikasi
              </p>
            </CardContent>
          </Card>
        )}

        {/* Note for Limited Access */}
        {results.length > 0 && (
          <Card className="mt-8 bg-muted/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Catatan:</strong> Hasil pencarian menampilkan informasi terbatas. 
                Untuk akses lengkap ke data dan fitur visualisasi, silakan{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>
                  masuk ke akun
                </Button>{' '}
                atau{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/register')}>
                  daftar akun baru
                </Button>.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchResults;