import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plug, Zap, CheckCircle, Plus, MessageSquare, Calendar, Mail, Database } from 'lucide-react';
import { toast } from 'sonner';

const Integrations = ({ user, onLogout }) => {
  const [integrations, setIntegrations] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await axios.get(`${API}/integrations`, { headers: getAuthHeader() });
      setIntegrations(response.data);
    } catch (error) {
      toast.error('Failed to fetch integrations');
    }
  };

  const handleToggleIntegration = async (integrationId) => {
    try {
      await axios.put(`${API}/integrations/${integrationId}/toggle`, {}, { headers: getAuthHeader() });
      toast.success('Integration updated!');
      fetchIntegrations();
    } catch (error) {
      toast.error('Failed to update integration');
    }
  };

  const handleTestIntegration = async (integrationId) => {
    try {
      toast.info('Testing integration...');
      const response = await axios.post(`${API}/integrations/${integrationId}/test`, {}, { headers: getAuthHeader() });
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Integration test failed');
    }
  };

  const availableIntegrations = [
    {
      name: 'Slack',
      type: 'slack',
      icon: MessageSquare,
      description: 'Get real-time notifications in your Slack workspace',
      color: 'from-purple-600 to-pink-600'
    },
    {
      name: 'Microsoft Teams',
      type: 'teams',
      icon: MessageSquare,
      description: 'Sync activities with Microsoft Teams channels',
      color: 'from-blue-600 to-purple-600'
    },
    {
      name: 'Google Calendar',
      type: 'calendar',
      icon: Calendar,
      description: 'Sync meetings and events automatically',
      color: 'from-blue-600 to-green-600'
    },
    {
      name: 'Zapier',
      type: 'zapier',
      icon: Zap,
      description: 'Connect to 5000+ apps via Zapier',
      color: 'from-orange-600 to-yellow-600'
    },
    {
      name: 'SendGrid',
      type: 'sendgrid',
      icon: Mail,
      description: 'Automated email marketing campaigns',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      name: 'PostgreSQL',
      type: 'postgresql',
      icon: Database,
      description: 'Connect external PostgreSQL databases',
      color: 'from-blue-600 to-indigo-600'
    }
  ];

  const handleConnectIntegration = async (integration) => {
    try {
      const newIntegration = {
        name: integration.name,
        type: integration.type,
        is_active: true,
        config: {},
        connected_by: user.id
      };
      await axios.post(`${API}/integrations`, newIntegration, { headers: getAuthHeader() });
      toast.success(`${integration.name} connected!`);
      setDialogOpen(false);
      fetchIntegrations();
    } catch (error) {
      toast.error('Failed to connect integration');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="integrations-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Plug className="w-10 h-10 text-indigo-600" />
              Integrations
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
              Connect Agentix AI with your favorite tools
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" data-testid="add-integration-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" data-testid="integration-dialog">
              <DialogHeader>
                <DialogTitle>Connect New Integration</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {availableIntegrations.map((integration) => {
                  const Icon = integration.icon;
                  return (
                    <button
                      key={integration.type}
                      onClick={() => handleConnectIntegration(integration)}
                      className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-600 dark:hover:border-indigo-400 transition-all text-left"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold dark:text-gray-100">{integration.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{integration.description}</p>
                    </button>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Connected Integrations */}
        <Card className="border-0 shadow-md dark:bg-gray-800" data-testid="connected-integrations">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Connected Integrations
              <Badge variant="outline" className="ml-auto">{integrations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {integrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration) => {
                  const config = availableIntegrations.find(i => i.type === integration.type) || availableIntegrations[0];
                  const Icon = config.icon;
                  return (
                    <div key={integration.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl" data-testid={`integration-${integration.id}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold dark:text-gray-100">{integration.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{integration.type}</p>
                          </div>
                        </div>
                        <Badge variant={integration.is_active ? 'default' : 'secondary'}>
                          {integration.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleIntegration(integration.id)}
                          className="flex-1"
                        >
                          {integration.is_active ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestIntegration(integration.id)}
                          className="flex-1"
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Plug className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No integrations connected yet</p>
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  Connect Your First Integration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Marketplace Banner */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-600 to-purple-600 text-white" data-testid="api-marketplace-banner">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">API Marketplace</h2>
                <p className="text-indigo-100 mb-4">Access 1000+ pre-built integrations and custom APIs</p>
                <Button variant="secondary" size="lg">Browse Marketplace</Button>
              </div>
              <Zap className="w-24 h-24 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Integrations;