import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Package, PlusCircle, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const ProductDialog = ({ isOpen, onOpenChange, onSave, product, t }) => {
  const [name, setName] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSalePrice(product.sale_price || '');
      setCostPrice(product.cost_of_goods || '');
      setStock(product.stock === null || product.stock === undefined ? '' : product.stock);
    } else {
      setName(''); setSalePrice(''); setCostPrice(''); setStock('');
    }
  }, [product, isOpen]);

  const handleSave = () => {
    onSave({ 
        name, 
        sale_price: parseFloat(salePrice) || 0, 
        cost_of_goods: parseFloat(costPrice) || 0,
        stock: stock === '' ? null : parseInt(stock, 10)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{product ? t('product_management.dialog_edit_title') : t('product_management.dialog_new_title')}</DialogTitle></DialogHeader>
        <div className="py-4 grid grid-cols-2 gap-4">
          <div className="col-span-2"><Label htmlFor="name">{t('product_management.dialog_name')}</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label htmlFor="salePrice">{t('product_management.dialog_sale_price')}</Label><Input id="salePrice" type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} /></div>
          <div><Label htmlFor="costPrice">{t('product_management.dialog_cost_price')}</Label><Input id="costPrice" type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} /></div>
          <div className="col-span-2"><Label htmlFor="stock">{t('product_management.dialog_stock')}</Label><Input id="stock" type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="Leave blank for no tracking" /></div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('dialog_cancel')}</Button></DialogClose>
          <Button onClick={handleSave}>{t('dialog_save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const ProductManagement = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const currency = useMemo(() => (profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'), [profile]);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('cost_calculator_products').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('product_management.load_error') });
    } else {
      setProducts(data);
    }
    setLoading(false);
  }, [user, toast, t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSaveProduct = async (productData) => {
    let error;
    if (editingProduct) {
      ({ error } = await supabase.from('cost_calculator_products').update(productData).eq('id', editingProduct.id));
    } else {
      ({ error } = await supabase.from('cost_calculator_products').insert({ ...productData, user_id: user.id }));
    }

    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: 'Could not save product.' });
    } else {
      toast({ title: t('toast_success_title'), description: 'Product saved.' });
      setIsDialogOpen(false);
      setEditingProduct(null);
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (productId) => {
    const { error } = await supabase.from('cost_calculator_products').delete().eq('id', productId);
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('product_management.delete_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('product_management.delete_success') });
      fetchProducts();
    }
  };

  const calculateMargin = (salePrice, costPrice) => {
    if (!salePrice || salePrice === 0) return 'N/A';
    const margin = ((salePrice - (costPrice || 0)) / salePrice) * 100;
    return `${margin.toFixed(1)}%`;
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('product_management.title')}</h1>
          <p className="text-muted-foreground">{t('product_management.subtitle')}</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setIsDialogOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> {t('product_management.new_product')}</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {/* Desktop Table View */}
        <div className="hidden md:block border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('product_management.table_product')}</TableHead>
                <TableHead>{t('product_management.table_price')}</TableHead>
                <TableHead>{t('product_management.table_cost')}</TableHead>
                <TableHead>{t('product_management.table_margin')}</TableHead>
                <TableHead>{t('product_management.table_stock')}</TableHead>
                <TableHead className="text-right">{t('product_management.table_actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan="6" className="text-center h-24">{t('recurring_payments_loading')}</TableCell></TableRow>
              ) : products.length > 0 ? (
                products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sale_price?.toFixed(2)}{currency}</TableCell>
                    <TableCell>{product.cost_of_goods?.toFixed(2)}{currency}</TableCell>
                    <TableCell>{calculateMargin(product.sale_price, product.cost_of_goods)}</TableCell>
                    <TableCell>{product.stock === null || product.stock === undefined ? 'N/A' : product.stock}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" /> {t('recurring_payments_edit')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> {t('recurring_payments_delete')}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan="6" className="text-center h-24">{t('product_management.no_products')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="text-center p-8"><Loader2 className="mx-auto animate-spin" /></div>
          ) : products.length > 0 ? products.map(product => (
            <div key={product.id} className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><span className="text-muted-foreground">{t('product_management.table_price')}:</span> <span className="font-semibold">{product.sale_price?.toFixed(2)}{currency}</span></p>
                    <p className="text-sm"><span className="text-muted-foreground">{t('product_management.table_cost')}:</span> <span className="font-semibold">{product.cost_of_goods?.toFixed(2)}{currency}</span></p>
                    <p className="text-sm"><span className="text-muted-foreground">{t('product_management.table_margin')}:</span> <span className="font-semibold">{calculateMargin(product.sale_price, product.cost_of_goods)}</span></p>
                    <p className="text-sm"><span className="text-muted-foreground">{t('product_management.table_stock')}:</span> <span className="font-semibold">{product.stock === null || product.stock === undefined ? 'N/A' : product.stock}</span></p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" /> {t('recurring_payments_edit')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> {t('recurring_payments_delete')}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )) : (
            <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">{t('product_management.no_products')}</div>
          )}
        </div>
      </motion.div>

      <ProductDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleSaveProduct} product={editingProduct} t={t}/>
    </div>
  );
};

export default ProductManagement;