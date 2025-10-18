import { useState } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const DocumentIntelligence = ({ user, onLogout }) => {
  const [documentText, setDocumentText] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExtractData = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/documents/extract`,
        {
          file_name: 'pasted-document.txt',
          file_type: 'text',
          content: documentText
        },
        { headers: getAuthHeader() }
      );
      setExtractedData(response.data);
      toast.success('Data extracted successfully!');
    } catch (error) {
      toast.error('Failed to extract data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="document-intelligence-page">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <FileText className="w-10 h-10 text-indigo-600" />
            Document Intelligence
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
            Extract structured data from invoices, contracts, and receipts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md dark:bg-gray-800" data-testid="document-input">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                <Upload className="w-5 h-5 text-indigo-600" />
                Upload Document
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Paste document text or upload a file</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExtractData} className="space-y-4">
                <div>
                  <Label>Document Content</Label>
                  <Textarea
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    placeholder="Paste invoice, contract, or receipt text here...\n\nExample:\nINVOICE #12345\nDate: 2025-01-15\nVendor: Acme Corp\nAmount: $1,500.00"
                    rows={15}
                    required
                    data-testid="document-text-input"
                    className="font-mono text-sm"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="extract-button">
                  {loading ? (
                    <>Extracting...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />Extract Data</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md dark:bg-gray-800" data-testid="extracted-data">
            <CardHeader>
              <CardTitle className="dark:text-gray-100">Extracted Data</CardTitle>
              <CardDescription className="dark:text-gray-400">AI-detected fields and values</CardDescription>
            </CardHeader>
            <CardContent>
              {extractedData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold dark:text-gray-100">Document Type: {extractedData.document_type}</span>
                    </div>
                    <Badge variant="outline" className="dark:border-green-600 dark:text-green-400">
                      {Math.round(extractedData.confidence * 100)}% confidence
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Extracted Fields:</Label>
                    <div className="space-y-2">
                      {Object.entries(extractedData.fields).map(([key, value]) => (
                        <div key={key} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm mt-1 dark:text-gray-200">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => setExtractedData(null)}>
                    Extract Another Document
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Upload a document to extract data</p>
                  <p className="text-sm mt-2">Supports invoices, contracts, receipts, and more</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20" data-testid="supported-docs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Supported Document Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2 dark:text-gray-100">📄 Invoices</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Invoice number, date, vendor, line items, total</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2 dark:text-gray-100">📋 Contracts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Parties, dates, terms, obligations, value</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2 dark:text-gray-100">🧾 Receipts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Merchant, items, date, payment method, total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DocumentIntelligence;