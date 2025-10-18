import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
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

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

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
      <div className=\"space-y-6\" data-testid=\"analytics-page\">
        <div>
          <h1 className=\"text-4xl font-bold flex items-center gap-3\">
            <BarChart3 className=\"w-10 h-10 text-indigo-600\" />
            Advanced Analytics
          </h1>
          <p className=\"text-gray-600 dark:text-gray-300 text-lg mt-1\">
            AI-powered insights and predictive analytics
          </p>
        </div>

        {/* Summary Cards */}
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\" data-testid=\"summary-cards\">
          <Card className=\"border-0 shadow-md dark:bg-gray-800\">
            <CardContent className=\"p-6\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"text-sm text-gray-600 dark:text-gray-400\">Total Customers</p>
                  <h3 className=\"text-3xl font-bold mt-1 dark:text-gray-100\">{dashboardData?.summary?.total_customers || 0}</h3>
                </div>
                <div className=\"w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center\">
                  <TrendingUp className=\"w-6 h-6 text-blue-600 dark:text-blue-400\" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className=\"border-0 shadow-md dark:bg-gray-800\">
            <CardContent className=\"p-6\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"text-sm text-gray-600 dark:text-gray-400\">Active Leads</p>
                  <h3 className=\"text-3xl font-bold mt-1 dark:text-gray-100\">{dashboardData?.summary?.total_leads || 0}</h3>
                </div>
                <div className=\"w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center\">
                  <Target className=\"w-6 h-6 text-purple-600 dark:text-purple-400\" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className=\"border-0 shadow-md dark:bg-gray-800\">
            <CardContent className=\"p-6\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"text-sm text-gray-600 dark:text-gray-400\">Opportunities</p>
                  <h3 className=\"text-3xl font-bold mt-1 dark:text-gray-100\">{dashboardData?.summary?.active_opportunities || 0}</h3>
                </div>
                <div className=\"w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center\">
                  <Zap className=\"w-6 h-6 text-green-600 dark:text-green-400\" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className=\"border-0 shadow-md dark:bg-gray-800\">
            <CardContent className=\"p-6\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"text-sm text-gray-600 dark:text-gray-400\">Total Revenue</p>
                  <h3 className=\"text-3xl font-bold mt-1 dark:text-gray-100\">${(dashboardData?.summary?.total_revenue || 0).toLocaleString()}</h3>
                </div>
                <div className=\"w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 flex items-center justify-center\">
                  <DollarSign className=\"w-6 h-6 text-orange-600 dark:text-orange-400\" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue=\"charts\" className=\"w-full\">
          <TabsList>
            <TabsTrigger value=\"charts\" data-testid=\"charts-tab\">Charts & Trends</TabsTrigger>
            <TabsTrigger value=\"forecast\" data-testid=\"forecast-tab\">AI Forecast</TabsTrigger>
            <TabsTrigger value=\"cohorts\" data-testid=\"cohorts-tab\">Cohort Analysis</TabsTrigger>
            <TabsTrigger value=\"anomalies\" data-testid=\"anomalies-tab\">Anomaly Detection</TabsTrigger>
          </TabsList>

          <TabsContent value=\"charts\" className=\"space-y-6 mt-6\">
            <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
              {/* Revenue Over Time */}
              <Card className=\"border-0 shadow-md dark:bg-gray-800\" data-testid=\"revenue-chart\">
                <CardHeader>
                  <CardTitle className=\"dark:text-gray-100\">Revenue Over Time</CardTitle>
                  <CardDescription className=\"dark:text-gray-400\">Monthly revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width=\"100%\" height={300}>
                    <AreaChart data={dashboardData?.revenue_over_time || []}>
                      <CartesianGrid strokeDasharray=\"3 3\" />
                      <XAxis dataKey=\"_id\" />
                      <YAxis />
                      <Tooltip />
                      <Area type=\"monotone\" dataKey=\"revenue\" stroke=\"#6366f1\" fill=\"#818cf8\" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customer Growth */}
              <Card className=\"border-0 shadow-md dark:bg-gray-800\" data-testid=\"customer-growth-chart\">
                <CardHeader>
                  <CardTitle className=\"dark:text-gray-100\">Customer Growth</CardTitle>
                  <CardDescription className=\"dark:text-gray-400\">New customers per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width=\"100%\" height={300}>
                    <LineChart data={dashboardData?.customer_growth || []}>
                      <CartesianGrid strokeDasharray=\"3 3\" />
                      <XAxis dataKey=\"_id\" />
                      <YAxis />
                      <Tooltip />
                      <Line type=\"monotone\" dataKey=\"count\" stroke=\"#8b5cf6\" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card className=\"border-0 shadow-md dark:bg-gray-800\" data-testid=\"top-products-chart\">
                <CardHeader>
                  <CardTitle className=\"dark:text-gray-100\">Top Products</CardTitle>
                  <CardDescription className=\"dark:text-gray-400\">Best performing products by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width=\"100%\" height={300}>
                    <BarChart data={dashboardData?.top_products || []}>
                      <CartesianGrid strokeDasharray=\"3 3\" />
                      <XAxis dataKey=\"_id\" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey=\"revenue\" fill=\"#10b981\" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Conversion Rate */}
              <Card className=\"border-0 shadow-md dark:bg-gray-800\" data-testid=\"conversion-chart\">
                <CardHeader>
                  <CardTitle className=\"dark:text-gray-100\">Lead Conversion</CardTitle>
                  <CardDescription className=\"dark:text-gray-400\">Conversion funnel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className=\"flex items-center justify-center h-[300px]\">
                    <div className=\"text-center\">
                      <div className=\"text-6xl font-bold text-indigo-600 dark:text-indigo-400\">
                        {Math.round(dashboardData?.conversion_rate || 0)}%
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">Conversion Rate</p>
                      <Badge variant="outline" className="mt-4">Lead to Customer</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forecast" className="mt-6">\n            <Card className=\"border-0 shadow-md bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20\" data-testid=\"forecast-card\">\n              <CardHeader>\n                <CardTitle className=\"flex items-center gap-2 dark:text-gray-100\">\n                  <Zap className=\"w-5 h-5 text-purple-600 dark:text-purple-400\" />\n                  AI Revenue Forecast\n                </CardTitle>\n                <CardDescription className=\"dark:text-gray-400\">Machine learning powered predictions</CardDescription>\n              </CardHeader>\n              <CardContent className=\"space-y-6\">\n                <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">\n                  <div className=\"p-6 bg-white dark:bg-gray-800 rounded-xl\">\n                    <p className=\"text-sm text-gray-600 dark:text-gray-400\">Current Value</p>\n                    <h3 className=\"text-3xl font-bold mt-2 dark:text-gray-100\">${(forecast?.current_value || 0).toLocaleString()}</h3>\n                  </div>\n                  <div className=\"p-6 bg-white dark:bg-gray-800 rounded-xl\">\n                    <p className=\"text-sm text-gray-600 dark:text-gray-400\">Predicted Value</p>\n                    <h3 className=\"text-3xl font-bold mt-2 text-purple-600 dark:text-purple-400\">${(forecast?.predicted_value || 0).toLocaleString()}</h3>\n                  </div>\n                  <div className=\"p-6 bg-white dark:bg-gray-800 rounded-xl\">\n                    <p className=\"text-sm text-gray-600 dark:text-gray-400\">Confidence</p>\n                    <h3 className=\"text-3xl font-bold mt-2 text-green-600 dark:text-green-400\">{Math.round((forecast?.confidence || 0) * 100)}%</h3>\n                  </div>\n                </div>\n                {forecast?.factors && forecast.factors.length > 0 && (\n                  <div>\n                    <h4 className=\"font-semibold mb-3 dark:text-gray-100\">Key Factors:</h4>\n                    <ul className=\"space-y-2\">\n                      {forecast.factors.map((factor, index) => (\n                        <li key={index} className=\"flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300\">\n                          <TrendingUp className=\"w-4 h-4 text-purple-600 dark:text-purple-400\" />\n                          {factor}\n                        </li>\n                      ))}\n                    </ul>\n                  </div>\n                )}\n              </CardContent>\n            </Card>\n          </TabsContent>\n\n          <TabsContent value=\"cohorts\" className=\"mt-6\">\n            <Card className=\"border-0 shadow-md dark:bg-gray-800\" data-testid=\"cohorts-card\">\n              <CardHeader>\n                <CardTitle className=\"dark:text-gray-100\">Cohort Analysis</CardTitle>\n                <CardDescription className=\"dark:text-gray-400\">Customer lifetime value by cohort</CardDescription>\n              </CardHeader>\n              <CardContent>\n                {cohorts.length > 0 ? (\n                  <div className=\"space-y-3\">\n                    {cohorts.map((cohort, index) => (\n                      <div key={index} className=\"p-4 border border-gray-200 dark:border-gray-700 rounded-lg\" data-testid={`cohort-${index}`}>\n                        <div className=\"flex items-center justify-between mb-2\">\n                          <h4 className=\"font-semibold dark:text-gray-100\">{cohort.cohort_name}</h4>\n                          <Badge variant=\"outline\">{cohort.customer_count} customers</Badge>\n                        </div>\n                        <div className=\"grid grid-cols-2 gap-4 text-sm\">\n                          <div>\n                            <p className=\"text-gray-600 dark:text-gray-400\">Revenue</p>\n                            <p className=\"font-semibold text-green-600 dark:text-green-400\">${cohort.revenue.toLocaleString()}</p>\n                          </div>\n                          <div>\n                            <p className=\"text-gray-600 dark:text-gray-400\">Retention</p>\n                            <p className=\"font-semibold text-blue-600 dark:text-blue-400\">{cohort.retention_rate}%</p>\n                          </div>\n                        </div>\n                      </div>\n                    ))}\n                  </div>\n                ) : (\n                  <div className=\"text-center py-12 text-gray-500 dark:text-gray-400\">\n                    <p>No cohort data available yet</p>\n                  </div>\n                )}\n              </CardContent>\n            </Card>\n          </TabsContent>\n\n          <TabsContent value=\"anomalies\" className=\"mt-6\">\n            <Card className=\"border-0 shadow-md dark:bg-gray-800\" data-testid=\"anomalies-card\">\n              <CardHeader>\n                <CardTitle className=\"flex items-center gap-2 dark:text-gray-100\">\n                  <AlertTriangle className=\"w-5 h-5 text-orange-600 dark:text-orange-400\" />\n                  Anomaly Detection\n                </CardTitle>\n                <CardDescription className=\"dark:text-gray-400\">AI-detected unusual patterns</CardDescription>\n              </CardHeader>\n              <CardContent>\n                {anomalies && anomalies.length > 0 ? (\n                  <div className=\"space-y-4\">\n                    {anomalies.map((anomaly, index) => (\n                      <div\n                        key={index}\n                        className={`p-4 rounded-lg border-l-4 ${\n                          anomaly.severity === 'high'\n                            ? 'bg-red-50 dark:bg-red-900/20 border-red-500'\n                            : anomaly.severity === 'medium'\n                            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'\n                            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'\n                        }`}\n                        data-testid={`anomaly-${index}`}\n                      >\n                        <div className=\"flex items-start justify-between mb-2\">\n                          <h4 className=\"font-semibold dark:text-gray-100\">{anomaly.type}</h4>\n                          <Badge variant={anomaly.severity === 'high' ? 'destructive' : 'secondary'}>\n                            {anomaly.severity}\n                          </Badge>\n                        </div>\n                        <p className=\"text-sm text-gray-700 dark:text-gray-300 mb-2\">{anomaly.description}</p>\n                        <p className=\"text-sm text-gray-600 dark:text-gray-400\">\n                          <strong>Recommendation:</strong> {anomaly.recommendation}\n                        </p>\n                      </div>\n                    ))}\n                  </div>\n                ) : (\n                  <div className=\"text-center py-12 text-gray-500 dark:text-gray-400\">\n                    <AlertTriangle className=\"w-16 h-16 mx-auto mb-4 opacity-50\" />\n                    <p>No anomalies detected</p>\n                    <p className=\"text-sm mt-2\">Your business metrics look healthy!</p>\n                  </div>\n                )}\n              </CardContent>\n            </Card>\n          </TabsContent>\n        </Tabs>\n      </div>\n    </Layout>\n  );\n};\n\nexport default Analytics;
