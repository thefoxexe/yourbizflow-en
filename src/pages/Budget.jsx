import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/DatePicker';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

const BudgetCard = ({ budget, onSelect, currency }) => {
  const { t } = useTranslation();
  const spent = budget.categories.reduce((acc, cat) => acc + (cat.spent || 0), 0);
  const amount = budget.amount || 0;
  const progress = amount > 0 ? (spent / amount) * 100 : 0;
  const remaining = amount - spent;

  const getProgressColor = (p) => {
    if (p > 90) return 'bg-red-500';
    if (p > 75) return 'bg-yellow-500';
    return 'bg-primary';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={() => onSelect(budget)}
      className="bg-card border rounded-lg p-4 cursor-pointer hover:border-primary transition-all group"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg">{budget.name}</h3>
        <p className="text-sm text-muted-foreground">{budget.start_date && budget.end_date ? `${format(parseISO(budget.start_date), 'dd/MM/yy')} - ${format(parseISO(budget.end_date), 'dd/MM/yy')}` : ''}</p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('budget.table_spent')}: {spent.toFixed(2)}{currency}</span>
          <span className="font-semibold">{t('budget.table_amount')}: {amount.toFixed(2)}{currency}</span>
        </div>
        <Progress value={progress} className="h-2" indicatorClassName={getProgressColor(progress)} />
        <p className="text-right text-sm text-muted-foreground">{t('budget.table_remaining')}: {remaining.toFixed(2)}{currency}</p>
      </div>
    </motion.div>
  );
};

const BudgetDetails = ({ budget, onClose, currency, onDelete, onUpdate }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const budgetAmount = budget.amount || 0;
  const totalAllocated = useMemo(() => budget.categories.reduce((acc, cat) => acc + (cat.allocated_amount || 0), 0), [budget.categories]);
  const unallocated = budgetAmount - totalAllocated;
  const totalSpent = budget.categories.reduce((acc, cat) => acc + (cat.spent || 0), 0);

  const handleAddCategory = async () => {
    if (!newCategoryName || !newCategoryAmount) return;
    setIsAddingCategory(true);
    const { data, error } = await supabase.from('budget_categories').insert({
      budget_id: budget.id,
      name: newCategoryName,
      allocated_amount: parseFloat(newCategoryAmount),
      user_id: budget.user_id,
    }).select().single();

    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('budget.category_create_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('budget.category_create_success') });
      onUpdate({ ...budget, categories: [...budget.categories, { ...data, spent: 0 }] });
      setNewCategoryName('');
      setNewCategoryAmount('');
    }
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = async (categoryId) => {
    const { error } = await supabase.from('budget_categories').delete().eq('id', categoryId);
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('budget.category_delete_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('budget.category_delete_success') });
      onUpdate({ ...budget, categories: budget.categories.filter(c => c.id !== categoryId) });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('budget.budget_details_title')}: {budget.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <Card>
            <CardHeader><CardTitle>{t('budget.budget_overview')}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p><strong>{t('budget.table_amount')}:</strong> {budgetAmount.toFixed(2)}{currency}</p>
              <p><strong>{t('budget.total_allocated')}:</strong> {totalAllocated.toFixed(2)}{currency}</p>
              <p><strong>{t('budget.table_spent')}:</strong> {totalSpent.toFixed(2)}{currency}</p>
              <p className={unallocated < 0 ? 'text-red-500' : 'text-green-500'}>
                <strong>{t('budget.total_unallocated')}:</strong> {unallocated.toFixed(2)}{currency}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t('budget.categories')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {budget.categories.length > 0 ? budget.categories.map(category => {
                const categoryAllocated = category.allocated_amount || 0;
                const categorySpent = category.spent || 0;
                return (
                <div key={category.id} className="p-3 bg-secondary rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{category.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${categoryAllocated > 0 ? (categorySpent / categoryAllocated) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{t('budget.table_spent')}: {categorySpent.toFixed(2)}{currency}</span>
                    <span>{t('budget.table_amount')}: {categoryAllocated.toFixed(2)}{currency}</span>
                  </div>
                </div>
              )}) : <p className="text-muted-foreground text-center">{t('budget.no_categories')}</p>}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">{t('budget.add_category')}</h4>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <Input placeholder={t('budget.category_name_placeholder')} value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="flex-grow" />
                  <Input type="number" placeholder={t('budget.allocated_amount_label')} value={newCategoryAmount} onChange={e => setNewCategoryAmount(e.target.value)} className="w-full sm:w-32" />
                  <Button onClick={handleAddCategory} disabled={isAddingCategory} className="w-full sm:w-auto">
                    {isAddingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : t('budget.add_category_button')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('dialog_cancel')}</Button></DialogClose>
          <Button variant="destructive" onClick={() => onDelete(budget.id)}>{t('quotes.action_delete')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Budget = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [newBudgetStart, setNewBudgetStart] = useState(null);
  const [newBudgetEnd, setNewBudgetEnd] = useState(null);

  const currency = useMemo(() => (profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'), [profile]);

  const fetchBudgets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.rpc('get_budgets_with_categories_and_spent');
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('budget.load_error') });
    } else {
      setBudgets(data);
    }
    setLoading(false);
  }, [user, toast, t]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleCreateBudget = async () => {
    if (!newBudgetName || !newBudgetAmount || !newBudgetStart || !newBudgetEnd) {
      toast({ variant: 'destructive', title: t('toast_required_fields_title'), description: t('toast_required_fields_desc_budget') });
      return;
    }
    const { error } = await supabase.from('budgets').insert({
      user_id: user.id,
      name: newBudgetName,
      amount: parseFloat(newBudgetAmount),
      start_date: newBudgetName,
      end_date: newBudgetEnd,
    });
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('budget.create_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('budget.create_success') });
      setIsCreateDialogOpen(false);
      setNewBudgetName('');
      setNewBudgetAmount('');
      setNewBudgetStart(null);
      setNewBudgetEnd(null);
      fetchBudgets();
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    const { error } = await supabase.from('budgets').delete().eq('id', budgetId);
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('budget.delete_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('budget.delete_success') });
      setSelectedBudget(null);
      fetchBudgets();
    }
  };

  const handleUpdateBudget = (updatedBudget) => {
    setBudgets(budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b));
    setSelectedBudget(updatedBudget);
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('budget.title')}</h1>
          <p className="text-muted-foreground">{t('budget.subtitle')}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> {t('budget.new_budget')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('budget.new_budget_title')}</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4">
              <div><Label htmlFor="name">{t('budget.budget_name_label')}</Label><Input id="name" value={newBudgetName} onChange={e => setNewBudgetName(e.target.value)} placeholder={t('budget.budget_name_placeholder')} /></div>
              <div><Label htmlFor="amount">{t('budget.total_amount_label')}</Label><Input id="amount" type="number" value={newBudgetAmount} onChange={e => setNewBudgetAmount(e.target.value)} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>{t('budget.start_date_label')}</Label><DatePicker date={newBudgetStart} setDate={setNewBudgetStart} /></div>
                <div><Label>{t('budget.end_date_label')}</Label><DatePicker date={newBudgetEnd} setDate={setNewBudgetEnd} /></div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">{t('dialog_cancel')}</Button></DialogClose>
              <Button onClick={handleCreateBudget}>{t('budget.create_budget_button')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {loading ? (
        <div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map(budget => <BudgetCard key={budget.id} budget={budget} onSelect={setSelectedBudget} currency={currency} />)}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">{t('budget.no_budgets')}</p>
        </div>
      )}

      {selectedBudget && (
        <BudgetDetails
          budget={selectedBudget}
          onClose={() => setSelectedBudget(null)}
          currency={currency}
          onDelete={handleDeleteBudget}
          onUpdate={handleUpdateBudget}
        />
      )}
    </div>
  );
};

export default Budget;