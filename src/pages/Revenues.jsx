import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Plus, Edit, Trash2, MoreVertical, Loader2 } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/hooks/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { DatePicker } from '@/components/DatePicker';
    import { format } from 'date-fns';
    import { useTranslation } from 'react-i18next';
    import { cn } from '@/lib/utils';

    const Revenues = () => {
      const { t } = useTranslation();
      const { toast } = useToast();
      const { user, profile } = useAuth();
      const [revenues, setRevenues] = useState([]);
      const [loading, setLoading] = useState(true);
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [currentRevenue, setCurrentRevenue] = useState(null);

      const currencySymbol = useMemo(() => {
        const currency = profile?.currency || 'eur';
        if (currency === 'usd') return '$';
        if (currency === 'chf') return 'CHF';
        return '€';
      }, [profile]);

      const fetchRevenues = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
          .from('revenues')
          .select('*')
          .eq('user_id', user.id)
          .order('revenue_date', { ascending: false });

        if (error) {
          toast({ variant: 'destructive', title: t('revenues.load_error') });
        } else {
          setRevenues(data);
        }
        setLoading(false);
      }, [user, toast, t]);

      useEffect(() => {
        fetchRevenues();
      }, [fetchRevenues]);

      const handleOpenDialog = (revenue = null) => {
        setCurrentRevenue(revenue ? { ...revenue, revenue_date: new Date(revenue.revenue_date) } : { description: '', amount: '', revenue_date: new Date() });
        setIsDialogOpen(true);
      };

      const handleSave = async () => {
        if (!currentRevenue.description || !currentRevenue.amount || !currentRevenue.revenue_date) {
          toast({ variant: 'destructive', title: t('toast_required_fields_title'), description: t('toast_required_fields_desc_revenue') });
          return;
        }

        const revenueData = {
          user_id: user.id,
          description: currentRevenue.description,
          amount: parseFloat(currentRevenue.amount),
          revenue_date: format(currentRevenue.revenue_date, 'yyyy-MM-dd'),
        };

        let error;
        if (currentRevenue.id) {
          ({ error } = await supabase.from('revenues').update(revenueData).eq('id', currentRevenue.id));
        } else {
          ({ error } = await supabase.from('revenues').insert(revenueData));
        }

        if (error) {
          toast({ variant: 'destructive', title: t('revenues.save_error') });
        } else {
          toast({ title: t('revenues.save_success') });
          setIsDialogOpen(false);
          fetchRevenues();
        }
      };

      const handleDelete = async (revenueId) => {
        const { error } = await supabase.from('revenues').delete().eq('id', revenueId);
        if (error) {
          toast({ variant: 'destructive', title: t('revenues.delete_error') });
        } else {
          toast({ title: t('revenues.delete_success') });
          fetchRevenues();
        }
      };

      const getSourceTypeDisplay = (sourceType) => {
        if (!sourceType) return t('analytics.source_other');
        return t(`analytics.source_${sourceType}`, { defaultValue: sourceType });
      };

      return (
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t('revenues.title')}</h1>
              <p className="text-muted-foreground">{t('revenues.subtitle')}</p>
            </div>
            <Button onClick={() => handleOpenDialog()}><Plus className="w-4 h-4 mr-2" />{t('revenues.new_revenue')}</Button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-card/50 backdrop-blur-sm border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-4 text-left font-semibold text-muted-foreground">{t('revenues.source_label')}</th>
                      <th className="p-4 text-left font-semibold text-muted-foreground">{t('expenses.table_description')}</th>
                      <th className="p-4 text-left font-semibold text-muted-foreground">{t('revenues.amount_label')}</th>
                      <th className="p-4 text-left font-semibold text-muted-foreground">{t('revenues.date_label')}</th>
                      <th className="p-4 text-right font-semibold text-muted-foreground">{t('expenses.table_actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" className="text-center p-8"><Loader2 className="mx-auto animate-spin" /></td></tr>
                    ) : revenues.length > 0 ? revenues.map(revenue => (
                      <tr key={revenue.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5">
                        <td className="p-4"><span className={cn('px-2 py-1 rounded-full text-xs font-medium border', {
                          'bg-blue-500/10 text-blue-400 border-blue-500/20': revenue.source_type === 'invoice',
                          'bg-purple-500/10 text-purple-400 border-purple-500/20': revenue.source_type === 'subscription',
                          'bg-orange-500/10 text-orange-400 border-orange-500/20': revenue.source_type === 'order',
                          'bg-gray-500/10 text-gray-400 border-gray-500/20': !revenue.source_type,
                        })}>{getSourceTypeDisplay(revenue.source_type)}</span></td>
                        <td className="p-4 font-medium">{revenue.description}</td>
                        <td className="p-4 text-green-400 font-semibold">{revenue.amount.toFixed(2)}{currencySymbol}</td>
                        <td className="p-4 text-muted-foreground">{format(new Date(revenue.revenue_date), 'dd/MM/yyyy')}</td>
                        <td className="p-4 text-right">
                          <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(revenue)} disabled={!!revenue.source_id}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(revenue.id)} disabled={!!revenue.source_id} className="text-red-500 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="text-center p-8 text-muted-foreground">{t('revenues.no_revenues')}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {loading ? (
                <div className="text-center p-8"><Loader2 className="mx-auto animate-spin" /></div>
              ) : revenues.length > 0 ? revenues.map(revenue => (
                <div key={revenue.id} className="bg-card/50 backdrop-blur-sm border rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium border inline-block mb-2', {
                        'bg-blue-500/10 text-blue-400 border-blue-500/20': revenue.source_type === 'invoice',
                        'bg-purple-500/10 text-purple-400 border-purple-500/20': revenue.source_type === 'subscription',
                        'bg-orange-500/10 text-orange-400 border-orange-500/20': revenue.source_type === 'order',
                        'bg-gray-500/10 text-gray-400 border-gray-500/20': !revenue.source_type,
                      })}>{getSourceTypeDisplay(revenue.source_type)}</span>
                      <h3 className="font-semibold">{revenue.description}</h3>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(revenue)} disabled={!!revenue.source_id}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(revenue.id)} disabled={!!revenue.source_id} className="text-red-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-green-400 font-bold text-lg">{revenue.amount.toFixed(2)}{currencySymbol}</span>
                    <span className="text-sm text-muted-foreground">{format(new Date(revenue.revenue_date), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">{t('revenues.no_revenues')}</div>
              )}
            </div>
          </motion.div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{currentRevenue?.id ? t('revenues.edit_revenue_title') : t('revenues.add_revenue_title')}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="description">{t('revenues.source_label')}</Label>
                  <Input id="description" value={currentRevenue?.description || ''} onChange={(e) => setCurrentRevenue({ ...currentRevenue, description: e.target.value })} placeholder={t('revenues.source_placeholder')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">{t('revenues.amount_label')}</Label>
                  <Input id="amount" type="number" value={currentRevenue?.amount || ''} onChange={(e) => setCurrentRevenue({ ...currentRevenue, amount: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('revenues.date_label')}</Label>
                  <DatePicker date={currentRevenue?.revenue_date} setDate={(date) => setCurrentRevenue({ ...currentRevenue, revenue_date: date })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('dialog_cancel')}</Button>
                <Button onClick={handleSave}>{t('dialog_save')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    };

    export default Revenues;