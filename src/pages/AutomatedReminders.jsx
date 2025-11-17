import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { differenceInDays, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

const AutomatedReminders = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [riskyClients, setRiskyClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateRiskScore = (client, invoices) => {
    let score = 0;
    const clientInvoices = invoices.filter(inv => inv.client_id === client.id);
    const overdue = clientInvoices.filter(inv => inv.status === 'overdue');
    
    if (overdue.length > 0) score += overdue.length * 20;
    const totalOverdueAmount = overdue.reduce((sum, inv) => sum + inv.amount, 0);
    if (totalOverdueAmount > 1000) score += 30;
    if (totalOverdueAmount > 500) score += 15;

    const avgDelay = overdue.reduce((sum, inv) => sum + differenceInDays(new Date(), parseISO(inv.due_date)), 0) / overdue.length;
    if (avgDelay > 30) score += 20;
    if (avgDelay > 15) score += 10;

    return Math.min(100, score);
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];
    await supabase.from('invoices').update({ status: 'overdue' }).eq('user_id', user.id).eq('status', 'pending').lt('due_date', today);

    const [{ data: invoicesData, error: invoicesError }, { data: clientsData, error: clientsError }] = await Promise.all([
      supabase.from('invoices').select('*, client:clients(name)').eq('user_id', user.id).eq('status', 'overdue').order('due_date', { ascending: true }),
      supabase.from('clients').select('*').eq('user_id', user.id)
    ]);

    if (invoicesError || clientsError) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('automated_reminders.data_load_error') });
      setLoading(false);
      return;
    }

    setOverdueInvoices(invoicesData);

    const clientsWithScores = clientsData.map(client => ({
      ...client,
      risk_score: calculateRiskScore(client, invoicesData)
    })).filter(c => c.risk_score > 0).sort((a, b) => b.risk_score - a.risk_score);

    setRiskyClients(clientsWithScores);
    setLoading(false);
  }, [user, toast, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendReminder = (invoiceId) => {
    toast({
      title: t('automated_reminders.reminder_sent_toast'),
      description: t('automated_reminders.reminder_sent_toast_desc', { invoiceId }),
    });
  };

  const getRiskColor = (score) => {
    if (score > 75) return 'text-red-500';
    if (score > 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('automated_reminders.title')}</h1>
        <p className="text-muted-foreground">{t('automated_reminders.subtitle')}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }}initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" /> {t('automated_reminders.overdue_invoices_title')}</h2>
          <div className="border rounded-lg">
            {loading ? (
              <p className="p-4 text-center">{t('automated_reminders.loading')}</p>
            ) : overdueInvoices.length > 0 ? (
              <ul className="divide-y">
                {overdueInvoices.map(invoice => (
                  <li key={invoice.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Facture #{invoice.invoice_number} - {invoice.client.name}</p>
                      <p className="text-sm text-muted-foreground">En retard de {differenceInDays(new Date(), parseISO(invoice.due_date))} jours - {invoice.amount}€</p>
                    </div>
                    <Button size="sm" onClick={() => handleSendReminder(invoice.id)}><Send className="mr-2 h-4 w-4" />{t('automated_reminders.remind_button')}</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-center text-muted-foreground">{t('automated_reminders.no_overdue_invoices')}</p>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center"><Shield className="mr-2 h-5 w-5 text-red-500" /> {t('automated_reminders.at_risk_clients_title')}</h2>
          <div className="border rounded-lg">
            {loading ? (
              <p className="p-4 text-center">{t('automated_reminders.loading')}</p>
            ) : riskyClients.length > 0 ? (
              <ul className="divide-y">
                {riskyClients.map(client => (
                  <li key={client.id} className="p-4 flex justify-between items-center">
                    <p className="font-semibold">{client.name}</p>
                    <div className="flex items-center gap-2">
                      <p className={`font-bold ${getRiskColor(client.risk_score)}`}>{t('automated_reminders.risk_score')}: {client.risk_score.toFixed(0)}/100</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-center text-muted-foreground">{t('automated_reminders.no_at_risk_clients')}</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AutomatedReminders;