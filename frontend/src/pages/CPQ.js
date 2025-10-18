import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, FileText, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const CPQ = ({ user, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, quotesRes] = await Promise.all([
        axios.get(`${API}/cpq/products`, { headers: getAuthHeader() }),
        axios.get(`${API}/cpq/quotes`, { headers: getAuthHeader() })
      ]);
      setProducts(productsRes.data);
      setQuotes(quotesRes.data);
    } catch (error) {
      toast.error('Failed to fetch CPQ data');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/cpq/products`, {
        ...formData,
        base_price: parseFloat(formData.base_price),
        is_active: true
      }, { headers: getAuthHeader() });
      toast.success('Product created successfully!');
      setDialogOpen(false);
      setFormData({});
      fetchData();
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="cpq-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Configure, Price, Quote</h1>
            <p className="text-gray-600 text-lg mt-1">Manage products and generate intelligent quotes</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" data-testid="add-product-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" data-testid="create-product-dialog">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <Label>Product Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="product-name-input"
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    data-testid="product-sku-input"
                  />
                </div>
                <div>
                  <Label>Base Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.base_price || ''}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    required
                    data-testid="product-price-input"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    data-testid="product-category-input"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="product-description-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-product-button">
                  Create Product
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products" data-testid="products-tab">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="quotes" data-testid="quotes-tab">
              <FileText className="w-4 h-4 mr-2" />
              Quotes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="products-grid">
              {products.length > 0 ? (
                products.map((product) => (
                  <Card key={product.id} className="card-hover" data-testid={`product-${product.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{product.sku}</p>
                        </div>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-indigo-600">${product.base_price}</p>
                      {product.description && (
                        <p className="text-sm text-gray-600 mt-3">{product.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No products yet. Add your first product!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quotes" className="mt-6">
            <Card data-testid="quotes-list">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quotes ({quotes.length})</CardTitle>
                  <Button variant="outline" size="sm" data-testid="generate-quote-button">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {quotes.length > 0 ? (
                  <div className="space-y-4">
                    {quotes.map((quote) => (
                      <div key={quote.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow" data-testid={`quote-${quote.id}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{quote.customer_name}</h3>
                            <p className="text-2xl font-bold text-green-600 mt-1">${quote.total.toLocaleString()}</p>
                          </div>
                          <Badge variant={quote.status === 'approved' ? 'default' : 'secondary'}>
                            {quote.status}
                          </Badge>
                        </div>
                        <div className="mt-3 space-y-1 text-sm text-gray-600">
                          <p>Items: {quote.items.length}</p>
                          <p>Valid until: {new Date(quote.valid_until).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No quotes yet. Generate your first quote!</p>
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

export default CPQ;