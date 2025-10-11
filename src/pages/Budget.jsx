import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Loader2, PiggyBank, Calendar as CalendarIcon, Target, MoreVertical, DollarSign, Package, Home, Wrench as Tool, ShoppingCart, Plane, Utensils } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { Helmet } from 'react-helmet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

const Budget = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState([]);
  const [activeBudget, setActiveBudget] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newExpense, setNewExpense] = useState({ amount: '', description: '', budget_category_id: '' });

  const currencySymbol = useMemo(() => (profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'), [profile]);

  const fetchBudgetData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data: budgetsData, error: budgetsError } = await supabase.from('budgets').select('*').eq('user_id', user.id).order('start_date', { ascending: false });
    if (budgetsError) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les budgets." });
      setIsLoading(false);
      return;
    }
    setBudgets(budgetsData);

    const currentBudget = budgetsData.length > 0 ? budgetsData[0] : null;
    setActiveBudget(currentBudget);

    if (currentBudget) {
      const { data: categoriesData, error: categoriesError } = await supabase.from('budget_categories').select('*').eq('budget_id', currentBudget.id);
      
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('expense_date', currentBudget.start_date)
        .lte('expense_date', currentBudget.end_date);
      
      if (categoriesError || expensesError) {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les détails du budget." });
      } else {
        setCategories(categoriesData || []);
        setAllExpenses(expensesData || []);
      }
    } else {
      setCategories([]);
      setAllExpenses([]);
    }
    setIsLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  const handleSaveBudget = async (budget) => {
    const budgetData = {
      ...budget,
      user_id: user.id,
      amount: parseFloat(budget.amount)
    };
    const { error } = editingBudget
      ? await supabase.from('budgets').update(budgetData).eq('id', editingBudget.id)
      : await supabase.from('budgets').insert(budgetData);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Le budget n'a pas pu être sauvegardé." });
    } else {
      toast({ title: "Succès", description: `Budget ${editingBudget ? 'mis à jour' : 'créé'}.` });
      setIsBudgetFormOpen(false);
      fetchBudgetData();
    }
  };

  const handleSaveCategory = async (category) => {
    const categoryData = {
      ...category,
      user_id: user.id,
      budget_id: activeBudget.id,
      allocated_amount: parseFloat(category.allocated_amount)
    };
    const { error } = editingCategory
      ? await supabase.from('budget_categories').update(categoryData).eq('id', editingCategory.id)
      : await supabase.from('budget_categories').insert(categoryData);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "La catégorie n'a pas pu être sauvegardée." });
    } else {
      toast({ title: "Succès", description: `Catégorie ${editingCategory ? 'mise à jour' : 'créée'}.` });
      setIsCategoryFormOpen(false);
      fetchBudgetData();
    }
  };

  const handleSaveExpense = async () => {
    const expenseData = {
      user_id: user.id,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      budget_category_id: newExpense.budget_category_id,
      expense_date: new Date().toISOString().split('T')[0],
      category: 'budget'
    };
    const { error } = await supabase.from('expenses').insert(expenseData);
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "La dépense n'a pas pu être sauvegardée." });
    } else {
      toast({ title: "Succès", description: "Dépense ajoutée." });
      setIsExpenseFormOpen(false);
      setNewExpense({ amount: '', description: '', budget_category_id: '' });
      fetchBudgetData();
    }
  };

  const openBudgetForm = (budget = null) => {
    const today = new Date();
    setEditingBudget(budget);
    setIsBudgetFormOpen(true);
  };

  const openCategoryForm = (category = null) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };

  const formatCurrency = (value) => `${(value || 0).toFixed(2)}${currencySymbol}`;

  const categorySpending = useMemo(() => {
    return categories.map(cat => {
      const spent = allExpenses.filter(ex => ex.budget_category_id === cat.id).reduce((sum, ex) => sum + ex.amount, 0);
      const remaining = cat.allocated_amount - spent;
      const percentage = cat.allocated_amount > 0 ? (spent / cat.allocated_amount) * 100 : 0;
      return { ...cat, spent, remaining, percentage };
    });
  }, [categories, allExpenses]);

  const totalSpent = useMemo(() => allExpenses.reduce((sum, ex) => sum + ex.amount, 0), [allExpenses]);
  const totalAllocated = useMemo(() => categories.reduce((sum, cat) => sum + cat.allocated_amount, 0), [categories]);
  const totalBudgetAmount = activeBudget?.amount || 0;
  const totalRemaining = totalBudgetAmount - totalSpent;
  const totalPercentage = totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount) * 100 : 0;

  const pieData = categorySpending.filter(c => c.spent > 0).map(c => ({ name: c.name, value: c.spent }));

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Gestion de Budget - YourBizFlow</title>
        <meta name="description" content="Créez des budgets mensuels, suivez vos dépenses par catégorie et gardez le contrôle de vos finances." />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion de Budget</h1>
            <p className="text-muted-foreground">Gardez le contrôle de vos finances en temps réel.</p>
          </div>
          <Button onClick={() => openBudgetForm()}><PlusCircle className="mr-2 h-4 w-4" /> Nouveau Budget</Button>
        </div>
      </motion.div>

      {!activeBudget ? (
        <Card className="text-center py-16">
          <CardHeader><CardTitle>Aucun budget trouvé</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Commencez par créer votre premier budget mensuel.</p>
            <Button onClick={() => openBudgetForm()}><PiggyBank className="mr-2 h-4 w-4" /> Créer un budget</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">{activeBudget.name}</CardTitle>
                  <CardDescription>{format(parseISO(activeBudget.start_date), 'dd MMM', { locale: fr })} - {format(parseISO(activeBudget.end_date), 'dd MMM yyyy', { locale: fr })}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => openBudgetForm(activeBudget)}><Edit className="mr-2 h-4 w-4" /> Modifier</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Dépensé: {formatCurrency(totalSpent)}</span>
                  <span>Restant: {formatCurrency(totalRemaining)}</span>
                </div>
                <Progress value={totalPercentage} />
                <div className="text-right text-lg font-bold">Total: {formatCurrency(totalBudgetAmount)}</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Catégories</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => openCategoryForm()}><PlusCircle className="mr-2 h-4 w-4" /> Catégorie</Button>
                    <Button size="sm" variant="secondary" onClick={() => setIsExpenseFormOpen(true)}><DollarSign className="mr-2 h-4 w-4" /> Dépense</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorySpending.length > 0 ? categorySpending.map(cat => (
                  <div key={cat.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{formatCurrency(cat.spent)} / {formatCurrency(cat.allocated_amount)}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openCategoryForm(cat)}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {
                              await supabase.from('budget_categories').delete().eq('id', cat.id);
                              fetchBudgetData();
                            }} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <Progress value={cat.percentage} />
                  </div>
                )) : <p className="text-muted-foreground text-center py-8">Aucune catégorie. Ajoutez-en une pour commencer.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Répartition des Dépenses</CardTitle></CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-20">Aucune dépense enregistrée.</p>}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Dialog open={isBudgetFormOpen} onOpenChange={setIsBudgetFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBudget ? 'Modifier le' : 'Nouveau'} Budget</DialogTitle>
          </DialogHeader>
          <BudgetFormFields budget={editingBudget} onSave={handleSaveBudget} onCancel={() => setIsBudgetFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCategory ? 'Modifier la' : 'Nouvelle'} Catégorie</DialogTitle></DialogHeader>
          <CategoryFormFields category={editingCategory} onSave={handleSaveCategory} onCancel={() => setIsCategoryFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter une Dépense</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label htmlFor="exp-desc">Description</Label><Input id="exp-desc" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} /></div>
            <div><Label htmlFor="exp-amount">Montant ({currencySymbol})</Label><Input id="exp-amount" type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} /></div>
            <div>
              <Label htmlFor="exp-cat">Catégorie</Label>
              <select id="exp-cat" value={newExpense.budget_category_id} onChange={e => setNewExpense({...newExpense, budget_category_id: e.target.value})} className="w-full mt-1 bg-background border border-input rounded-md p-2">
                <option value="">Choisir une catégorie</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button onClick={handleSaveExpense}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const BudgetFormFields = ({ budget, onSave, onCancel }) => {
  const [currentBudget, setCurrentBudget] = useState(budget || { name: `Budget ${format(new Date(), 'MMMM yyyy', {locale: fr})}`, amount: '', start_date: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end_date: format(endOfMonth(new Date()), 'yyyy-MM-dd') });
  const handleChange = (field, value) => setCurrentBudget(p => ({ ...p, [field]: value }));
  return (
    <>
      <div className="space-y-4 py-4">
        <div><Label htmlFor="b-name">Nom</Label><Input id="b-name" value={currentBudget.name} onChange={e => handleChange('name', e.target.value)} /></div>
        <div><Label htmlFor="b-amount">Montant Total</Label><Input id="b-amount" type="number" value={currentBudget.amount} onChange={e => handleChange('amount', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="b-start">Date de début</Label><Input id="b-start" type="date" value={currentBudget.start_date} onChange={e => handleChange('start_date', e.target.value)} /></div>
          <div><Label htmlFor="b-end">Date de fin</Label><Input id="b-end" type="date" value={currentBudget.end_date} onChange={e => handleChange('end_date', e.target.value)} /></div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={() => onSave(currentBudget)}>Sauvegarder</Button>
      </DialogFooter>
    </>
  );
};

const CategoryFormFields = ({ category, onSave, onCancel }) => {
  const [currentCategory, setCurrentCategory] = useState(category || { name: '', allocated_amount: '' });
  const handleChange = (field, value) => setCurrentCategory(p => ({ ...p, [field]: value }));
  return (
    <>
      <div className="space-y-4 py-4">
        <div><Label htmlFor="c-name">Nom</Label><Input id="c-name" value={currentCategory.name} onChange={e => handleChange('name', e.target.value)} /></div>
        <div><Label htmlFor="c-amount">Montant Alloué</Label><Input id="c-amount" type="number" value={currentCategory.allocated_amount} onChange={e => handleChange('allocated_amount', e.target.value)} /></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={() => onSave(currentCategory)}>Sauvegarder</Button>
      </DialogFooter>
    </>
  );
};

export default Budget;