import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Package, Search, Plus, Minus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const StockActionDialog = ({ isOpen, onOpenChange, onSave, product, actionType, t }) => {
  const [quantity, setQuantity] = useState(1);

  const handleSave = () => {
    onSave(product.id, quantity, actionType);
  };

  useEffect(() => {
    if (isOpen) {
        setQuantity(1);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === 'add' ? t('stock_management.add_stock_title') : t('stock_management.record_sale_title')} - {product?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="quantity">{actionType === 'add' ? t('stock_management.quantity_added') : t('stock_management.quantity_sold')}</Label>
          <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('dialog_cancel')}</Button></DialogClose>
          <Button onClick={handleSave}>{t('dialog_save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const StockManagement = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockActionType, setStockActionType] = useState('add');
  
  const currency = useMemo(() => (profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'), [profile]);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('cost_calculator_products')
      .select('*')
      .eq('user_id', user.id)
      .not('stock', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('stock_management.load_error') });
    } else {
      setProducts(data);
    }
    setLoading(false);
  }, [user, toast, t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleStockUpdate = async (productId, quantity, type) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = type === 'add' ? product.stock + quantity : product.stock - quantity;

    if (newStock < 0) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: "Not enough stock." });
      return;
    }
    
    const { error } = await supabase.from('cost_calculator_products').update({ stock: newStock }).eq('id', productId);
    
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('stock_management.update_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('stock_management.update_success') });
      fetchProducts();
    }
    setIsStockDialogOpen(false);
    setSelectedProduct(null);
  };
  
  const getStatus = (stock) => {
    if (stock > 10) return { label: 'In Stock', variant: 'success' };
    if (stock > 0) return { label: 'Low Stock', variant: 'warning' };
    return { label: 'Out of Stock', variant: 'destructive' };
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('stock_management.title')}</h1>
        <p className="text-muted-foreground">{t('stock_management.subtitle')}</p>
      </motion.div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder={t('stock_management.search_placeholder')}
          className="pl-10"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('stock_management.table_product')}</TableHead>
                <TableHead>{t('stock_management.table_stock')}</TableHead>
                <TableHead>{t('stock_management.table_status')}</TableHead>
                <TableHead className="text-right">{t('stock_management.table_actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan="4" className="text-center h-24">{t('recurring_payments_loading')}</TableCell></TableRow>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map(product => {
                  const status = getStatus(product.stock);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => { setSelectedProduct(product); setStockActionType('add'); setIsStockDialogOpen(true); }}>
                          <Plus className="h-4 w-4 mr-1" /> {t('stock_management.add_stock')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedProduct(product); setStockActionType('sell'); setIsStockDialogOpen(true); }}>
                          <Minus className="h-4 w-4 mr-1" /> {t('stock_management.record_sale')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow><TableCell colSpan="4" className="text-center h-24">{t('stock_management.no_products')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
      
      {selectedProduct && <StockActionDialog isOpen={isStockDialogOpen} onOpenChange={setIsStockDialogOpen} onSave={handleStockUpdate} product={selectedProduct} actionType={stockActionType} t={t} />}
    </div>
  );
};

export default StockManagement;