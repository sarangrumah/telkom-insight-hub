import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLocationData } from '@/hooks/useLocationData';

export const LocationMigration = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { provinces, allKabupaten } = useLocationData();

  const migrateExistingData = async () => {
    setIsMigrating(true);
    setProgress(0);

    try {
      // Fetch all telekom_data entries that need migration
      const { data: telekomData, error: fetchError } = await supabase
        .from('telekom_data')
        .select('id, region')
        .is('province_id', null);

      if (fetchError) throw fetchError;

      if (!telekomData || telekomData.length === 0) {
        toast({
          title: "Migration Complete",
          description: "No data entries require migration",
        });
        setIsMigrating(false);
        return;
      }

      const total = telekomData.length;
      let processed = 0;

      // Process each entry
      for (const entry of telekomData) {
        if (entry.region) {
          // Try to find matching kabupaten/province
          const matchingKabupaten = allKabupaten.find(k => 
            k.name.toLowerCase().includes(entry.region.toLowerCase()) ||
            entry.region.toLowerCase().includes(k.name.toLowerCase())
          );

          if (matchingKabupaten) {
            // Update with matched location data
            await supabase
              .from('telekom_data')
              .update({
                province_id: matchingKabupaten.province_id,
                kabupaten_id: matchingKabupaten.id,
                latitude: matchingKabupaten.latitude,
                longitude: matchingKabupaten.longitude
              })
              .eq('id', entry.id);
          } else {
            // Try to match with province
            const matchingProvince = provinces.find(p =>
              p.name.toLowerCase().includes(entry.region.toLowerCase()) ||
              entry.region.toLowerCase().includes(p.name.toLowerCase())
            );

            if (matchingProvince) {
              await supabase
                .from('telekom_data')
                .update({
                  province_id: matchingProvince.id,
                  latitude: matchingProvince.latitude,
                  longitude: matchingProvince.longitude
                })
                .eq('id', entry.id);
            }
          }
        }

        processed++;
        setProgress((processed / total) * 100);
      }

      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${processed} entries`,
      });
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Migration Failed",
        description: "Failed to migrate existing data",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
      setProgress(0);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Data Migration</CardTitle>
        <CardDescription>
          Migrate existing region data to the new province/kabupaten structure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isMigrating && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">
              Migrating data... {Math.round(progress)}%
            </p>
          </div>
        )}
        
        <Button 
          onClick={migrateExistingData}
          disabled={isMigrating}
          className="w-full"
        >
          {isMigrating ? 'Migrating...' : 'Start Migration'}
        </Button>
      </CardContent>
    </Card>
  );
};