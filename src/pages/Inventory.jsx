import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Package, PlusCircle, Search, MoreVertical, Edit, Trash2, DollarSign, ImagePlus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/DatePicker';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const ItemDialog = ({ isOpen, onOpenChange, onSave, item, t }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setSku(item.sku || '');
      setQuantity(item.quantity || 1);
      setPurchasePrice(item.purchase_price || '');
      setSalePrice(item.sale_price || '');
      setPhotos(item.photos || []);
    } else {
      setName(''); setSku(''); setQuantity(1); setPurchasePrice(''); setSalePrice(''); setPhotos([]);
    }
  }, [item, isOpen]);

  const handleSave = () => {
    onSave({ name, sku, quantity: parseInt(quantity), purchase_price: parseFloat(purchasePrice), sale_price: parseFloat(salePrice), photos });
  };

  const handlePhotoUpload = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      let { error: uploadError } = await supabase.storage.from('inventory_photos').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('inventory_photos').getPublicUrl(filePath);
      setPhotos(prev => [...prev, data.publicUrl]);
      toast({ title: t('inventory.upload_success') });
    } catch (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{item ? t('inventory.edit_item_title') : t('inventory.add_item_title')}</DialogTitle></DialogHeader>
        <div className="py-4 grid grid-cols-2 gap-4">
          <div className="col-span-2"><Label htmlFor="name">{t('inventory.table_item')}</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder={t('inventory.item_name_placeholder')} /></div>
          <div><Label htmlFor="sku">{t('inventory.table_sku')}</Label><Input id="sku" value={sku} onChange={e => setSku(e.target.value)} placeholder={t('inventory.sku_placeholder')} /></div>
          <div><Label htmlFor="quantity">{t('inventory.table_quantity')}</Label><Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} /></div>
          <div><Label htmlFor="purchasePrice">{t('inventory.table_purchase_price')}</Label><Input id="purchasePrice" type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} /></div>
          <div><Label htmlFor="salePrice">{t('inventory.table_sale_price')}</Label><Input id="salePrice" type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} /></div>
          <div className="col-span-2">
            <Label>{t('inventory.photos')}</Label>
            <div className="flex items-center gap-2 mt-2">
              {photos.map(p => <img key={p} src={p} alt="item" className="w-16 h-16 object-cover rounded" />)}
              <label htmlFor="photo-upload" className="cursor-pointer w-16 h-16 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground hover:bg-secondary">
                {uploading ? '...' : <ImagePlus />}
              </label>
              <Input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} className="hidden" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('page_billing_dialog_cancel')}</Button></DialogClose>
          <Button onClick={handleSave}>{t('ai_strategy_map.save_button')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SellDialog = ({ isOpen, onOpenChange, onSell, item, t }) => {
    const [salePrice, setSalePrice] = useState('');
    const [sellDate, setSellDate] = useState(new Date());
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (item) {
            setSalePrice(item.sale_price || '');
        }
    }, [item]);

    const handleSell = () => {
        onSell({ sale_price: parseFloat(salePrice), sold_at: sellDate, quantity: parseInt(quantity) });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>{t('inventory.sell_item_title')}: {item?.name}</DialogTitle></DialogHeader>
                <div className="py-4 space-y-4">
                    <div><Label htmlFor="salePrice">{t('inventory.table_sale_price')}</Label><Input id="salePrice" type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} /></div>
                    <div><Label>{t('inventory.sell_date_label')}</Label><DatePicker date={sellDate} setDate={setSellDate} /></div>
                    <div><Label htmlFor="quantity">{t('inventory.quantity_to_sell_label')}</Label><Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} max={item?.quantity} min="1" /></div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">{t('page_billing_dialog_cancel')}</Button></DialogClose>
                    <Button onClick={handleSell}>{t('inventory.confirm_sale')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const Inventory = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [sellingItem, setSellingItem] = useState(null);

  const currency = useMemo(() => (profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'), [profile]);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('inventory_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('inventory.load_error') });
    } else {
      setItems(data);
    }
    setLoading(false);
  }, [user, toast, t]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSaveItem = async (itemData) => {
    let error;
    if (editingItem) {
      ({ error } = await supabase.from('inventory_items').update(itemData).eq('id', editingItem.id));
    } else {
      ({ error } = await supabase.from('inventory_items').insert({ ...itemData, user_id: user.id, status: 'in_stock' }));
    }

    if (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('inventory.save_error') });
    } else {
      toast({ title: t('password_reset_success_title'), description: t('inventory.save_success') });
      setIsItemDialogOpen(false);
      setEditingItem(null);
      fetchItems();
    }
  };

  const handleDeleteItem = async (itemId) => {
    const { error } = await supabase.from('inventory_items').delete().eq('id', itemId);
    if (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('inventory.delete_error') });
    } else {
      toast({ title: t('password_reset_success_title'), description: t('inventory.delete_success') });
      fetchItems();
    }
  };

  const handleSellItem = async ({ sale_price, sold_at, quantity }) => {
    if (!sellingItem) return;
    const newQuantity = sellingItem.quantity - quantity;
    const newStatus = newQuantity <= 0 ? 'sold' : (newQuantity < 5 ? 'low_stock' : 'in_stock');
    
    const { error } = await supabase.from('inventory_items').update({ quantity: newQuantity, status: newStatus, sale_price, sold_at }).eq('id', sellingItem.id);
    
    if (error) {
        toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('inventory.sell_error') });
    } else {
        await supabase.from('revenues').insert({ user_id: user.id, amount: sale_price * quantity, description: `Sale of ${sellingItem.name}`, revenue_date: sold_at, source_type: 'inventory_item', source_id: sellingItem.id });
        await supabase.from('expenses').insert({ user_id: user.id, amount: sellingItem.purchase_price * quantity, description: `Cost of goods for ${sellingItem.name}`, expense_date: sold_at, category: 'cogs', source_type: 'inventory_item', source_id: sellingItem.id });
        toast({ title: t('password_reset_success_title'), description: t('inventory.sell_success') });
        setIsSellDialogOpen(false);
        setSellingItem(null);
        fetchItems();
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const statusVariant = {
    [t('inventory.status_in_stock')]: 'default',
    [t('inventory.status_low_stock')]: 'warning',
    [t('inventory.status_out_of_stock')]: 'destructive',
    [t('inventory.status_sold')]: 'outline',
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('inventory.title')}</h1>
          <p className="text-muted-foreground">{t('inventory.subtitle')}</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setIsItemDialogOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> {t('inventory.new_item')}</Button>
      </motion.div>

      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder={t('inventory.search_placeholder')} className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('inventory.table_item')}</TableHead>
                <TableHead>{t('inventory.table_sku')}</TableHead>
                <TableHead>{t('inventory.table_quantity')}</TableHead>
                <TableHead>{t('inventory.table_purchase_price')}</TableHead>
                <TableHead>{t('inventory.table_sale_price')}</TableHead>
                <TableHead>{t('inventory.table_status')}</TableHead>
                <TableHead className="text-right">{t('crm.table_actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan="7" className="text-center h-24">Loading...</TableCell></TableRow>
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.purchase_price}{currency}</TableCell>
                    <TableCell>{item.sale_price}{currency}</TableCell>
                    <TableCell><Badge variant={statusVariant[item.status] || 'default'}>{t(`inventory.status_${item.status.toLowerCase().replace(' ', '_')}`)}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => { setSellingItem(item); setIsSellDialogOpen(true); }} disabled={item.quantity <= 0}><DollarSign className="mr-2 h-4 w-4" /> {t('inventory.sell_item')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditingItem(item); setIsItemDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" /> {t('crm.edit_client')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteItem(item.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> {t('page_billing_action_delete')}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan="7" className="text-center h-24">{t('inventory.no_items')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <ItemDialog isOpen={isItemDialogOpen} onOpenChange={setIsItemDialogOpen} onSave={handleSaveItem} item={editingItem} t={t} />
      <SellDialog isOpen={isSellDialogOpen} onOpenChange={setIsSellDialogOpen} onSell={handleSellItem} item={sellingItem} t={t} />
    </div>
  );
};

export default Inventory;