import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const CreateClientDialog = ({ isOpen, onOpenChange, onClientCreated, client }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [currentClient, setCurrentClient] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    status: 'Prospect'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setCurrentClient({
        name: client.name || '',
        company: client.company || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        status: client.status || 'Prospect'
      });
    } else {
      setCurrentClient({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        status: 'Prospect'
      });
    }
  }, [client, isOpen]);

  const handleSave = async () => {
    if (!currentClient.name || !currentClient.email) {
      toast({ variant: 'destructive', title: t('toast_required_fields_title'), description: 'Le nom et l\'email sont obligatoires.' });
      return;
    }
    
    setIsSaving(true);
    let data, error;
    
    if (client?.id) {
        ({ data, error } = await supabase.from('clients').update(currentClient).eq('id', client.id).select().single());
    } else {
        ({ data, error } = await supabase.from('clients').insert({ ...currentClient, user_id: user.id }).select().single());
    }

    setIsSaving(false);

    if (error) {
        toast({ variant: 'destructive', title: t('toast_error_title'), description: client?.id ? t('crm.update_error') : t('crm.add_error') });
    } else {
        toast({ title: t('toast_success_title'), description: client?.id ? t('crm.update_success') : t('crm.add_success') });
        if (onClientCreated) {
            onClientCreated(data);
        }
        onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{client ? t('crm.dialog_edit_client_title') : t('crm.dialog_new_client_title')}</DialogTitle>
          <DialogDescription>{client ? t('crm.dialog_edit_client_desc') : t('crm.dialog_new_client_desc')}</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('crm.table_name')}</Label>
            <Input id="name" value={currentClient.name} onChange={(e) => setCurrentClient({...currentClient, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">{t('crm.table_company')}</Label>
            <Input id="company" value={currentClient.company} onChange={(e) => setCurrentClient({...currentClient, company: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('crm.table_email')}</Label>
            <Input id="email" type="email" value={currentClient.email} onChange={(e) => setCurrentClient({...currentClient, email: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t('crm.table_phone')}</Label>
            <Input id="phone" value={currentClient.phone} onChange={(e) => setCurrentClient({...currentClient, phone: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{t('billing.company_dialog_address')}</Label>
            <Input id="address" value={currentClient.address} onChange={(e) => setCurrentClient({...currentClient, address: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">{t('crm.table_status')}</Label>
            <Select value={currentClient.status} onValueChange={(value) => setCurrentClient({ ...currentClient, status: value })}>
                <SelectTrigger id="status">
                    <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Lead">{t('crm.status_lead')}</SelectItem>
                    <SelectItem value="Prospect">{t('crm.status_prospect')}</SelectItem>
                    <SelectItem value="Active">{t('crm.status_active')}</SelectItem>
                    <SelectItem value="Inactive">{t('crm.status_inactive')}</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>{t('dialog_cancel')}</Button>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? t('billing.saving') : t('dialog_save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientDialog;