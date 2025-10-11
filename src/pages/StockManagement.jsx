import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, PlusCircle, Save, Warehouse, Infinity as InfinityIcon, AlertTriangle, MinusCircle, MoreVertical } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ProductForm, { initialProductState } from '@/components/ProductForm';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const StockManagement = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [stockQuantity, setStockQuantity] = useState('');
  const [isInfinite, setIsInfinite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [processingProductId, setProcessingProductId] = useState(null);

  const currencySymbol = useMemo(() => (profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'), [profile]);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('cost_calculator_products')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les produits." });
    } else {
      setProducts(data);
    }
    setIsLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenStockDialog = (product) => {
    setCurrentProduct(product);
    setIsInfinite(product.stock === null);
    setStockQuantity(product.stock === null ? '' : product.stock);
    setIsStockDialogOpen(true);
  };

  const handleSaveStock = async () => {
    if (!currentProduct) return;
    setIsSaving(true);
    const newStock = isInfinite ? null : parseInt(stockQuantity, 10);

    if (!isInfinite && (isNaN(newStock) || newStock < 0)) {
      toast({ variant: "destructive", title: "Erreur", description: "La quantité en stock doit être un nombre positif." });
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from('cost_calculator_products')
      .update({ stock: newStock })
      .eq('id', currentProduct.id);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour le stock." });
    } else {
      toast({ title: "Succès", description: "Stock mis à jour." });
      setIsStockDialogOpen(false);
      fetchProducts();
    }
    setIsSaving(false);
  };
  
  const handleSaleTransaction = async (product, isReversal = false) => {
    setProcessingProductId(product.id);
  
    if (isReversal) {
      // Annulation de vente
      const { error: deleteError } = await supabase
        .from('revenues')
        .delete()
        .match({ source_type: 'product_sale', source_id: product.id });
  
      const { error: deleteExpenseError } = await supabase
        .from('expenses')
        .delete()
        .match({ source_type: 'product_sale_cost', source_id: product.id });
  
      if (deleteError || deleteExpenseError) {
        toast({ variant: 'destructive', title: 'Erreur d\'annulation', description: 'Impossible de supprimer les transactions précédentes.' });
        setProcessingProductId(null);
        return;
      }
  
      if (product.stock !== null) {
        const newStock = (product.stock || 0) + 1;
        const { error: stockError } = await supabase
          .from('cost_calculator_products')
          .update({ stock: newStock })
          .eq('id', product.id);
        
        if (stockError) {
           toast({ variant: 'destructive', title: 'Erreur de stock', description: 'La mise à jour du stock a échoué.' });
        }
      }
  
      toast({ title: 'Vente annulée !', description: `${product.name} a été réintégré au stock.` });
  
    } else {
      // Nouvelle vente
      if (product.stock !== null && product.stock <= 0) {
        toast({ variant: 'destructive', title: 'Stock épuisé', description: `L'article "${product.name}" n'est plus en stock.` });
        setProcessingProductId(null);
        return;
      }
  
      const parse = (v) => parseFloat(String(v || '0').replace(',', '.')) || 0;
      const salePrice = parse(product.sale_price);
      const platformFee = salePrice * (parse(product.platform_fee_percent) / 100);
      const totalCost = parse(product.cost_of_goods) + parse(product.shipping_cost) + parse(product.marketing_cost) + platformFee + parse(product.other_fees);
  
      const transactionDate = new Date().toISOString();
  
      const [revenueResult, expenseResult] = await Promise.all([
          supabase.from('revenues').insert({
              user_id: user.id,
              amount: salePrice,
              description: `Vente de ${product.name}`,
              revenue_date: transactionDate,
              source_type: 'product_sale',
              source_id: product.id
          }),
          supabase.from('expenses').insert({
              user_id: user.id,
              amount: totalCost,
              category: 'Coût des marchandises vendues',
              description: `Coût pour vente de ${product.name}`,
              expense_date: transactionDate,
              source_type: 'product_sale_cost',
              source_id: product.id
          })
      ]);
  
      if (revenueResult.error || expenseResult.error) {
          toast({ variant: 'destructive', title: 'Erreur comptable', description: 'La transaction n\'a pas pu être enregistrée correctement.' });
          setProcessingProductId(null);
          return;
      }
  
      if (product.stock !== null) {
        const newStock = product.stock - 1;
        const { error: stockError } = await supabase
          .from('cost_calculator_products')
          .update({ stock: newStock })
          .eq('id', product.id);
        
        if (stockError) {
           toast({ variant: 'destructive', title: 'Erreur de stock', description: 'La mise à jour du stock a échoué.' });
        }
      }
      
      toast({ title: 'Vente enregistrée !', description: `${product.name} a été vendu.` });
    }
  
    await fetchProducts();
    setProcessingProductId(null);
  };


  const handleSaveProduct = async (productToSave) => {
    if (!productToSave.name.trim()) {
      toast({ variant: "destructive", title: "Nom de produit requis" });
      return;
    }

    const productData = { ...productToSave, user_id: user.id };
    const { error } = await supabase.from('cost_calculator_products').insert(productData);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Le produit n'a pas pu être créé." });
    } else {
      toast({ title: "Succès", description: `Produit créé.` });
      setIsProductFormOpen(false);
      fetchProducts();
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-2">
          <Warehouse className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Gestion de Stock</h1>
        </div>
        <p className="text-muted-foreground">Suivez vos niveaux de stock et enregistrez les ventes en un clic.</p>
      </motion.div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>État des Stocks</CardTitle>
              <CardDescription>Vue d'ensemble de tous vos produits et de leur disponibilité.</CardDescription>
            </div>
            <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Créer un produit</Button>
              </DialogTrigger>
              <ProductForm
                product={initialProductState}
                onSave={handleSaveProduct}
                onCancel={() => setIsProductFormOpen(false)}
                currencySymbol={currencySymbol}
                isOpen={isProductFormOpen}
                onOpenChange={setIsProductFormOpen}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-center">Stock Actuel</TableHead>
                  <TableHead className="text-center">Mettre à jour le stock</TableHead>
                  <TableHead className="text-right">Action Rapide</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></TableCell></TableRow>
                ) : products.length > 0 ? products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-center">
                      {product.stock === null ? (
                        <span className="inline-flex items-center font-semibold text-green-400"><InfinityIcon className="w-4 h-4 mr-2" /> Infini</span>
                      ) : (
                        <span className={`font-bold ${product.stock < 10 ? 'text-red-500' : 'text-foreground'}`}>
                          {product.stock < 10 && <AlertTriangle className="inline w-4 h-4 mr-2" />}
                          {product.stock} unités
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" onClick={() => handleOpenStockDialog(product)}>Gérer le stock</Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaleTransaction(product, true)}
                          disabled={processingProductId === product.id}
                        >
                          {processingProductId === product.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MinusCircle className="mr-2 h-4 w-4" />}
                          Annuler
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaleTransaction(product, false)}
                          disabled={processingProductId === product.id || (product.stock !== null && product.stock <= 0)}
                        >
                          {processingProductId === product.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                          Vendre
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                      Aucun produit trouvé. Cliquez sur "Créer un produit" pour commencer.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="sm:hidden space-y-4">
            {isLoading ? (
              <div className="text-center p-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>
            ) : products.length > 0 ? products.map(product => (
              <Card key={product.id} className="bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>
                    {product.stock === null ? (
                      <span className="inline-flex items-center font-semibold text-green-400"><InfinityIcon className="w-4 h-4 mr-2" /> Stock Infini</span>
                    ) : (
                      <span className={`font-bold ${product.stock < 10 ? 'text-red-500' : 'text-foreground'}`}>
                        {product.stock < 10 && <AlertTriangle className="inline w-4 h-4 mr-2" />}
                        {product.stock} unités restantes
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full" onClick={() => handleOpenStockDialog(product)}>Gérer le stock</Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSaleTransaction(product, true)}
                      disabled={processingProductId === product.id}
                    >
                      {processingProductId === product.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MinusCircle className="mr-2 h-4 w-4" />}
                      Annuler
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => handleSaleTransaction(product, false)}
                      disabled={processingProductId === product.id || (product.stock !== null && product.stock <= 0)}
                    >
                      {processingProductId === product.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                      Vendre
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center py-12 text-muted-foreground">Aucun produit.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gérer le stock de "{currentProduct?.name}"</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="infinite-stock" checked={isInfinite} onCheckedChange={setIsInfinite} />
              <Label htmlFor="infinite-stock">Stock infini</Label>
            </div>
            {!isInfinite && (
              <div className="space-y-2">
                <Label htmlFor="stock-quantity">Quantité en stock</Label>
                <Input
                  id="stock-quantity"
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="Ex: 150"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveStock} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockManagement;