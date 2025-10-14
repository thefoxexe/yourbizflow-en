import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/DatePicker';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const RevenueDialog = ({ isOpen, onOpenChange, onSave, revenue, t }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [revenueDate, setRevenueDate] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    if (revenue) {
      setDescription(revenue.description);
      setAmount(revenue.amount);
      setRevenueDate(new Date(revenue.revenue_date));
    } else {
      setDescription('');
      setAmount('');
      setRevenueDate(new Date());
    }
  }, [revenue, isOpen]);

  const handleSave = () => {
    if (!description || !amount || !revenueDate) {
      toast({ variant: 'destructive', title: t('toast_required_fields_title'), description: t('toast_required_fields_desc_revenue') });
      return;
    }
    onSave({ description, amount: parseFloat(amount), revenue_date: revenueDate });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{revenue ? t('revenues.edit_revenue_title') : t('revenues.add_revenue_title')}</DialogTitle></DialogHeader>
        <div className="py-4 space-y-4">
          <div><Label htmlFor="description">{t('revenues.source_label')}</Label><Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('revenues.source_placeholder')} /></div>
          <div><Label htmlFor="amount">{t('revenues.amount_label')}</Label><Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} /></div>
          <div><Label>{t('revenues.date_label')}</Label><DatePicker date={revenueDate} setDate={setRevenueDate} /></div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('dialog_cancel')}</Button></DialogClose>
          <Button onClick={handleSave}>{t('dialog_save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Revenues = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState(null);

  const currency = useMemo(() => (profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'), [profile]);

  const fetchRevenues = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('revenues').select('*').eq('user_id', user.id).order('revenue_date', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('revenues.load_error') });
    } else {
      setRevenues(data);
    }
    setLoading(false);
  }, [user, toast, t]);

  useEffect(() => {
    fetchRevenues();
  }, [fetchRevenues]);

  const handleSaveRevenue = async (revenueData) => {
    let error;
    if (editingRevenue) {
      ({ error } = await supabase.from('revenues').update(revenueData).eq('id', editingRevenue.id));
    } else {
      ({ error } = await supabase.from('revenues').insert({ ...revenueData, user_id: user.id }));
    }

    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('revenues.save_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('revenues.save_success') });
      setIsDialogOpen(false);
      setEditingRevenue(null);
      fetchRevenues();
    }
  };

  const handleDeleteRevenue = async (revenueId) => {
    const { error } = await supabase.from('revenues').delete().eq('id', revenueId);
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('revenues.delete_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('revenues.delete_success') });
      fetchRevenues();
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('revenues.title')}</h1>
          <p className="text-muted-foreground">{t('revenues.subtitle')}</p>
        </div>
        <Button onClick={() => { setEditingRevenue(null); setIsDialogOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> {t('revenues.new_revenue')}</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('revenues.date_label')}</TableHead>
                <TableHead>{t('revenues.source_label')}</TableHead>
                <TableHead className="text-right">{t('revenues.amount_label')}</TableHead>
                <TableHead className="text-right">{t('billing.table_actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan="4" className="text-center h-24">{t('recurring_payments_loading')}</TableCell></TableRow>
              ) : revenues.length > 0 ? (
                revenues.map(revenue => (
                  <TableRow key={revenue.id}>
                    <TableCell>{format(new Date(revenue.revenue_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-medium">{revenue.description}</TableCell>
                    <TableCell className="text-right">{revenue.amount.toFixed(2)}{currency}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingRevenue(revenue); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteRevenue(revenue.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan="4" className="text-center h-24">{t('revenues.no_revenues')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <RevenueDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleSaveRevenue} revenue={editingRevenue} t={t} />
    </div>
  );
};

export default Revenues;