import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Volume2, Monitor, Settings } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function NotificationSettings() {
  const { permission, preferences, setPreferences, playNotificationSound } = useNotifications();
  
  const requestPermission = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
      window.location.reload(); // Refresh to update permission state
    }
  };

  const testSound = () => {
    playNotificationSound();
  };

  const updatePreference = (key: keyof typeof preferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Notification Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Configure how you want to be notified about new messages and tickets.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Browser Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Browser Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show desktop notifications for new messages
                </p>
              </div>
              <Switch
                checked={preferences.browserNotifications && permission === 'granted'}
                onCheckedChange={(checked) => updatePreference('browserNotifications', checked)}
                disabled={permission !== 'granted'}
              />
            </div>
            
            {permission !== 'granted' && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Permission Required
                      </p>
                      <p className="text-xs text-amber-600">
                        Enable browser notifications to receive alerts
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={requestPermission}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      Enable
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sound Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Sound Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Play a sound when new messages arrive
                </p>
              </div>
              <Switch
                checked={preferences.soundNotifications}
                onCheckedChange={(checked) => updatePreference('soundNotifications', checked)}
              />
            </div>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={testSound}
              className="w-full"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Test Sound
            </Button>
          </div>

          {/* Tab Title Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Tab Title Badges
                </Label>
              <p className="text-sm text-muted-foreground">
                Show unread count in browser tab title
              </p>
            </div>
            <Switch
              checked={preferences.tabNotifications}
              onCheckedChange={(checked) => updatePreference('tabNotifications', checked)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}