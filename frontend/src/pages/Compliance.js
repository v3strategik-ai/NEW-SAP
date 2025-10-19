import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Play, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const Compliance = ({ user, onLogout }) => {
  const [complianceData, setComplianceData] = useState({ items: [], summary: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompliance();
  }, []);

  const fetchCompliance = async () => {
    try {
      const response = await axios.get(`${API}/compliance/status`, { headers: getAuthHeader() });
      setComplianceData(response.data);
    } catch (error) {
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunScan = async (standard) => {
    try {
      toast.info(`Running ${standard} compliance scan...`);
      await axios.post(`${API}/compliance/scan?standard=${standard}`, {}, { headers: getAuthHeader() });
      toast.success('Compliance scan completed!');
      fetchCompliance();
    } catch (error) {
      toast.error('Scan failed');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'non_compliant':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
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
      <div className="space-y-6" data-testid="compliance-page">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Shield className="w-10 h-10 text-indigo-600" />
            Compliance Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
            GDPR, SOC 2, HIPAA compliance automation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md dark:bg-gray-800">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Requirements</p>
              <h3 className="text-3xl font-bold mt-1 dark:text-gray-100">{complianceData.summary.total_requirements || 0}</h3>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md dark:bg-gray-800">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Compliant</p>
              <h3 className="text-3xl font-bold mt-1 text-green-600">{complianceData.summary.compliant || 0}</h3>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md dark:bg-gray-800">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <h3 className="text-3xl font-bold mt-1 text-orange-600">{complianceData.summary.in_progress || 0}</h3>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md dark:bg-gray-800">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Non-Compliant</p>
              <h3 className="text-3xl font-bold mt-1 text-red-600">{complianceData.summary.non_compliant || 0}</h3>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="dark:text-gray-100">Run Compliance Scans</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['GDPR', 'SOC2', 'HIPAA', 'PCI-DSS'].map((standard) => (
                <Button
                  key={standard}
                  onClick={() => handleRunScan(standard)}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  data-testid={`scan-${standard}`}
                >
                  <Play className="w-6 h-6" />
                  <span>{standard}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Compliance Items</CardTitle>
          </CardHeader>
          <CardContent>
            {complianceData.items.length > 0 ? (
              <div className="space-y-3">
                {complianceData.items.map((item, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg" data-testid={`compliance-item-${index}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(item.status)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold dark:text-gray-100">{item.requirement}</h4>
                            <Badge variant="outline">{item.standard}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Last checked: {new Date(item.last_checked).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant={item.status === 'compliant' ? 'default' : item.status === 'non_compliant' ? 'destructive' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No compliance scans run yet. Start a scan above!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Compliance;