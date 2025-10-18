import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Users, Target, DollarSign, Package, FileText, Brain, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    crm: { total_customers: 0, total_leads: 0, total_opportunities: 0, pipeline_value: 0 },
    financial: { total_revenue: 0, pending_revenue: 0 },
    insights: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [crmRes, financialRes, insightsRes] = await Promise.all([
        axios.get(`${API}/crm/dashboard`, { headers: getAuthHeader() }),
        axios.get(`${API}/financial/reports`, { headers: getAuthHeader() }),
        axios.get(`${API}/ai/insights`, { headers: getAuthHeader() })
      ]);

      setStats({
        crm: crmRes.data,
        financial: financialRes.data,
        insights: insightsRes.data.insights || []
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color, testId }) => (
    <Card className="card-hover border-0 shadow-md" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h3 className="text-3xl font-bold mt-2" style={{ color }}>{value}</h3>
            {trend && (
              <div className="flex items-center mt-2 text-sm text-green-600">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-7 h-7" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="flex items-center justify-center h-96">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-8" data-testid="dashboard-container">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 text-lg">Here's what's happening with your business today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Customers"
            value={stats.crm.total_customers}
            icon={Users}
            color="#6366f1"
            testId="stat-customers"
          />
          <StatCard
            title="Active Leads"
            value={stats.crm.total_leads}
            icon={Target}
            color="#8b5cf6"
            testId="stat-leads"
          />
          <StatCard
            title="Pipeline Value"
            value={`$${(stats.crm.pipeline_value || 0).toLocaleString()}`}
            icon={TrendingUp}
            color="#10b981"
            testId="stat-pipeline"
          />
          <StatCard
            title="Total Revenue"
            value={`$${(stats.financial.total_revenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="#f59e0b"
            testId="stat-revenue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md" data-testid="quick-actions-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl hover:shadow-md transition-all text-left" data-testid="action-add-customer">
                  <Users className="w-6 h-6 text-indigo-600 mb-2" />
                  <p className="font-semibold text-sm">Add Customer</p>
                </button>
                <button className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all text-left" data-testid="action-create-quote">
                  <FileText className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="font-semibold text-sm">Create Quote</p>
                </button>
                <button className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-md transition-all text-left" data-testid="action-manage-inventory">
                  <Package className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="font-semibold text-sm">Manage Inventory</p>
                </button>
                <button className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all text-left" data-testid="action-view-reports">
                  <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                  <p className="font-semibold text-sm">View Reports</p>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md" data-testid="ai-insights-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Insights
              </CardTitle>
              <CardDescription>Powered by advanced analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.insights.length > 0 ? (
                  stats.insights.slice(0, 3).map((insight, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg" data-testid={`insight-${index}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          insight.priority === 'high' ? 'bg-red-500' :
                          insight.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <p className="font-semibold text-sm">{insight.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Add more data to generate AI insights</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;