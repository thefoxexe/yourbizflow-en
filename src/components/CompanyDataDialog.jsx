import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const CompanyDataDialog = ({ isOpen, onOpenChange }) => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [companyData, setCompanyData] = useState({
    company_name: '',
    email: '',
    company_address: '',
    company_phone: '',
    company_logo_url: '',
    business_description: '',
    currency: 'eur',
    country: 'France',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setCompanyData({
        company_name: profile.company_name || '',
        email: profile.email || user.email || '',
        company_address: profile.company_address || '',
        company_phone: profile.company_phone || '',
        company_logo_url: profile.company_logo_url || '',
        business_description: profile.business_description || '',
        currency: profile.currency || 'eur',
        country: profile.country || 'France',
      });
    }
  }, [profile, user, isOpen]);

  const handleSaveCompanyData = async () => {
    if (!companyData.company_name || !companyData.email) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Le nom de l\'entreprise et l\'email sont obligatoires.' });
      return;
    }
    setIsUploading(true);

    let logoUrl = companyData.company_logo_url;

    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company_assets')
        .upload(filePath, logoFile);

      if (uploadError) {
        toast({ variant: 'destructive', title: 'Erreur d\'upload', description: "Le logo n'a pas pu être téléversé." });
        setIsUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('company_assets')
        .getPublicUrl(filePath);
      
      logoUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        company_name: companyData.company_name,
        company_address: companyData.company_address,
        company_phone: companyData.company_phone,
        company_logo_url: logoUrl,
        business_description: companyData.business_description,
        email: companyData.email,
        currency: companyData.currency,
        country: companyData.country,
      })
      .eq('id', user.id);

    setIsUploading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Les données n'ont pas pu être enregistrées." });
    } else {
      toast({ title: 'Succès', description: 'Données de l\'entreprise mises à jour.' });
      onOpenChange(false);
      setLogoFile(null);
      refreshProfile();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Données de l'entreprise</DialogTitle>
          <DialogDescription>Ces informations apparaîtront sur vos documents et aideront l'IA.</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-6 -mr-6 grid gap-4 py-4">
          <div className="space-y-2"><Label htmlFor="company_name">Nom de l'entreprise (requis)</Label><Input id="company_name" value={companyData.company_name} onChange={(e) => setCompanyData({...companyData, company_name: e.target.value})} /></div>
          <div className="space-y-2"><Label htmlFor="email">Email de contact (requis)</Label><Input id="email" type="email" value={companyData.email} onChange={(e) => setCompanyData({...companyData, email: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <select id="country" value={companyData.country} onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })} className="w-full h-10 border rounded-md px-3 bg-background text-foreground border-input">
                <option>France</option>
                <option>Suisse</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <select id="currency" value={companyData.currency} onChange={(e) => setCompanyData({ ...companyData, currency: e.target.value })} className="w-full h-10 border rounded-md px-3 bg-background text-foreground border-input">
                <option value="eur">EUR (€)</option>
                <option value="usd">USD ($)</option>
                <option value="chf">CHF (CHF)</option>
              </select>
            </div>
          </div>
          <div className="space-y-2"><Label htmlFor="company_address">Adresse</Label><Input id="company_address" value={companyData.company_address} onChange={(e) => setCompanyData({...companyData, company_address: e.target.value})} /></div>
          <div className="space-y-2"><Label htmlFor="company_phone">Téléphone</Label><Input id="company_phone" value={companyData.company_phone} onChange={(e) => setCompanyData({...companyData, company_phone: e.target.value})} /></div>
          <div className="space-y-2"><Label htmlFor="business_description">Description de l'activité</Label><Textarea id="business_description" placeholder="Ex: Vente de vêtements, conseil en marketing..." value={companyData.business_description} onChange={(e) => setCompanyData({...companyData, business_description: e.target.value})} /></div>
          <div className="space-y-2">
            <Label htmlFor="logo-upload">Logo</Label>
            <div className="flex items-center gap-4">
              {companyData.company_logo_url && !logoFile && (<img src={companyData.company_logo_url} alt="Logo" className="h-16 w-16 rounded-md object-cover" />)}
              <Input id="logo-upload" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="hidden" />
              <label htmlFor="logo-upload" className="cursor-pointer flex-grow flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-md hover:border-primary">
                <Upload className="w-4 h-4 mr-2" /><span>{logoFile ? logoFile.name : 'Choisir un fichier'}</span>
              </label>
            </div>
          </div>
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>Annuler</Button>
          <Button onClick={handleSaveCompanyData} disabled={isUploading}>
            {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</> : 'Sauvegarder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDataDialog;