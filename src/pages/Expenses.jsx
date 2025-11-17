import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { PlusCircle, Trash2, Edit, Repeat } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';

const ExpenseDialog = ({ isOpen, onOpenChange, onSave, expense, t }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount);
      setCategory(expense.category || '');
      setExpenseDate(new Date(expense.expense_date));
    } else {
      setDescription('');
      setAmount('');
      setCategory('');
      setExpenseDate(new Date());
    }
  }, [expense, isOpen]);

  const handleSave = () => {
    if (!description || !amount || !expenseDate) {
      toast({ variant: 'destructive', title: t('toast_required_fields_title') });
      return;
    }
    onSave({ description, amount: parseFloat(amount), category, expense_date: expenseDate });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{expense ? t('expenses.edit_expense_title') : t('expenses.add_expense_title')}</DialogTitle></DialogHeader>
        <div className="py-4 space-y-4">
          <div><Label htmlFor="description">{t('expenses.table_description')}</Label><Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('expenses.description_placeholder')} /></div>
          <div><Label htmlFor="amount">{t('expenses.table_amount')}</Label><Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} /></div>
          <div>
            <Label>{t('expenses.table_category')}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder={t('expenses.select_category')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="software">{t('expenses.category_software')}</SelectItem>
                <SelectItem value="marketing">{t('expenses.category_marketing')}</SelectItem>
                <SelectItem value="supplies">{t('expenses.category_supplies')}</SelectItem>
                <SelectItem value="travel">{t('expenses.category_travel')}</SelectItem>
                <SelectItem value="other">{t('expenses.category_other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>{t('expenses.table_date')}</Label><DatePicker date={expenseDate} setDate={setExpenseDate} /></div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('dialog_cancel')}</Button></DialogClose>
          <Button onClick={handleSave}>{t('dialog_save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RecurringExpenseDialog = ({ isOpen, onOpenChange, onSave, t }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState('monthly');
    const [startDate, setStartDate] = useState(new Date());
    const { toast } = useToast();

    const handleSave = () => {
        if (!name || !amount || !frequency || !startDate) {
          toast({ variant: 'destructive', title: t('toast_required_fields_title') });
          return;
        }
        onSave({ name, amount: parseFloat(amount), frequency, start_date: startDate, next_date: startDate });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>{t('expenses.add_recurring_title')}</DialogTitle></DialogHeader>
                <div className="py-4 space-y-4">
                    <div><Label htmlFor="name">{t('expenses.name_placeholder')}</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder={t('expenses.name_placeholder')} /></div>
                    <div><Label htmlFor="amount">{t('expenses.table_amount')}</Label><Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} /></div>
                    <div>
                        <Label>{t('expenses.table_frequency')}</Label>
                        <Select value={frequency} onValueChange={setFrequency}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">{t('expenses.frequency_monthly')}</SelectItem>
                                <SelectItem value="yearly">{t('expenses.frequency_yearly')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div><Label>{t('expenses.start_date')}</Label><DatePicker date={startDate} setDate={setStartDate} /></div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">{t('dialog_cancel')}</Button></DialogClose>
                    <Button onClick={handleSave}>{t('dialog_add')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const Expenses = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [view, setView] = useState('expenses');

  const currency = useMemo(() => (profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'), [profile]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [expensesRes, recurringRes] = await Promise.all([
        supabase.from('expenses').select('*').eq('user_id', user.id).order('expense_date', { ascending: false }),
        supabase.from('recurring_expenses').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ]);
    
    if (expensesRes.error || recurringRes.error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('expenses.load_error') });
    } else {
      setExpenses(expensesRes.data);
      setRecurringExpenses(recurringRes.data);
    }
    setLoading(false);
  }, [user, toast, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveExpense = async (expenseData) => {
    let error;
    if (editingExpense) {
      ({ error } = await supabase.from('expenses').update(expenseData).eq('id', editingExpense.id));
    } else {
      ({ error } = await supabase.from('expenses').insert({ ...expenseData, user_id: user.id }));
    }

    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('expenses.save_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('expenses.save_success') });
      setIsDialogOpen(false);
      setEditingExpense(null);
      fetchData();
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('expenses.delete_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('expenses.delete_success') });
      fetchData();
    }
  };
  
  const handleSaveRecurringExpense = async (expenseData) => {
    const { error } = await supabase.from('recurring_expenses').insert({ ...expenseData, user_id: user.id });
    if (error) {
        toast({ variant: 'destructive', title: t('toast_error_title'), description: t('expenses.save_error') });
    } else {
        toast({ title: t('toast_success_title'), description: t('expenses.save_success') });
        setIsRecurringDialogOpen(false);
        fetchData();
    }
  };

  const handleDeleteRecurring = async (id) => {
    const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
    if (error) {
        toast({ variant: 'destructive', title: t('toast_error_title'), description: t('expenses.delete_error') });
    } else {
        toast({ title: t('toast_success_title'), description: t('expenses.delete_success') });
        fetchData();
    }
  };

  const handleProcessRecurring = async () => {
    const { error } = await supabase.functions.invoke('process-recurring-expenses');
    if (error) {
        toast({ variant: 'destructive', title: t('toast_error_title'), description: t('expenses.process_error') });
    } else {
        toast({ title: t('toast_success_title'), description: 'Recurring expenses processed.' });
        fetchData();
    }
  };
  
  const renderExpensesList = () => (
    loading ? (
      <div className="text-center py-10">{t('recurring_payments_loading')}</div>
    ) : expenses.length > 0 ? (
      expenses.map(expense => (
        <Card key={expense.id} className="w-full">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{expense.description}</p>
              <p className="text-sm text-muted-foreground">{expense.category ? t(`expenses.category_${expense.category}`) : t('expenses.no_category')} - {format(new Date(expense.expense_date), 'dd/MM/yyyy')}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{expense.amount.toFixed(2)}{currency}</p>
              <Button variant="ghost" size="icon" onClick={() => { setEditingExpense(expense); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </div>
          </CardContent>
        </Card>
      ))
    ) : (
      <div className="text-center py-10 text-muted-foreground">{t('expenses.no_expenses')}</div>
    )
  );
  
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{view === 'expenses' ? t('expenses.title') : t('expenses.recurring_title')}</h1>
          <p className="text-muted-foreground">{view === 'expenses' ? t('expenses.subtitle') : t('expenses.recurring_subtitle')}</p>
        </div>
        <div className="flex gap-2">
            <Button variant={view === 'expenses' ? 'default' : 'outline'} onClick={() => setView('expenses')}>{t('expenses.title')}</Button>
            <Button variant={view === 'recurring' ? 'default' : 'outline'} onClick={() => setView('recurring')}>{t('expenses.recurring_title')}</Button>
        </div>
      </motion.div>

      {view === 'expenses' && (
        <>
          <Button onClick={() => { setEditingExpense(null); setIsDialogOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> {t('expenses.new_expense')}</Button>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="md:hidden space-y-4">
            {renderExpensesList()}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('expenses.table_date')}</TableHead>
                    <TableHead>{t('expenses.table_description')}</TableHead>
                    <TableHead>{t('expenses.table_category')}</TableHead>
                    <TableHead className="text-right">{t('expenses.table_amount')}</TableHead>
                    <TableHead className="text-right">{t('expenses.table_actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan="5" className="text-center h-24">{t('recurring_payments_loading')}</TableCell></TableRow>
                  ) : expenses.length > 0 ? (
                    expenses.map(expense => (
                      <TableRow key={expense.id}>
                        <TableCell>{format(new Date(expense.expense_date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>{expense.category ? t(`expenses.category_${expense.category}`) : t('expenses.no_category')}</TableCell>
                        <TableCell className="text-right">{expense.amount.toFixed(2)}{currency}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingExpense(expense); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan="5" className="text-center h-24">{t('expenses.no_expenses')}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        </>
      )}

      {view === 'recurring' && (
        <>
            <div className="flex gap-2">
                <Button onClick={() => setIsRecurringDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> {t('expenses.new_recurring_expense')}</Button>
                <Button onClick={handleProcessRecurring} variant="outline"><Repeat className="mr-2 h-4 w-4" /> {t('expenses.process_now')}</Button>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('budget.budget_name_label')}</TableHead>
                    <TableHead>{t('expenses.table_amount')}</TableHead>
                    <TableHead>{t('expenses.table_frequency')}</TableHead>
                    <TableHead>{t('expenses.table_next_date')}</TableHead>
                    <TableHead>{t('expenses.last_processed')}</TableHead>
                    <TableHead className="text-right">{t('expenses.table_actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan="6" className="text-center h-24">{t('recurring_payments_loading')}</TableCell></TableRow>
                  ) : recurringExpenses.length > 0 ? (
                    recurringExpenses.map(expense => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.name}</TableCell>
                        <TableCell>{expense.amount.toFixed(2)}{currency}</TableCell>
                        <TableCell>{t(`expenses.frequency_${expense.frequency}`)}</TableCell>
                        <TableCell>{expense.next_date ? format(new Date(expense.next_date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                        <TableCell>{expense.last_processed_date ? format(new Date(expense.last_processed_date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRecurring(expense.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan="6" className="text-center h-24">{t('expenses.no_recurring_expenses')}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        </>
      )}

      <ExpenseDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleSaveExpense} expense={editingExpense} t={t} />
      <RecurringExpenseDialog isOpen={isRecurringDialogOpen} onOpenChange={setIsRecurringDialogOpen} onSave={handleSaveRecurringExpense} t={t} />
    </div>
  );
};

export default Expenses;