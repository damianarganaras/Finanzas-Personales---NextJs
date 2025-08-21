'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralSettingsForm } from '@/components/settings/GeneralSettingsForm';
import { NotificationSettingsForm } from '@/components/settings/NotificationSettingsForm';
import { DashboardSettingsForm } from '@/components/settings/DashboardSettingsForm';
import { UserProfileCard } from '@/components/settings/UserProfileCard';
import { Settings, User, Bell, Layout } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Personaliza tu experiencia y gestiona la configuración de tu cuenta
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <UserProfileCard />
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettingsForm />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettingsForm />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <DashboardSettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
