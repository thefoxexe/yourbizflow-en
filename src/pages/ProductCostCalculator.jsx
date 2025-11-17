import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Package, DollarSign, Truck, Megaphone, Landmark, PlusCircle, Edit, Save, MoreVertical, Trash2, Loader2, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

const initialProductState = {
  name: '', sale_price: '', cost_of_goods: '', shipping_cost: '',
  marketing_cost: '', platform_fee_percent: '', other_fees: '',
};

const InputField = React.memo(({ name, label, icon, value, onChange, currencySymbol, isPercent = false }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-2 text-muted-foreground">{icon} {label}</Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder="0"
          className="pr-10"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {isPercent ? '%' : currencySymbol}
        </span>
      </div>
    </div>
));

const ProductForm = ({ product, onSave, onCancel, currencySymbol, t }) => {
  const [currentProduct, setCurrentProduct] = useState(product || initialProductState);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = useCallback((name, value) => {
    setCurrentProduct(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    const productToSave = { id: currentProduct.id };
    for (const key in initialProductState) {
        if (key === 'name') {
            productToSave[key] = currentProduct[key];
        } else if (currentProduct[key] === '' || currentProduct[key] === null) {
            productToSave[key] = 0;
        } else {
            productToSave[key] = parseFloat(String(currentProduct[key]).replace(',', '.')) || 0;
        }
    }
    
    await onSave(productToSave);
    setIsSaving(false);
  };

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>{product?.id ? t('product_cost_calculator.edit_product_title') : t('product_cost_calculator.new_product_title')}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2 text-muted-foreground"><Package className="w-4 h-4" /> {t('product_cost_calculator.product_name')}</Label>
          <Input id="name" value={currentProduct.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder={t('product_cost_calculator.product_name_placeholder')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField name="sale_price" label={t('product_cost_calculator.sale_price')} icon={<DollarSign className="w-4 h-4" />} value={currentProduct.sale_price} onChange={handleInputChange} currencySymbol={currencySymbol} />
          <InputField name="cost_of_goods" label={t('product_cost_calculator.cost_of_goods')} icon={<Package className="w-4 h-4" />} value={currentProduct.cost_of_goods} onChange={handleInputChange} currencySymbol={currencySymbol} />
          <InputField name="shipping_cost" label={t('product_cost_calculator.shipping_cost')} icon={<Truck className="w-4 h-4" />} value={currentProduct.shipping_cost} onChange={handleInputChange} currencySymbol={currencySymbol} />
          <InputField name="marketing_cost" label={t('product_cost_calculator.marketing_cost')} icon={<Megaphone className="w-4 h-4" />} value={currentProduct.marketing_cost} onChange={handleInputChange} currencySymbol={currencySymbol} />
          <InputField name="platform_fee_percent" label={t('product_cost_calculator.platform_fee')} icon={<Landmark className="w-4 h-4" />} value={currentProduct.platform_fee_percent} onChange={handleInputChange} currencySymbol={currencySymbol} isPercent />
          <InputField name="other_fees" label={t('product_cost_calculator.other_fees')} icon={<DollarSign className="w-4 h-4" />} value={currentProduct.other_fees} onChange={handleInputChange} currencySymbol={currencySymbol} />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline" onClick={onCancel} disabled={isSaving}>{t('page_billing_dialog_cancel')}</Button></DialogClose>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {t('ai_strategy_map.save_button')}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const ProductCostCalculator = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currencySymbol = useMemo(() => (profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'), [profile]);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('cost_calculator_products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: t('password_reset_error_title'), description: t('product_cost_calculator.load_error') });
    } else {
      setProducts(data.map(p => {
          const newP = { ...p };
          for(const key in newP) {
              if (typeof newP[key] === 'number' && key !== 'id' && key !== 'user_id') {
                  newP[key] = String(newP[key]).replace('.', ',');
              }
          }
          return newP;
      }));
    }
    setIsLoading(false);
  }, [user, toast, t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSaveProduct = async (productToSave) => {
    if (!productToSave.name.trim()) {
      toast({ variant: "destructive", title: t('product_cost_calculator.name_required') });
      return;
    }

    const productData = {
      ...productToSave,
      user_id: user.id,
    };

    let error;
    if (productToSave.id) {
      ({ error } = await supabase.from('cost_calculator_products').update(productData).eq('id', productToSave.id));
    } else {
      const { id, ...insertData } = productData;
      ({ error } = await supabase.from('cost_calculator_products').insert(insertData));
    }

    if (error) {
      toast({ variant: "destructive", title: t('password_reset_error_title'), description: t('product_cost_calculator.save_error') });
    } else {
      toast({ title: t('password_reset_success_title'), description: t(productToSave.id ? 'product_cost_calculator.update_success' : 'product_cost_calculator.create_success') });
      setIsFormOpen(false);
      setEditingProduct(null);
      fetchProducts();
    }
  };

  const handleOpenForm = (product = null) => {
    setEditingProduct(product ? {...product} : initialProductState);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    const { error } = await supabase.from('cost_calculator_products').delete().eq('id', id);
    if (error) {
      toast({ variant: "destructive", title: t('password_reset_error_title'), description: t('product_cost_calculator.delete_error') });
    } else {
      toast({ title: t('product_cost_calculator.delete_success') });
      fetchProducts();
    }
  };

  const calculateResults = useCallback((product) => {
    const parse = (v) => parseFloat(String(v || '0').replace(',', '.')) || 0;
    const salePrice = parse(product.sale_price);
    const platformFee = salePrice * (parse(product.platform_fee_percent) / 100);
    const totalCost = parse(product.cost_of_goods) + parse(product.shipping_cost) + parse(product.marketing_cost) + platformFee + parse(product.other_fees);
    const profit = salePrice - totalCost;
    const profitMargin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
    return { totalCost, profit, profitMargin };
  }, []);

  const formatCurrency = (value) => `${value.toFixed(2).replace('.', ',')} ${currencySymbol}`;
  const getProfitColor = (margin) => margin < 0 ? 'text-red-500' : margin < 15 ? 'text-yellow-500' : 'text-green-500';

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-2">
          <Wrench className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">{t('sidebar_module_product_management')}</h1>
        </div>
        <p className="text-muted-foreground">{t('product_cost_calculator.subtitle')}</p>
      </motion.div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('product_cost_calculator.catalog_title')}</CardTitle>
              <CardDescription>{t('product_cost_calculator.catalog_desc')}</CardDescription>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> {t('product_cost_calculator.new_product_button')}</Button>
              </DialogTrigger>
              {isFormOpen && <ProductForm product={editingProduct} onSave={handleSaveProduct} onCancel={() => setIsFormOpen(false)} currencySymbol={currencySymbol} t={t}/>}
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('product_cost_calculator.table_product')}</TableHead>
                <TableHead className="text-right">{t('product_cost_calculator.table_sale_price')}</TableHead>
                <TableHead className="text-right">{t('product_cost_calculator.table_total_cost')}</TableHead>
                <TableHead className="text-right">{t('product_cost_calculator.table_profit')}</TableHead>
                <TableHead className="text-right">{t('product_cost_calculator.table_margin')}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></TableCell></TableRow>
              ) : products.length > 0 ? products.map(product => {
                const { totalCost, profit, profitMargin } = calculateResults(product);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(parseFloat(String(product.sale_price || '0').replace(',', '.')))}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalCost)}</TableCell>
                    <TableCell className={`text-right font-bold ${getProfitColor(profitMargin)}`}>{formatCurrency(profit)}</TableCell>
                    <TableCell className={`text-right font-bold ${getProfitColor(profitMargin)}`}>{profitMargin.toFixed(1).replace('.', ',')}%</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleOpenForm(product)}><Edit className="mr-2 h-4 w-4" /> {t('product_cost_calculator.edit_button')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> {t('page_billing_action_delete')}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">{t('product_cost_calculator.no_products')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCostCalculator;