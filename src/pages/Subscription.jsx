import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Info, CheckCircle, BadgePercent, X } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Helmet } from 'react-helmet';

const freePlanFeatures = ["Facturation & Devis (limité, avec filigrane)", "CRM (jusqu'à 5 clients)", "Module Notes & Documents (2 max)", "Module Calendrier", "Support par email"];
const proPlanFeatures = ["Toutes les fonctionnalités du plan Free", "Clients illimités", "Facturation & Devis illimités", "Module Achat/Revente (Inventaire)", "Module Suivi des Dépenses", "Module Notes & Documents (20 max)", "Support prioritaire par email"];
const businessPlanFeatures = [...proPlanFeatures, "Module Suivi de Projets (Kanban)", "Module Gestion du Temps", "Module Rapport Financier", "Module Paiements Récurrents", "Module Relances Automatisées", "Module AI Business Strategist", "Module RH & Paie", "Module Automatisation de Workflow", "Module Notes & Documents (illimité)", "Accès API", "Support dédié (téléphone & visio)"];

const PlanDetailsDialog = ({ isOpen, onOpenChange, plan }) => {
  if (!plan) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails du plan {plan.name}</DialogTitle>
          <DialogDescription>
            Toutes les fonctionnalités incluses dans le plan {plan.name}.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 py-4 max-h-96 overflow-y-auto pr-4">
          {Array.isArray(plan.fullFeatures) && plan.fullFeatures.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <DialogClose asChild>
          <Button type="button" variant="secondary" className="absolute top-4 right-4 h-8 w-8 p-0">
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};


const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isPlanDetailsOpen, setIsPlanDetailsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  const currency = useMemo(() => profile?.currency || 'eur', [profile]);

  const getPrice = (plan, cycle, curr) => {
      if (plan.name === 'Free') return '0';
      const prices = {
          'Pro': {
              monthly: { eur: '8.99', usd: '9.99', chf: '8.99' },
              yearly: { eur: '89.99', usd: '99.99', chf: '89.99' }
          },
          'Business': {
              monthly: { eur: '24.99', usd: '29.99', chf: '24.99' },
              yearly: { eur: '239.99', usd: '289.99', chf: '239.99' }
          }
      };
      return prices[plan.name]?.[cycle]?.[curr] || 'N/A';
  };

  const currencySymbol = useMemo(() => {
    if (currency === 'usd') return '$';
    if (currency === 'chf') return 'CHF';
    return '€';
  }, [currency]);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('subscription_plan').select('*');
      if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les plans.' });
      } else {
        const formattedPlans = data.map(plan => {
            let fullFeatures = [];
            if (plan.name === 'Free') fullFeatures = freePlanFeatures;
            else if (plan.name === 'Pro') fullFeatures = proPlanFeatures;
            else if (plan.name === 'Business') fullFeatures = businessPlanFeatures;
            
            return {
                ...plan,
                paymentLinks: {
                    monthly: {
                        eur: plan.stripe_payment_link_eur,
                        usd: plan.stripe_payment_link_usd,
                        chf: plan.stripe_payment_link_chf,
                    },
                    yearly: {
                        eur: plan.stripe_payment_link_yearly_eur,
                        usd: plan.stripe_payment_link_yearly_usd,
                        chf: plan.stripe_payment_link_yearly_chf,
                    }
                },
                fullFeatures,
            }
        }).sort((a, b) => {
            const priceA = parseFloat(getPrice(a, 'monthly', 'eur'));
            const priceB = parseFloat(getPrice(b, 'monthly', 'eur'));
            return priceA - priceB;
        });
        setPlans(formattedPlans);
      }
      setLoading(false);
    };

    fetchPlans();
    
  }, [toast]);

  const handleSelectPlan = (plan) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté pour choisir un plan.' });
      return;
    }
    setIsProcessing(plan.name + billingCycle);

    const paymentLink = plan.paymentLinks[billingCycle]?.[currency];
    
    if (!paymentLink) {
      if (plan.name === 'Free') {
        toast({ title: 'Plan Gratuit Activé', description: 'Vous pouvez commencer à utiliser YourBizFlow !' });
        // Potentially navigate to dashboard or refresh profile
        setIsProcessing(null);
        return;
      }
      toast({ variant: 'destructive', title: 'Erreur de configuration', description: `Le lien de paiement pour cette sélection est manquant.` });
      setIsProcessing(null);
      return;
    }

    const url = new URL(paymentLink);
    url.searchParams.append('client_reference_id', user.id);
    if (user.email) {
      url.searchParams.append('prefilled_email', user.email);
    }
    
    window.location.href = url.toString();
  };

  const openPlanDetails = (plan) => {
    setSelectedPlan(plan);
    setIsPlanDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-t-primary border-secondary rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Helmet>
        <title>Choisissez votre abonnement - YourBizFlow</title>
        <meta name="description" content="Découvrez les plans d'abonnement de YourBizFlow. Choisissez le plan qui correspond le mieux à vos besoins et commencez à simplifier la gestion de votre entreprise." />
        <meta name="keywords" content="abonnement, tarif, prix, YourBizFlow, plan, SaaS" />
      </Helmet>
      <PlanDetailsDialog isOpen={isPlanDetailsOpen} onOpenChange={setIsPlanDetailsOpen} plan={selectedPlan} />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 w-full max-w-6xl px-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-4">Choisissez votre plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Commencez gratuitement, puis faites évoluer votre abonnement en fonction de vos besoins.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Label htmlFor="billing-cycle-sub" className={cn("text-muted-foreground", billingCycle === 'monthly' && 'text-foreground font-semibold')}>Mensuel</Label>
          <Switch id="billing-cycle-sub" checked={billingCycle === 'yearly'} onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')} />
          <Label htmlFor="billing-cycle-sub" className={cn("text-muted-foreground", billingCycle === 'yearly' && 'text-foreground font-semibold')}>Annuel</Label>
          <div className="bg-rose-500/20 text-rose-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
            <BadgePercent className="w-3 h-3" />
            -20%
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        {plans.map((plan, index) => {
          const price = getPrice(plan, billingCycle, currency);
          
          let features = [];
          if (plan.name === 'Free') features = freePlanFeatures;
          else if (plan.name === 'Pro') features = proPlanFeatures;
          else if (plan.name === 'Business') features = businessPlanFeatures;
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index, type: 'spring' }}
              className={cn("bg-card border rounded-2xl p-8 flex flex-col shadow-lg relative", plan.name === 'Business' && 'border-primary ring-2 ring-primary')}
            >
              {plan.name === 'Business' && (
                <div className="absolute -top-4 right-6 bg-primary text-primary-foreground text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                  Best-Seller
                </div>
              )}
              <h2 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h2>
              <div className="text-4xl font-extrabold text-foreground mb-6">
                {price}{currencySymbol}
                {plan.name !== 'Free' && <span className="text-lg font-medium text-muted-foreground">/{billingCycle === 'monthly' ? 'mois' : 'an'}</span>}
              </div>
              <ul className="space-y-3 mb-4 flex-grow">
                {features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-muted-foreground">{feature.split('(')[0]}</span>
                  </li>
                ))}
              </ul>
              <Button variant="link" size="sm" className="mb-4 text-primary" onClick={() => openPlanDetails(plan)}>
                <Info className="w-4 h-4 mr-2" />
                Voir toutes les fonctionnalités
              </Button>
              <Button
                onClick={() => handleSelectPlan(plan)}
                variant={plan.name === 'Business' ? 'default' : 'outline'}
                className="w-full py-3 text-base font-bold rounded-lg"
                disabled={isProcessing === (plan.name + billingCycle)}
              >
                {isProcessing === (plan.name + billingCycle) ? <Loader2 className="w-5 h-5 animate-spin" /> : (plan.name === 'Free' ? "Commencer maintenant" : "Choisir ce plan")}
              </Button>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
};

export default Subscription;
