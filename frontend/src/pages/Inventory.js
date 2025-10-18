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
import { Package, Plus, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const Inventory = ({ user, onLogout }) => {
  const [inventory, setInventory] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API}/inventory/items`, { headers: getAuthHeader() });
      setInventory(response.data);
    } catch (error) {
      toast.error('Failed to fetch inventory data');
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/inventory/items`, {
        ...formData,
        quantity: parseInt(formData.quantity),
        reorder_point: parseInt(formData.reorder_point),
        reorder_quantity: parseInt(formData.reorder_quantity)
      }, { headers: getAuthHeader() });
      toast.success('Inventory item added successfully!');
      setDialogOpen(false);
      setFormData({});
      fetchInventory();
    } catch (error) {
      toast.error('Failed to add inventory item');
    }
  };

  const handleForecast = async (productId) => {
    try {
      toast.info('AI is analyzing demand...');
      const response = await axios.post(`${API}/inventory/forecast`, { product_id: productId }, { headers: getAuthHeader() });
      toast.success(`Forecast: ${response.data.forecast_next_30_days} units in next 30 days`);
    } catch (error) {
      toast.error('Failed to generate forecast');
    }
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity <= item.reorder_point);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="inventory-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Inventory Management</h1>
            <p className="text-gray-600 text-lg mt-1">Monitor stock levels and optimize inventory</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" data-testid="add-inventory-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" data-testid="create-inventory-dialog">
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateItem} className="space-y-4">
                <div>
                  <Label>Product Name</Label>
                  <Input
                    value={formData.product_name || ''}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value, product_id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                    required
                    data-testid="product-name-input"
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    data-testid="quantity-input"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    data-testid="location-input"
                  />
                </div>
                <div>
                  <Label>Reorder Point</Label>
                  <Input
                    type="number"
                    value={formData.reorder_point || ''}
                    onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                    required
                    data-testid="reorder-point-input"
                  />
                </div>
                <div>
                  <Label>Reorder Quantity</Label>
                  <Input
                    type="number"
                    value={formData.reorder_quantity || ''}
                    onChange={(e) => setFormData({ ...formData, reorder_quantity: e.target.value })}
                    required
                    data-testid="reorder-quantity-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-inventory-button">
                  Add to Inventory
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {getLowStockItems().length > 0 && (
          <Card className="border-orange-200 bg-orange-50" data-testid="low-stock-alert">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-900">Low Stock Alert</h3>
                  <p className="text-sm text-orange-700">{getLowStockItems().length} items need restocking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="inventory-grid">
          {inventory.length > 0 ? (
            inventory.map((item) => (
              <Card key={item.id} className="card-hover" data-testid={`inventory-item-${item.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.product_name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{item.location}</p>
                    </div>
                    {item.quantity <= item.reorder_point ? (
                      <Badge variant="destructive">Low Stock</Badge>
                    ) : (
                      <Badge variant="outline">In Stock</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Current Stock</span>
                      <span className="text-2xl font-bold">{item.quantity}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          item.quantity <= item.reorder_point
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min((item.quantity / (item.reorder_point * 2)) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Reorder Point</p>
                      <p className="font-semibold">{item.reorder_point}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Reorder Qty</p>
                      <p className="font-semibold">{item.reorder_quantity}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleForecast(item.product_id)}
                    data-testid={`forecast-${item.id}`}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    AI Forecast
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No inventory items yet. Add your first item!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Inventory;