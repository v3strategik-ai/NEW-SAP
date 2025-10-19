import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderKanban, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const ProjectManagement = ({ user, onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`, { headers: getAuthHeader() });
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}/tasks`, { headers: getAuthHeader() });
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/projects`, {
        ...formData,
        status: 'active',
        team_members: [],
        created_by: user.id
      }, { headers: getAuthHeader() });
      toast.success('Project created!');
      setDialogOpen(false);
      setFormData({});
      fetchProjects();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    fetchTasks(project.id);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="project-management-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <FolderKanban className="w-10 h-10 text-indigo-600" />
              Project Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
              Manage projects, tasks, and timelines
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600" data-testid="create-project-button">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="create-project-dialog">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <Label>Project Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="project-name-input"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="project-description-input"
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    data-testid="project-start-date-input"
                  />
                </div>
                <div>
                  <Label>Budget</Label>
                  <Input
                    type="number"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    data-testid="project-budget-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-project-button">
                  Create Project
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-0 shadow-md dark:bg-gray-800" data-testid="projects-list">
            <CardHeader>
              <CardTitle className="dark:text-gray-100">Projects ({projects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedProject?.id === project.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                    }`}
                    data-testid={`project-${project.id}`}
                  >
                    <h4 className="font-semibold dark:text-gray-100">{project.name}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{project.status}</Badge>
                      {project.budget && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">${project.budget.toLocaleString()}</span>
                      )}
                    </div>
                  </button>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No projects yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-0 shadow-md dark:bg-gray-800" data-testid="project-details">
            <CardHeader>
              <CardTitle className="dark:text-gray-100">
                {selectedProject ? selectedProject.name : 'Select a project'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProject ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2 dark:text-gray-100">Project Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Status</p>
                        <Badge className="mt-1">{selectedProject.status}</Badge>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Start Date</p>
                        <p className="font-semibold dark:text-gray-200">{new Date(selectedProject.start_date).toLocaleDateString()}</p>
                      </div>
                      {selectedProject.budget && (
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Budget</p>
                          <p className="font-semibold text-green-600">${selectedProject.budget.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 dark:text-gray-100">Tasks ({tasks.length})</h4>
                    {tasks.length > 0 ? (
                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <div key={task.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg" data-testid={`task-${task.id}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className={`w-5 h-5 mt-0.5 ${
                                  task.status === 'done' ? 'text-green-600' : 'text-gray-400'
                                }`} />
                                <div>
                                  <h5 className="font-medium dark:text-gray-100">{task.title}</h5>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline">{task.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">No tasks yet for this project</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FolderKanban className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a project to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectManagement;