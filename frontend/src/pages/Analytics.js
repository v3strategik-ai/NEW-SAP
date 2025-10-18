import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, Zap, AlertTriangle, Target, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const Analytics = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [cohorts, setCohorts] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [dashRes, forecastRes, cohortsRes, anomaliesRes] = await Promise.all([
        axios.get(`${API}/analytics/dashboard`, { headers: getAuthHeader() }),
        axios.get(`${API}/analytics/forecast?metric=revenue`, { headers: getAuthHeader() }),
        axios.get(`${API}/analytics/cohorts`, { headers: getAuthHeader() }),
        axios.get(`${API}/analytics/anomalies`, { headers: getAuthHeader() })
      ]);
      setDashboardData(dashRes.data);
      setForecast(forecastRes.data);
      setCohorts(cohortsRes.data);
      setAnomalies(anomaliesRes.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="space-y-6" data-testid="analytics-page">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-indigo-600" />
            Advanced Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
            AI-powered insights and predictive analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
                  <h3 className="text-3xl font-bold mt-1 dark:text-gray-100">{dashboardData?.summary?.total_customers || 0}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Leads</p>
                  <h3 className="text-3xl font-bold mt-1 dark:text-gray-100">{dashboardData?.summary?.total_leads || 0}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Opportunities</p>
                  <h3 className="text-3xl font-bold mt-1 dark:text-gray-100">{dashboardData?.summary?.active_opportunities || 0}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <h3 className="text-3xl font-bold mt-1 dark:text-gray-100">${(dashboardData?.summary?.total_revenue || 0).toLocaleString()}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="charts" className="w-full">
          <TabsList>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-gray-100">Revenue Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dashboardData?.revenue_over_time || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#818cf8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-gray-100">Customer Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData?.customer_growth || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-gray-100">Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData?.top_products || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-gray-100">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">
                        {Math.round(dashboardData?.conversion_rate || 0)}%
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">Lead to Customer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forecast" className="mt-6">
            <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Zap className="w-5 h-5 text-purple-600" />
                  AI Revenue Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
                    <h3 className="text-3xl font-bold mt-2 dark:text-gray-100">${(forecast?.current_value || 0).toLocaleString()}</h3>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Predicted Value</p>
                    <h3 className="text-3xl font-bold mt-2 text-purple-600">${(forecast?.predicted_value || 0).toLocaleString()}</h3>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                    <h3 className="text-3xl font-bold mt-2 text-green-600">{Math.round((forecast?.confidence || 0) * 100)}%</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cohorts" className="mt-6">
            <Card className="border-0 shadow-md dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-gray-100">Cohort Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {cohorts.length > 0 ? (
                  <div className="space-y-3">
                    {cohorts.map((cohort, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold dark:text-gray-100">{cohort.cohort_name}</h4>
                          <Badge variant="outline">{cohort.customer_count} customers</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Revenue</p>
                            <p className="font-semibold text-green-600">${cohort.revenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Retention</p>
                            <p className="font-semibold text-blue-600">{cohort.retention_rate}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p>No cohort data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anomalies" className="mt-6">
            <Card className="border-0 shadow-md dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Anomaly Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                {anomalies && anomalies.length > 0 ? (
                  <div className="space-y-4">
                    {anomalies.map((anomaly, index) => (
                      <div key={index} className="p-4 rounded-lg border-l-4 bg-orange-50 dark:bg-orange-900/20 border-orange-500">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold dark:text-gray-100">{anomaly.type}</h4>
                          <Badge variant="secondary">{anomaly.severity}</Badge>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{anomaly.description}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Recommendation:</strong> {anomaly.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No anomalies detected</p>
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

export default Analytics;
