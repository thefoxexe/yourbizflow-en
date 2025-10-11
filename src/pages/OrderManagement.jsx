
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, ShoppingCart, Loader2, MoreVertical, Edit, Trash2, Search, Filter, UserPlus, PackagePlus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet';
import CreateClientDialog from '@/components/CreateClientDialog';
import ProductForm, { initialProductState } from '@/components/ProductForm';

const OrderManagement = () => {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const currencySymbol = useMemo(() => (profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'), [profile]);
    const orderStatuses = useMemo(() => profile?.order_statuses || [], [profile]);

    const fetchInitialData = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const [ordersRes, clientsRes, productsRes] = await Promise.all([
            supabase.from('orders').select('*, clients (name)').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('clients').select('id, name').eq('user_id', user.id),
            supabase.from('cost_calculator_products').select('id, name, sale_price, cost_of_goods, shipping_cost, marketing_cost, platform_fee_percent, other_fees, stock').eq('user_id', user.id)
        ]);

        if (ordersRes.error) toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les commandes.' });
        else setOrders(ordersRes.data);

        if (clientsRes.error) toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les clients.' });
        else setClients(clientsRes.data);

        if (productsRes.error) toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les produits.' });
        else setProducts(productsRes.data);

        setLoading(false);
    }, [user, toast]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleOpenOrderDialog = (order = null) => {
        if (order) {
            setEditingOrder(order);
            setCurrentOrder({ ...order });
        } else {
            setEditingOrder(null);
            setCurrentOrder({
                client_id: '',
                products: [{ product_id: '', quantity: 1, price: 0 }],
                status: orderStatuses[0]?.id || 'en_preparation',
                notes: ''
            });
        }
        setIsOrderDialogOpen(true);
    };

    const handleSaveOrder = async () => {
        if (!currentOrder.client_id || currentOrder.products.some(p => !p.product_id)) {
            toast({ variant: 'destructive', title: 'Champs requis', description: 'Veuillez sélectionner un client et des produits.' });
            return;
        }

        const total_amount = currentOrder.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const order_reference = `CMD-${Date.now().toString().slice(-6)}`;
        
        const payload = {
            ...currentOrder,
            user_id: user.id,
            total_amount,
            order_reference: editingOrder ? currentOrder.order_reference : order_reference,
            products: currentOrder.products.map(({product_id, quantity, price, name}) => ({product_id, quantity, price, name}))
        };

        let error;
        if (editingOrder) {
            ({ error } = await supabase.from('orders').update(payload).eq('id', editingOrder.id));
        } else {
            ({ error } = await supabase.from('orders').insert(payload));
        }

        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: "La commande n'a pas pu être sauvegardée." });
        } else {
            toast({ title: 'Succès!', description: `Commande ${editingOrder ? 'mise à jour' : 'créée'}.` });
            setIsOrderDialogOpen(false);
            fetchInitialData();
        }
    };
    
    const restoreStock = async (order) => {
        for (const item of order.products) {
            const product = products.find(p => p.id === item.product_id);
            if (!product || product.stock === null) continue;

            const { data: currentProduct, error } = await supabase
                .from('cost_calculator_products')
                .select('stock')
                .eq('id', product.id)
                .single();

            if (error) continue;

            const newStock = (currentProduct.stock || 0) + item.quantity;
            await supabase.from('cost_calculator_products').update({ stock: newStock }).eq('id', product.id);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        // DB trigger 'handle_order_delete' will handle restoring stock and deleting financials.
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        
        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la commande.' });
        } else {
            toast({ title: 'Commande supprimée', description: 'Le stock et les finances ont été mis à jour.' });
            fetchInitialData();
        }
    };

    const processStockAndFinance = async (order) => {
        const transactionDate = new Date().toISOString();
        for (const item of order.products) {
            const product = products.find(p => p.id === item.product_id);
            if (!product) continue;

            const quantity = item.quantity;

            if (product.stock !== null) {
                const { data: currentProduct, error } = await supabase
                    .from('cost_calculator_products')
                    .select('stock')
                    .eq('id', product.id)
                    .single();

                if (error) continue;
                
                const newStock = (currentProduct.stock || 0) - quantity;
                await supabase.from('cost_calculator_products').update({ stock: newStock }).eq('id', product.id);
            }

            const parse = (v) => parseFloat(String(v || '0').replace(',', '.')) || 0;
            const salePrice = parse(item.price);
            const platformFee = salePrice * (parse(product.platform_fee_percent) / 100);
            const totalCost = parse(product.cost_of_goods) + parse(product.shipping_cost) + parse(product.marketing_cost) + platformFee + parse(product.other_fees);

            await supabase.from('revenues').insert({
                user_id: user.id, amount: salePrice * quantity, description: `Vente de ${quantity} x ${product.name} (Commande ${order.order_reference})`, revenue_date: transactionDate, source_type: 'order', source_id: order.id
            });
            await supabase.from('expenses').insert({
                user_id: user.id, amount: totalCost * quantity, category: 'Coût des marchandises vendues', description: `Coût pour vente de ${quantity} x ${product.name} (Commande ${order.order_reference})`, expense_date: transactionDate, source_type: 'order_cost', source_id: order.id
            });
        }
        await supabase.from('orders').update({ stock_processed: true }).eq('id', order.id);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le statut.' });
            return;
        }
        
        toast({ title: 'Statut mis à jour' });

        const shouldProcessStock = (newStatus === 'expedie' || newStatus === 'livree') && !order.stock_processed;
        const shouldRestoreStock = newStatus === 'annulee' && order.stock_processed;

        if (shouldProcessStock) {
            await processStockAndFinance({ ...order, status: newStatus });
            toast({ title: 'Comptabilité & Stock mis à jour!' });
        } else if (shouldRestoreStock) {
            // The handle_order_delete trigger only fires ON DELETE, so we do it manually here for 'annulee' status.
            await restoreStock(order);
            await supabase.from('revenues').delete().match({ source_type: 'order', source_id: order.id });
            await supabase.from('expenses').delete().match({ source_type: 'order_cost', source_id: order.id });
            await supabase.from('orders').update({ stock_processed: false }).eq('id', order.id);
            toast({ title: 'Stock et finances restaurés!' });
        }
        
        fetchInitialData();
    };
    
    const handleProductChange = (index, productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        const updatedProducts = [...currentOrder.products];
        updatedProducts[index] = {
            ...updatedProducts[index],
            product_id: productId,
            price: parseFloat(String(product.sale_price).replace(',', '.')) || 0,
            name: product.name
        };
        setCurrentOrder(prev => ({ ...prev, products: updatedProducts }));
    };

    const handleQuantityChange = (index, quantity) => {
        const updatedProducts = [...currentOrder.products];
        updatedProducts[index].quantity = parseInt(quantity, 10) || 1;
        setCurrentOrder(prev => ({ ...prev, products: updatedProducts }));
    };

    const addProductLine = () => {
        setCurrentOrder(prev => ({
            ...prev,
            products: [...prev.products, { product_id: '', quantity: 1, price: 0 }]
        }));
    };

    const removeProductLine = (index) => {
        const updatedProducts = currentOrder.products.filter((_, i) => i !== index);
        setCurrentOrder(prev => ({ ...prev, products: updatedProducts }));
    };
    
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const clientName = order.clients?.name || '';
            const searchMatch = order.order_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                clientName.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter === 'all' || order.status === statusFilter;
            return searchMatch && statusMatch;
        });
    }, [orders, searchTerm, statusFilter]);

    const handleClientCreated = (newClient) => {
        setClients(prev => [newClient, ...prev]);
        setCurrentOrder(prev => ({ ...prev, client_id: newClient.id }));
        setIsClientDialogOpen(false);
    };

    const handleProductCreated = async (newProductData) => {
        const { data, error } = await supabase.from('cost_calculator_products').insert({ ...newProductData, user_id: user.id }).select().single();
        if (error) {
            toast({ variant: "destructive", title: "Erreur", description: "Le produit n'a pas pu être créé." });
        } else {
            toast({ title: "Succès", description: `Produit créé.` });
            setProducts(prev => [data, ...prev]);
            setIsProductDialogOpen(false);
        }
    };

    return (
        <div className="space-y-8">
            <Helmet>
                <title>Gestion des Commandes - YourBizFlow</title>
                <meta name="description" content="Gérez le cycle de traitement de vos commandes clients, de la préparation à la livraison." />
            </Helmet>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des Commandes</h1>
                    <p className="text-muted-foreground">Suivez vos commandes de la préparation à la livraison.</p>
                </div>
                <Button onClick={() => handleOpenOrderDialog()}>
                    <PlusCircle className="w-4 h-4 mr-2" /> Nouvelle Commande
                </Button>
            </motion.div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des commandes</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input placeholder="Rechercher par réf. ou client..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                {orderStatuses.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="hidden sm:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Référence</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></TableCell></TableRow>
                                ) : filteredOrders.length > 0 ? filteredOrders.map(order => {
                                    const statusInfo = orderStatuses.find(s => s.id === order.status);
                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.order_reference}</TableCell>
                                            <TableCell>{order.clients?.name || 'Client supprimé'}</TableCell>
                                            <TableCell>{format(new Date(order.created_at), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>
                                                <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', statusInfo?.color)}>
                                                    {statusInfo?.label || order.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">{order.total_amount.toFixed(2)} {currencySymbol}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => handleOpenOrderDialog(order)}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>Changer statut</DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent>
                                                                {orderStatuses.map(s => <DropdownMenuItem key={s.id} onClick={() => handleUpdateStatus(order.id, s.id)}>{s.label}</DropdownMenuItem>)}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                        <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                }) : <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Aucune commande trouvée.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="sm:hidden space-y-4">
                        {loading ? <div className="text-center p-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>
                         : filteredOrders.length > 0 ? filteredOrders.map(order => {
                            const statusInfo = orderStatuses.find(s => s.id === order.status);
                            return (
                                <Card key={order.id} className="bg-card/50">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{order.order_reference}</CardTitle>
                                                <CardDescription>{order.clients?.name || 'Client supprimé'}</CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="-mt-2 -mr-2"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleOpenOrderDialog(order)}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>Changer statut</DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            {orderStatuses.map(s => <DropdownMenuItem key={s.id} onClick={() => handleUpdateStatus(order.id, s.id)}>{s.label}</DropdownMenuItem>)}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">{format(new Date(order.created_at), 'dd MMM yyyy')}</span>
                                            <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', statusInfo?.color)}>{statusInfo?.label || order.status}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Total</span>
                                            <span className="font-bold text-lg">{order.total_amount.toFixed(2)} {currencySymbol}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                         }) : <div className="text-center py-12 text-muted-foreground">Aucune commande.</div>}
                    </div>
                </CardContent>
            </Card>

            {isOrderDialogOpen && currentOrder && (
                <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                    <DialogContent className="w-full max-w-md sm:max-w-xl md:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingOrder ? 'Modifier la commande' : 'Nouvelle commande'}</DialogTitle>
                            <DialogDescription>{editingOrder ? `Réf: ${editingOrder.order_reference}` : 'Renseignez les détails de la commande.'}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-3 -mr-3">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="client">Client</Label>
                                    <div className="flex gap-2">
                                        <Select value={currentOrder.client_id} onValueChange={value => setCurrentOrder(prev => ({ ...prev, client_id: value }))}>
                                            <SelectTrigger className="flex-1"><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                                            <SelectContent>
                                                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" size="icon" onClick={() => setIsClientDialogOpen(true)}><UserPlus className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="status">Statut</Label>
                                    <Select value={currentOrder.status} onValueChange={value => setCurrentOrder(prev => ({ ...prev, status: value }))}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner un statut" /></SelectTrigger>
                                        <SelectContent>
                                            {orderStatuses.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div>
                                <Label>Produits</Label>
                                <div className="space-y-3 mt-2">
                                {currentOrder.products.map((item, index) => (
                                    <div key={index} className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_80px_100px_auto] items-center gap-2">
                                        <Select value={item.product_id} onValueChange={value => handleProductChange(index, value)}>
                                            <SelectTrigger><SelectValue placeholder="Produit" /></SelectTrigger>
                                            <SelectContent>
                                                {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" value={item.quantity} onChange={e => handleQuantityChange(index, e.target.value)} placeholder="Qté" className="w-20" />
                                        <Input value={`${item.price.toFixed(2)}`} readOnly className="bg-secondary text-center w-24" />
                                        <Button variant="ghost" size="icon" onClick={() => removeProductLine(index)} className="hidden sm:inline-flex"><Trash2 className="w-4 h-4 text-red-500"/></Button>
                                    </div>
                                ))}
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <Button variant="outline" size="sm" onClick={addProductLine}>Ajouter un produit</Button>
                                    <Button variant="outline" size="sm" onClick={() => setIsProductDialogOpen(true)}><PackagePlus className="w-4 h-4 mr-2" />Créer un produit</Button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes internes</Label>
                                <Textarea id="notes" value={currentOrder.notes || ''} onChange={e => setCurrentOrder(prev => ({ ...prev, notes: e.target.value }))} />
                            </div>

                             <div className="mt-4 text-right">
                                <p className="text-lg font-bold">Total: {currentOrder.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)} {currencySymbol}</p>
                            </div>

                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>Annuler</Button>
                            <Button onClick={handleSaveOrder}>Sauvegarder</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
            <CreateClientDialog isOpen={isClientDialogOpen} onOpenChange={setIsClientDialogOpen} onClientCreated={handleClientCreated} />
            <ProductForm 
                product={initialProductState}
                onSave={handleProductCreated}
                onCancel={() => setIsProductDialogOpen(false)}
                currencySymbol={currencySymbol}
                isOpen={isProductDialogOpen}
                onOpenChange={setIsProductDialogOpen}
            />
        </div>
    );
};

export default OrderManagement;
