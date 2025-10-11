import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const CreateClientDialog = ({ isOpen, onOpenChange, onClientCreated }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [newClient, setNewClient] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    tags: ['lead']
  });

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Le nom et l\'email sont obligatoires.' });
      return;
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({ ...newClient, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Le client n'a pas pu être ajouté." });
    } else {
      toast({ title: 'Succès', description: 'Client ajouté avec succès.' });
      onClientCreated(data);
      setNewClient({ name: '', company: '', email: '', phone: '', address: '', tags: ['lead'] });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau client</DialogTitle>
          <DialogDescription>Remplissez les informations ci-dessous.</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Entreprise</Label>
            <Input id="company" value={newClient.company} onChange={(e) => setNewClient({...newClient, company: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" value={newClient.address} onChange={(e) => setNewClient({...newClient, address: e.target.value})} />
          </div>
        </div>
        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleAddClient}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientDialog;