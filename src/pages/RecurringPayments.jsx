
    import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, MoreVertical, Edit, Trash2, UserPlus, MinusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DatePicker } from '@/components/DatePicker';
import { format } from 'date-fns';

const RecurringPayments = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState(null);

  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [newPlan, setNewPlan] = useState({ name: '', price: '', interval: 'month' });

  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [newSubscription, setNewSubscription] = useState({ client_id: '', subscription_product_id: '', start_date: new Date() });

  const currencySymbol = useMemo(() => {
    const currency = profile?.currency || 'eur';
    if (currency === 'usd') return '$';
    if (currency === 'chf') return 'CHF';
    return '€';
  }, [profile]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [plansRes, subsRes, clientsRes] = await Promise.all([
      supabase.from('subscription_products').select('*').eq('user_id', user.id),
      supabase.from('customer_subscriptions').select('*, client:clients(name), plan:subscription_product_id(name, price, interval)').eq('user_id', user.id),
      supabase.from('clients').select('id, name').eq('user_id', user.id)
    ]);

    if (plansRes.error || subsRes.error || clientsRes.error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les données.' });
    } else {
      setPlans(plansRes.data);
      setSubscriptions(subsRes.data);
      setClients(clientsRes.data);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const planSubscriberCounts = useMemo(() => {
    const counts = {};
    plans.forEach(plan => {
      counts[plan.id] = subscriptions.filter(sub => sub.subscription_product_id === plan.id && sub.status === 'active').length;
    });
    return counts;
  }, [plans, subscriptions]);

  const handleSavePlan = async () => {
    if (!newPlan.name || !newPlan.price) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Le nom et le prix sont obligatoires.' });
      return;
    }
    const planData = { ...newPlan, user_id: user.id, price: Number(newPlan.price) };
    const { error } = currentPlan
      ? await supabase.from('subscription_products').update(planData).eq('id', currentPlan.id)
      : await supabase.from('subscription_products').insert(planData);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Le plan n'a pas pu être sauvegardé." });
    } else {
      toast({ title: 'Succès', description: `Plan ${currentPlan ? 'mis à jour' : 'créé'}.` });
      setIsPlanDialogOpen(false);
      fetchData();
    }
  };

  const handleDeletePlan = async (planId) => {
    const { error } = await supabase.from('subscription_products').delete().eq('id', planId);
    if (error) toast({ variant: 'destructive', title: 'Erreur', description: "Le plan n'a pas pu être supprimé." });
    else {
      toast({ title: 'Succès', description: 'Plan supprimé.' });
      fetchData();
    }
  };

  const handleSaveSubscription = async () => {
    if (!newSubscription.client_id || !newSubscription.subscription_product_id || !newSubscription.start_date) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Tous les champs sont obligatoires.' });
      return;
    }
    const subData = {
      ...newSubscription,
      user_id: user.id,
      status: 'active',
      start_date: format(newSubscription.start_date, 'yyyy-MM-dd'),
    };
    const { error } = await supabase.from('customer_subscriptions').insert(subData);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "L'abonné n'a pas pu être ajouté." });
    } else {
      toast({ title: 'Succès', description: 'Abonné ajouté.' });
      setIsSubDialogOpen(false);
      fetchData();
    }
  };
  
  const handleQuickAddSubscriber = async (planId) => {
    setProcessingPlanId(planId);
    const subData = {
      subscription_product_id: planId,
      user_id: user.id,
      status: 'active',
      start_date: format(new Date(), 'yyyy-MM-dd'),
    };
    const { error } = await supabase.from('customer_subscriptions').insert(subData);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "L'abonné n'a pas pu être ajouté." });
    } else {
      toast({ title: 'Succès', description: 'Abonné anonyme ajouté.' });
      await fetchData();
    }
    setProcessingPlanId(null);
  };
  
  const handleQuickRemoveSubscriber = async (planId) => {
    setProcessingPlanId(planId);
    const subToDelete = subscriptions.find(s => s.subscription_product_id === planId && s.client_id === null && s.status === 'active');
    if (!subToDelete) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Aucun abonné anonyme à supprimer pour ce plan.' });
      setProcessingPlanId(null);
      return;
    }
    
    const { error } = await supabase.from('customer_subscriptions').delete().eq('id', subToDelete.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "L'abonné n'a pas pu être supprimé." });
    } else {
      toast({ title: 'Succès', description: 'Abonné anonyme supprimé.' });
      await fetchData();
    }
    setProcessingPlanId(null);
  };


  const handleCancelSubscription = async (subId) => {
    const { error } = await supabase.from('customer_subscriptions').update({ status: 'canceled', canceled_at: new Date().toISOString() }).eq('id', subId);
    if (error) toast({ variant: 'destructive', title: 'Erreur', description: "L'abonnement n'a pas pu être annulé." });
    else {
      toast({ title: 'Succès', description: 'Abonnement annulé.' });
      fetchData();
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Paiements Récurrents</h1>
          <p className="text-muted-foreground">Gérez vos abonnements et vos revenus récurrents.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-foreground">Vos Plans d'Abonnement</h2>
            <Button onClick={() => { setCurrentPlan(null); setNewPlan({ name: '', price: '', interval: 'month' }); setIsPlanDialogOpen(true); }} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Nouveau Plan
            </Button>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-4 space-y-3">
            {loading ? <p>Chargement...</p> : plans.map(plan => (
              <div key={plan.id} className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">{plan.price}{currencySymbol} / {plan.interval === 'month' ? 'mois' : 'an'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleQuickRemoveSubscriber(plan.id)} disabled={processingPlanId === plan.id || planSubscriberCounts[plan.id] === 0}>
                    {processingPlanId === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MinusCircle className="w-4 h-4" />}
                  </Button>
                  <span className="font-bold text-lg w-8 text-center">{planSubscriberCounts[plan.id] || 0}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleQuickAddSubscriber(plan.id)} disabled={processingPlanId === plan.id}>
                    {processingPlanId === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setCurrentPlan(plan); setNewPlan(plan); setIsPlanDialogOpen(true); }}><Edit className="w-4 h-4 mr-2" /> Modifier</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeletePlan(plan.id)} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" /> Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-foreground">Abonnés (Clients)</h2>
            <Button onClick={() => { setNewSubscription({ client_id: '', subscription_product_id: '', start_date: new Date() }); setIsSubDialogOpen(true); }} className="w-full sm:w-auto">
              <UserPlus className="w-4 h-4 mr-2" /> Assigner à un client
            </Button>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-4 space-y-3">
            {loading ? <p>Chargement...</p> : subscriptions.filter(s => s.status === 'active' && s.client_id).map(sub => (
              <div key={sub.id} className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                <div>
                  <p className="font-semibold">{sub.client?.name || 'Client supprimé'}</p>
                  <p className="text-sm text-muted-foreground">{sub.plan?.name || 'Plan supprimé'} - {new Date(sub.start_date).toLocaleDateString('fr-FR')}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleCancelSubscription(sub.id)}>Annuler</Button>
              </div>
            ))}
             {subscriptions.filter(s => s.status === 'active' && s.client_id).length === 0 && !loading && (
              <p className="text-center text-muted-foreground py-4">Aucun abonné assigné à un client.</p>
            )}
          </div>
        </motion.div>
      </div>

      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle>{currentPlan ? 'Modifier le plan' : 'Nouveau plan'}</DialogTitle></DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-4 py-4">
            <div className="space-y-2"><Label htmlFor="name">Nom</Label><Input id="name" value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="price">Prix ({currencySymbol})</Label><Input id="price" type="number" value={newPlan.price} onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="interval">Intervalle</Label><select id="interval" value={newPlan.interval} onChange={(e) => setNewPlan({ ...newPlan, interval: e.target.value })} className="w-full mt-1 border rounded-md p-2 bg-background text-foreground"><option value="month">Mensuel</option><option value="year">Annuel</option></select></div>
          </div>
          <DialogFooter className="flex-shrink-0"><Button variant="outline" onClick={() => setIsPlanDialogOpen(false)}>Annuler</Button><Button onClick={handleSavePlan}>Sauvegarder</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle>Assigner un abonnement</DialogTitle></DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-4 py-4">
            <div className="space-y-2"><Label htmlFor="client">Client</Label><select id="client" value={newSubscription.client_id} onChange={(e) => setNewSubscription({ ...newSubscription, client_id: e.target.value })} className="w-full mt-1 border rounded-md p-2 bg-background text-foreground"><option value="">Choisir...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="plan">Plan</Label><select id="plan" value={newSubscription.subscription_product_id} onChange={(e) => setNewSubscription({ ...newSubscription, subscription_product_id: e.target.value })} className="w-full mt-1 border rounded-md p-2 bg-background text-foreground"><option value="">Choisir...</option>{plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="start_date">Date de début</Label><DatePicker date={newSubscription.start_date} setDate={(date) => setNewSubscription({ ...newSubscription, start_date: date })} /></div>
          </div>
          <DialogFooter className="flex-shrink-0"><Button variant="outline" onClick={() => setIsSubDialogOpen(false)}>Annuler</Button><Button onClick={handleSaveSubscription}>Ajouter</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecurringPayments;
  