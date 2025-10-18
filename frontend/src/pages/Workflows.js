import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Workflow, Play, Plus, Zap, GitBranch } from 'lucide-react';
import { toast } from 'sonner';

const Workflows = ({ user, onLogout }) => {
  const [workflows, setWorkflows] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await axios.get(`${API}/workflows`, { headers: getAuthHeader() });
      setWorkflows(response.data);
    } catch (error) {
      toast.error('Failed to fetch workflows');
    }
  };

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    try {
      const workflow = {
        ...formData,
        nodes: [
          { id: '1', type: 'trigger', config: { event: 'lead_created' }, position: { x: 100, y: 100 } },
          { id: '2', type: 'action', config: { action: 'send_email' }, position: { x: 300, y: 100 } }
        ],
        connections: [{ from: '1', to: '2' }],
        is_active: true,
        created_by: user.id
      };

      await axios.post(`${API}/workflows`, workflow, { headers: getAuthHeader() });
      toast.success('Workflow created!');
      setDialogOpen(false);
      setFormData({ name: '', description: '' });
      fetchWorkflows();
    } catch (error) {
      toast.error('Failed to create workflow');
    }
  };

  const handleExecuteWorkflow = async (workflowId) => {
    try {
      toast.info('Executing workflow...');
      await axios.post(`${API}/workflows/${workflowId}/execute`, {}, { headers: getAuthHeader() });
      toast.success('Workflow executed successfully!');
    } catch (error) {
      toast.error('Failed to execute workflow');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="workflows-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <GitBranch className="w-10 h-10 text-indigo-600" />
              Workflow Automation
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
              Build intelligent automation flows with AI
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" data-testid="create-workflow-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="create-workflow-dialog">
              <DialogHeader>
                <DialogTitle>Create New Workflow</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateWorkflow} className="space-y-4">
                <div>
                  <Label>Workflow Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Auto-follow up on new leads"
                    required
                    data-testid="workflow-name-input"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What does this workflow do?"
                    data-testid="workflow-description-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-workflow-button">
                  Create Workflow
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="workflows-grid">
          {workflows.length > 0 ? (
            workflows.map((workflow) => (
              <Card key={workflow.id} className="card-hover border-0 shadow-md dark:bg-gray-800" data-testid={`workflow-${workflow.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
                        <Workflow className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg dark:text-gray-100">{workflow.name}</CardTitle>
                      </div>
                    </div>
                    <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                      {workflow.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {workflow.description && (
                    <CardDescription className="mt-2 dark:text-gray-400">{workflow.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Zap className="w-4 h-4" />
                      <span>{workflow.nodes?.length || 0} steps</span>
                    </div>
                    <Button
                      onClick={() => handleExecuteWorkflow(workflow.id)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-testid={`execute-workflow-${workflow.id}`}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No workflows yet. Create your first automation!</p>
            </div>
          )}
        </div>

        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20" data-testid="workflow-templates">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Workflow Templates
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Start with pre-built automations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <h3 className="font-semibold mb-2 dark:text-gray-100">Auto Lead Follow-up</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Automatically email new leads within 5 minutes</p>
                <Button size="sm" variant="outline">Use Template</Button>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <h3 className="font-semibold mb-2 dark:text-gray-100">Invoice Reminder</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Send reminders for overdue invoices</p>
                <Button size="sm" variant="outline">Use Template</Button>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <h3 className="font-semibold mb-2 dark:text-gray-100">Low Stock Alert</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Notify when inventory falls below threshold</p>
                <Button size="sm" variant="outline">Use Template</Button>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <h3 className="font-semibold mb-2 dark:text-gray-100">Deal Won Celebration</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Auto-celebrate team wins in Slack</p>
                <Button size="sm" variant="outline">Use Template</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Workflows;
