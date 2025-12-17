import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, FileText, CalendarDays, MapPin, Globe } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";

type TelekomDataDetailRow = {
  id: string;
  company_name: string;
  service_type: string;
  license_number?: string | null;
  license_date?: string | null;
  region?: string | null;
  status: string;
  created_at: string;
  sub_service_type?: string | null;
  file_url?: string | null;
};

const TelekomDataDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TelekomDataDetailRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!id) {
      setError("ID tidak valid");
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/panel/api/public/telekom-data/${id}`);
        setData(res as TelekomDataDetailRow);
      } catch (err) {
        console.error("Error fetching detail:", err);
        setError("Gagal memuat detail data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getServiceTypeColor = (serviceType: string) => {
    const colors: { [key: string]: string } = {
      jasa: "bg-blue-100 text-blue-800",
      jaringan: "bg-green-100 text-green-800",
      telekomunikasi_khusus: "bg-purple-100 text-purple-800",
      isr: "bg-orange-100 text-orange-800",
      tarif: "bg-red-100 text-red-800",
      sklo: "bg-yellow-100 text-yellow-800",
      lko: "bg-indigo-100 text-indigo-800",
    };
    return colors[serviceType] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    if (status === "active") return "bg-green-100 text-green-800";
    if (status === "inactive") return "bg-gray-100 text-gray-800";
    return "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Detail Penyelenggaraan</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            <Button variant="outline" onClick={() => navigate("/search")}>
              Ke Pencarian
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat detail...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : !data ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Data tidak ditemukan.</p>
              <Button className="mt-4" onClick={() => navigate("/search")}>
                Kembali ke Pencarian
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {data.company_name}
                    </CardTitle>
                    <CardDescription>
                      {data.license_number && `No. Izin: ${data.license_number}`}
                      {data.region && ` • ${data.region}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getServiceTypeColor(data.service_type)}>
                      {data.service_type.replace("_", " ").toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(data.status)}>
                      {data.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-sm text-muted-foreground">Tanggal Dibuat</div>
                    <div className="mt-1 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span>{new Date(data.created_at).toLocaleDateString("id-ID")}</span>
                    </div>
                  </div>
                  {data.license_date && (
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="text-sm text-muted-foreground">Tanggal Izin</div>
                      <div className="mt-1 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span>{new Date(data.license_date).toLocaleDateString("id-ID")}</span>
                      </div>
                    </div>
                  )}
                  {data.region && (
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="text-sm text-muted-foreground">Wilayah</div>
                      <div className="mt-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{data.region}</span>
                      </div>
                    </div>
                  )}
                  {data.sub_service_type && (
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="text-sm text-muted-foreground">Jenis Layanan (Detail)</div>
                      <div className="mt-1">
                        <span>{data.sub_service_type}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {data.file_url ? (
                    <Button asChild>
                      <a href={data.file_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        Unduh Dokumen
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      <FileText className="mr-2 h-4 w-4" />
                      Dokumen Tidak Tersedia
                    </Button>
                  )}
                  {session ? (
                    <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                      Buka Dashboard
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={() => navigate("/auth")}>
                      Masuk untuk akses lengkap
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelekomDataDetail;