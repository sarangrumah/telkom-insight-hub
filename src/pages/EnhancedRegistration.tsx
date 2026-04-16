import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EnhancedRegistrationForm from '@/components/EnhancedRegistrationForm';

const EnhancedRegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Panel Penyelenggaraan
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Sudah Punya Akun?
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Daftar Akun Perusahaan Baru</h1>
            <p className="text-muted-foreground">
              Bergabung dengan platform visualisasi data penyelenggaraan telekomunikasi
            </p>
          </div>

          <EnhancedRegistrationForm />
        </div>
      </div>
    </div>
  );
};

export default EnhancedRegistrationPage;