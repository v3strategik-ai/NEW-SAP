import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Check, Zap } from 'lucide-react';
import { toast } from 'sonner';

const IndustrySettings = ({ user, onLogout }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API}/industry/templates`, { headers: getAuthHeader() });
      setTemplates(response.data);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTemplate = async (template) => {
    try {
      await axios.post(`${API}/industry/activate`, {
        industry_type: template.industry_type,
        compliance_standards: template.compliance_standards,
        required_fields: template.required_fields
      }, { headers: getAuthHeader() });
      toast.success(`${template.name} template activated!`);
    } catch (error) {
      toast.error('Failed to activate template');
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
      <div className="space-y-6" data-testid="industry-settings-page">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Building2 className="w-10 h-10 text-indigo-600" />
            Industry Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
            Pre-configured settings for your industry
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="templates-grid">
          {templates.map((template) => (
            <Card key={template.industry_type} className="border-0 shadow-lg dark:bg-gray-800" data-testid={`template-${template.industry_type}`}>
              <CardHeader>
                <CardTitle className="text-2xl dark:text-gray-100">{template.name}</CardTitle>
                <CardDescription className="dark:text-gray-400">Industry-specific configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 dark:text-gray-100">Compliance Standards:</h4>
                  <div className="flex flex-wrap gap-2">
                    {template.compliance_standards.map((standard) => (
                      <Badge key={standard} variant="outline">{standard}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 dark:text-gray-100">Key Features:</h4>
                  <ul className="space-y-1">
                    {template.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="w-4 h-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={() => handleActivateTemplate(template)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  data-testid={`activate-${template.industry_type}`}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Activate Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default IndustrySettings;