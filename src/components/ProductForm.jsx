import React, { useState, useCallback } from 'react';
import { Package, DollarSign, Truck, Megaphone, Landmark, Save, Loader2, Warehouse } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

export const initialProductState = {
  name: '', sale_price: '', cost_of_goods: '', shipping_cost: '',
  marketing_cost: '', platform_fee_percent: '', other_fees: '', stock: '',
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

const ProductForm = ({ product, onSave, onCancel, currencySymbol, isOpen, onOpenChange }) => {
  const [currentProduct, setCurrentProduct] = useState(product || initialProductState);
  const [isInfinite, setIsInfinite] = useState(product?.stock === null);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const initial = product || initialProductState;
      setCurrentProduct(initial);
      setIsInfinite(initial.stock === null);
    }
  }, [isOpen, product]);

  const handleInputChange = useCallback((name, value) => {
    setCurrentProduct(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    const productToSave = { id: currentProduct.id };
    for (const key in initialProductState) {
        if (key === 'name') {
            productToSave[key] = currentProduct[key];
        } else if (key === 'stock') {
            productToSave[key] = isInfinite ? null : (parseInt(String(currentProduct[key]).replace(',', '.')) || 0);
        } else if (currentProduct[key] === '' || currentProduct[key] === null) {
            productToSave[key] = 0;
        } else {
            productToSave[key] = parseFloat(String(currentProduct[key]).replace(',', '.')) || 0;
        }
    }
    
    await onSave(productToSave);
    setIsSaving(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{product?.id ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-y-auto px-6 -mx-6">
          <div className="px-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-muted-foreground"><Package className="w-4 h-4" /> Nom du produit</Label>
                <Input id="name" value={currentProduct.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Ex: T-shirt premium" />
              </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6">
            <InputField name="sale_price" label="Prix de vente" icon={<DollarSign className="w-4 h-4" />} value={currentProduct.sale_price} onChange={handleInputChange} currencySymbol={currencySymbol} />
            <InputField name="cost_of_goods" label="Coût du produit" icon={<Package className="w-4 h-4" />} value={currentProduct.cost_of_goods} onChange={handleInputChange} currencySymbol={currencySymbol} />
            <InputField name="shipping_cost" label="Frais de livraison" icon={<Truck className="w-4 h-4" />} value={currentProduct.shipping_cost} onChange={handleInputChange} currencySymbol={currencySymbol} />
            <InputField name="marketing_cost" label="Frais marketing" icon={<Megaphone className="w-4 h-4" />} value={currentProduct.marketing_cost} onChange={handleInputChange} currencySymbol={currencySymbol} />
            <InputField name="platform_fee_percent" label="Frais de plateforme" icon={<Landmark className="w-4 h-4" />} value={currentProduct.platform_fee_percent} onChange={handleInputChange} currencySymbol={currencySymbol} isPercent />
            <InputField name="other_fees" label="Autres frais" icon={<DollarSign className="w-4 h-4" />} value={currentProduct.other_fees} onChange={handleInputChange} currencySymbol={currencySymbol} />
          </div>
          <div className="border-t pt-4 mt-2 space-y-4 px-6">
             <Label className="flex items-center gap-2 text-muted-foreground"><Warehouse className="w-4 h-4" /> Gestion du Stock</Label>
             <div className="flex items-center space-x-2">
                <Switch id="infinite-stock" checked={isInfinite} onCheckedChange={setIsInfinite} />
                <Label htmlFor="infinite-stock">Stock infini</Label>
              </div>
              {!isInfinite && (
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock initial</Label>
                  <Input id="stock" name="stock" type="number" value={currentProduct.stock || ''} onChange={(e) => handleInputChange('stock', e.target.value)} placeholder="0" />
                </div>
              )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" onClick={onCancel} disabled={isSaving}>Annuler</Button></DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;