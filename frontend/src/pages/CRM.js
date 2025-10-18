import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Target, TrendingUp, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const CRM = ({ user, onLogout }) => {
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('customers');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, leadsRes, oppsRes] = await Promise.all([
        axios.get(`${API}/crm/customers`, { headers: getAuthHeader() }),
        axios.get(`${API}/crm/leads`, { headers: getAuthHeader() }),
        axios.get(`${API}/crm/opportunities`, { headers: getAuthHeader() })
      ]);
      setCustomers(customersRes.data);
      setLeads(leadsRes.data);
      setOpportunities(oppsRes.data);
    } catch (error) {
      toast.error('Failed to fetch CRM data');
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/crm/customers`, formData, { headers: getAuthHeader() });
      toast.success('Customer created successfully!');
      setDialogOpen(false);
      setFormData({});
      fetchData();
    } catch (error) {
      toast.error('Failed to create customer');
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/crm/leads`, formData, { headers: getAuthHeader() });
      toast.success('Lead created successfully!');
      setDialogOpen(false);
      setFormData({});
      fetchData();
    } catch (error) {
      toast.error('Failed to create lead');
    }
  };

  const handleScoreLead = async (leadId) => {
    try {
      toast.info('AI is scoring the lead...');
      const response = await axios.post(`${API}/crm/leads/${leadId}/score`, {}, { headers: getAuthHeader() });
      toast.success(`Lead scored: ${response.data.score}/100`);
      fetchData();
    } catch (error) {
      toast.error('Failed to score lead');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="crm-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Customer Relationship Management</h1>
            <p className="text-gray-600 text-lg mt-1">Manage your customers, leads, and opportunities</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" data-testid="add-new-button">
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" data-testid="create-dialog">
              <DialogHeader>
                <DialogTitle>Add New {activeTab === 'customers' ? 'Customer' : 'Lead'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={activeTab === 'customers' ? handleCreateCustomer : handleCreateLead} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="name-input"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="email-input"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="phone-input"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    data-testid="company-input"
                  />
                </div>
                {activeTab === 'leads' && (
                  <div>
                    <Label>Source</Label>
                    <Input
                      value={formData.source || ''}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      placeholder="e.g., Website, Referral, Event"
                      required
                      data-testid="source-input"
                    />
                  </div>
                )}
                {activeTab === 'customers' && (
                  <div>
                    <Label>Industry</Label>
                    <Input
                      value={formData.industry || ''}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      data-testid="industry-input"
                    />
                  </div>
                )}
                <Button type="submit" className="w-full" data-testid="submit-button">
                  Create {activeTab === 'customers' ? 'Customer' : 'Lead'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="customers" data-testid="customers-tab">
              <Users className="w-4 h-4 mr-2" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="leads" data-testid="leads-tab">
              <Target className="w-4 h-4 mr-2" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="opportunities" data-testid="opportunities-tab">
              <TrendingUp className="w-4 h-4 mr-2" />
              Opportunities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="mt-6">
            <Card data-testid="customers-list">
              <CardHeader>
                <CardTitle>Customers ({customers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {customers.length > 0 ? (
                  <div className="space-y-4">
                    {customers.map((customer) => (
                      <div key={customer.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow" data-testid={`customer-${customer.id}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{customer.name}</h3>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                            {customer.company && <p className="text-sm text-gray-600">{customer.company}</p>}
                          </div>
                          <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                            {customer.status}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <span className="text-gray-600">LTV: <span className="font-semibold text-green-600">${customer.lifetime_value}</span></span>
                          {customer.industry && <span className="text-gray-600">{customer.industry}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No customers yet. Add your first customer!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <Card data-testid="leads-list">
              <CardHeader>
                <CardTitle>Leads ({leads.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {leads.length > 0 ? (
                  <div className="space-y-4">
                    {leads.map((lead) => (
                      <div key={lead.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow" data-testid={`lead-${lead.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{lead.name}</h3>
                            <p className="text-sm text-gray-600">{lead.email}</p>
                            {lead.company && <p className="text-sm text-gray-600">{lead.company}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>{lead.status}</Badge>
                            {lead.score && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                Score: {lead.score}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-sm text-gray-600">Source: <span className="font-medium">{lead.source}</span></span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScoreLead(lead.id)}
                            className="ml-auto"
                            data-testid={`score-lead-${lead.id}`}
                          >
                            <Sparkles className="w-4 h-4 mr-1" />
                            AI Score
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No leads yet. Add your first lead!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="mt-6">
            <Card data-testid="opportunities-list">
              <CardHeader>
                <CardTitle>Opportunities ({opportunities.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {opportunities.length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.map((opp) => (
                      <div key={opp.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow" data-testid={`opportunity-${opp.id}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{opp.name}</h3>
                            <p className="text-2xl font-bold text-green-600 mt-1">${opp.value.toLocaleString()}</p>
                          </div>
                          <Badge>{opp.stage}</Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <span className="text-gray-600">Probability: <span className="font-semibold">{opp.probability}%</span></span>
                          {opp.expected_close_date && (
                            <span className="text-gray-600">Close: {new Date(opp.expected_close_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No opportunities yet. Create your first opportunity!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CRM;