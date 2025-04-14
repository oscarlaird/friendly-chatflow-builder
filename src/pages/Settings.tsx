import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { ConnectedAppsSettings } from '@/components/settings/ConnectedAppsSettings';

export default function Settings() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage your application preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* General settings content will go here */}
                <p className="text-muted-foreground">
                  General settings will be implemented in future updates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Email</h3>
                  <p>{user?.email}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Plan</h3>
                  <p>Trial</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Credits</h3>
                  <p>2,500 / 10,000 used</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations" className="mt-4 space-y-4">
            <ConnectedAppsSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
