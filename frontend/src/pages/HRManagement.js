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
import { Users, Plus, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const HRManagement = ({ user, onLogout }) => {
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, analyticsRes] = await Promise.all([
        axios.get(`${API}/hr/employees`, { headers: getAuthHeader() }),
        axios.get(`${API}/hr/analytics`, { headers: getAuthHeader() })
      ]);
      setEmployees(employeesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      toast.error('Failed to fetch HR data');
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/hr/employees`, {
        ...formData,
        status: 'active'
      }, { headers: getAuthHeader() });
      toast.success('Employee added!');
      setDialogOpen(false);
      setFormData({});
      fetchData();
    } catch (error) {
      toast.error('Failed to add employee');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="hr-management-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Users className="w-10 h-10 text-indigo-600" />
              HR Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
              Employee records and workforce analytics
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600" data-testid="add-employee-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="add-employee-dialog">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div>
                  <Label>Employee ID</Label>
                  <Input
                    value={formData.employee_id || ''}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    required
                    data-testid="employee-id-input"
                  />
                </div>
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="employee-name-input"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="employee-email-input"
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                    data-testid="employee-department-input"
                  />
                </div>
                <div>
                  <Label>Position</Label>
                  <Input
                    value={formData.position || ''}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                    data-testid="employee-position-input"
                  />
                </div>
                <div>
                  <Label>Hire Date</Label>
                  <Input
                    type="date"
                    value={formData.hire_date || ''}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    required
                    data-testid="employee-hire-date-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-employee-button">
                  Add Employee
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md dark:bg-gray-800">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Employees</p>
              <h3 className="text-3xl font-bold mt-1 dark:text-gray-100">{analytics.total_employees || 0}</h3>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md dark:bg-gray-800">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <h3 className="text-3xl font-bold mt-1 text-green-600">{analytics.active_employees || 0}</h3>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md dark:bg-gray-800">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Departments</p>
              <h3 className="text-3xl font-bold mt-1 text-indigo-600">{analytics.department_breakdown?.length || 0}</h3>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md dark:bg-gray-800" data-testid="employees-list">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {employees.length > 0 ? (
              <div className="space-y-3">
                {employees.map((employee) => (
                  <div key={employee.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg" data-testid={`employee-${employee.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold dark:text-gray-100">{employee.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{employee.position}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{employee.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                          {employee.status}
                        </Badge>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{employee.department}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No employees yet. Add your first employee!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default HRManagement;