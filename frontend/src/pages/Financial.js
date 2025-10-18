import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DollarSign, FileText, TrendingUp, CreditCard, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Financial = ({ user, onLogout }) => {
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reports, setReports] = useState({ total_revenue: 0, pending_revenue: 0, invoice_stats: [] });
  const [activeTab, setActiveTab] = useState('overview');
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invoicesRes, transactionsRes, reportsRes] = await Promise.all([
        axios.get(`${API}/financial/invoices`, { headers: getAuthHeader() }),
        axios.get(`${API}/financial/transactions`, { headers: getAuthHeader() }),
        axios.get(`${API}/financial/reports`, { headers: getAuthHeader() })
      ]);
      setInvoices(invoicesRes.data);
      setTransactions(transactionsRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      toast.error('Failed to fetch financial data');
    }
  };

  const handlePredict = async () => {
    try {
      toast.info('AI is analyzing financial trends...');
      const response = await axios.post(`${API}/financial/predict`, {}, { headers: getAuthHeader() });
      setPredictions(response.data);
      toast.success('Predictions generated successfully!');
    } catch (error) {
      toast.error('Failed to generate predictions');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="financial-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Financial Management</h1>
            <p className="text-gray-600 text-lg mt-1">Track revenue, invoices, and financial health</p>
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            onClick={handlePredict}
            data-testid="predict-button"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Predictions
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview" data-testid="overview-tab">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="invoices" data-testid="invoices-tab">
              <FileText className="w-4 h-4 mr-2" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="transactions" data-testid="transactions-tab">
              <CreditCard className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md" data-testid="revenue-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <h3 className="text-4xl font-bold mt-2 text-green-600">${reports.total_revenue.toLocaleString()}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-green-100">
                      <DollarSign className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md" data-testid="pending-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Revenue</p>
                      <h3 className="text-4xl font-bold mt-2 text-orange-600">${reports.pending_revenue.toLocaleString()}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-orange-100">
                      <FileText className="w-7 h-7 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {predictions && (
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50" data-testid="predictions-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Financial Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Predicted Revenue (Next Quarter)</p>
                    <p className="text-3xl font-bold text-purple-600">${predictions.predicted_revenue_next_quarter.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Trends Analysis</p>
                    <p className="text-sm text-gray-700">{predictions.trends}</p>
                  </div>
                  {predictions.recommendations && predictions.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Recommendations</p>
                      <ul className="space-y-1">
                        {predictions.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-purple-600">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <Card data-testid="invoices-list">
              <CardHeader>
                <CardTitle>Invoices ({invoices.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow" data-testid={`invoice-${invoice.id}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{invoice.customer_name}</h3>
                            <p className="text-2xl font-bold text-green-600 mt-1">${invoice.total.toLocaleString()}</p>
                          </div>
                          <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'pending' ? 'secondary' : 'destructive'}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                          <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                          {invoice.paid_date && <span>Paid: {new Date(invoice.paid_date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No invoices yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <Card data-testid="transactions-list">
              <CardHeader>
                <CardTitle>Transactions ({transactions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow" data-testid={`transaction-${transaction.id}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-5 h-5 text-indigo-600" />
                              <div>
                                <p className="font-semibold">{transaction.payment_method}</p>
                                <p className="text-sm text-gray-600">{transaction.type}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">${transaction.amount.toLocaleString()}</p>
                            <Badge variant="outline" className="mt-1">{transaction.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No transactions yet.</p>
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

export default Financial;