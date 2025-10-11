
    import React, { useState, useEffect, useMemo, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { PlusCircle, MoreVertical, Edit, Trash2, Loader2, Repeat, Calendar as CalendarIcon, Package, Home, Wrench as Tool, ShoppingCart, Plane, Utensils, PiggyBank, User } from 'lucide-react';
    import { Label } from '@/components/ui/label';
    import { format, parseISO } from 'date-fns';
    import { fr } from 'date-fns/locale';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { Calendar } from '@/components/ui/calendar';
    import { cn } from '@/lib/utils';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

    const expenseCategories = [
      { value: "fournitures", label: "Fournitures de bureau", icon: Package },
      { value: "loyer", label: "Loyer et charges", icon: Home },
      { value: "logiciels", label: "Logiciels et abonnements", icon: Tool },
      { value: "marketing", label: "Marketing et publicité", icon: ShoppingCart },
      { value: "transport", label: "Transport et déplacements", icon: Plane },
      { value: "repas", label: "Repas et divertissement", icon: Utensils },
      { value: "impots", label: "Impôts et taxes", icon: PiggyBank },
    ];

    const ExpenseForm = ({ isOpen, onOpenChange, onSave, expense, currencySymbol }) => {
      const [currentExpense, setCurrentExpense] = useState(expense);
      const [isSaving, setIsSaving] = useState(false);

      useEffect(() => {
        setCurrentExpense(expense);
      }, [expense]);

      const handleChange = (field, value) => {
        setCurrentExpense(prev => ({ ...prev, [field]: value }));
      };
      
      const handleDateChange = (date) => {
        if (date) {
            handleChange('expense_date', date);
        }
      };


      const handleSave = async () => {
        setIsSaving(true);
        const expenseToSave = {
            ...currentExpense,
            expense_date: format(currentExpense.expense_date, 'yyyy-MM-dd'),
        };
        await onSave(expenseToSave);
        setIsSaving(false);
      };
      
      if (!currentExpense) return null;

      const displayDate = currentExpense.expense_date ? (typeof currentExpense.expense_date === 'string' ? parseISO(currentExpense.expense_date) : currentExpense.expense_date) : null;

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentExpense.id ? 'Modifier' : 'Ajouter'} une dépense</DialogTitle>
              <DialogDescription>Renseignez les détails de la transaction.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label htmlFor="description">Description</Label><Input id="description" value={currentExpense.description || ''} onChange={(e) => handleChange('description', e.target.value)} /></div>
              <div><Label htmlFor="amount">Montant ({currencySymbol})</Label><Input id="amount" type="number" value={currentExpense.amount || ''} onChange={(e) => handleChange('amount', e.target.value)} /></div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <select id="category" value={currentExpense.category || ''} onChange={(e) => handleChange('category', e.target.value)} className="w-full mt-1 bg-background border border-input rounded-md p-2">
                  <option value="">Non catégorisé</option>
                  {expenseCategories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !displayDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {displayDate ? format(displayDate, "PPP", { locale: fr }) : <span>Choisissez une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={displayDate} onSelect={handleDateChange} initialFocus /></PopoverContent>
                </Popover>
              </div>
              <div><Label htmlFor="spent_by">Dépensé par (optionnel)</Label><Input id="spent_by" value={currentExpense.spent_by || ''} onChange={(e) => handleChange('spent_by', e.target.value)} placeholder="Ex: Jean Dupont"/></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin" /> : "Sauvegarder"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    const SubscriptionForm = ({ isOpen, onOpenChange, onSave, subscription, currencySymbol }) => {
      const [currentSubscription, setCurrentSubscription] = useState(subscription);
      const [isSaving, setIsSaving] = useState(false);

      useEffect(() => {
        setCurrentSubscription(subscription);
      }, [subscription]);

      const handleChange = (field, value) => {
        setCurrentSubscription(prev => ({ ...prev, [field]: value }));
      };
      
       const handleDateChange = (date) => {
        if (date) {
            handleChange('start_date', date);
        }
      };

      const handleSave = async () => {
        setIsSaving(true);
        const subscriptionToSave = {
            ...currentSubscription,
            start_date: format(currentSubscription.start_date, 'yyyy-MM-dd'),
        };
        await onSave(subscriptionToSave);
        setIsSaving(false);
      };

      if (!currentSubscription) return null;
      
      const displayDate = currentSubscription.start_date ? (typeof currentSubscription.start_date === 'string' ? parseISO(currentSubscription.start_date) : currentSubscription.start_date) : null;

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentSubscription.id ? 'Modifier' : 'Ajouter'} un abonnement</DialogTitle>
              <DialogDescription>Les dépenses seront générées automatiquement.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label htmlFor="sub-name">Nom</Label><Input id="sub-name" value={currentSubscription.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Ex: Spotify, ChatGPT..." /></div>
              <div><Label htmlFor="sub-amount">Prix ({currencySymbol})</Label><Input id="sub-amount" type="number" value={currentSubscription.amount || ''} onChange={(e) => handleChange('amount', e.target.value)} /></div>
              <div>
                <Label htmlFor="sub-frequency">Fréquence</Label>
                <select id="sub-frequency" value={currentSubscription.frequency || 'monthly'} onChange={(e) => handleChange('frequency', e.target.value)} className="w-full mt-1 bg-background border border-input rounded-md p-2">
                  <option value="monthly">Mensuel</option>
                  <option value="annually">Annuel</option>
                </select>
              </div>
              <div>
                <Label>Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !displayDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {displayDate ? format(displayDate, "PPP", { locale: fr }) : <span>Choisissez une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={displayDate} onSelect={handleDateChange} initialFocus /></PopoverContent>
                </Popover>
              </div>
              <div><Label htmlFor="sub_spent_by">Dépensé par (optionnel)</Label><Input id="sub_spent_by" value={currentSubscription.spent_by || ''} onChange={(e) => handleChange('spent_by', e.target.value)} placeholder="Ex: Jean Dupont"/></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin" /> : "Sauvegarder"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    const ExpensesList = ({ expenses, onEdit, onDelete, currencySymbol, isLoading }) => {
      return (
        <>
          <div className="hidden sm:block">
            <Table>
              <TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Catégorie</TableHead><TableHead>Dépensé par</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Montant</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? <TableRow><TableCell colSpan={6} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></TableCell></TableRow>
                 : expenses.length > 0 ? expenses.map(expense => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.category ? expenseCategories.find(c => c.value === expense.category)?.label : 'N/A'}</TableCell>
                    <TableCell>{expense.spent_by || '-'}</TableCell>
                    <TableCell>{format(parseISO(expense.expense_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="text-right">{currencySymbol}{expense.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onEdit(expense)}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(expense.id)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Aucune dépense enregistrée.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
          <div className="sm:hidden space-y-4">
            {isLoading ? <div className="text-center p-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>
             : expenses.length > 0 ? expenses.map(expense => (
              <Card key={expense.id} className="bg-card/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{expense.description}</CardTitle>
                      <CardDescription>{expense.category ? expenseCategories.find(c => c.value === expense.category)?.label : 'Non catégorisé'}</CardDescription>
                      {expense.spent_by && <CardDescription className="flex items-center mt-1"><User className="w-3 h-3 mr-1.5" />{expense.spent_by}</CardDescription>}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="-mt-2 -mr-2"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onEdit(expense)}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(expense.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{format(parseISO(expense.expense_date), 'dd MMM yyyy')}</span>
                  <span className="font-bold text-lg">{currencySymbol}{expense.amount.toFixed(2)}</span>
                </CardContent>
              </Card>
            )) : <div className="text-center py-12 text-muted-foreground">Aucune dépense.</div>}
          </div>
        </>
      )
    };

    const SubscriptionsList = ({ subscriptions, onEdit, onDelete, currencySymbol, isLoading }) => {
      return (
        <>
          <div className="hidden sm:block">
            <Table>
              <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Fréquence</TableHead><TableHead>Dépensé par</TableHead><TableHead>Date de début</TableHead><TableHead className="text-right">Montant</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? <TableRow><TableCell colSpan={6} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></TableCell></TableRow>
                 : subscriptions.length > 0 ? subscriptions.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell className="capitalize">{sub.frequency === 'monthly' ? 'Mensuel' : 'Annuel'}</TableCell>
                    <TableCell>{sub.spent_by || '-'}</TableCell>
                    <TableCell>{format(parseISO(sub.start_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="text-right">{currencySymbol}{sub.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onEdit(sub)}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(sub.id)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Aucun abonnement enregistré.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
          <div className="sm:hidden space-y-4">
            {isLoading ? <div className="text-center p-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>
             : subscriptions.length > 0 ? subscriptions.map(sub => (
              <Card key={sub.id} className="bg-card/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{sub.name}</CardTitle>
                      <CardDescription className="capitalize">{sub.frequency === 'monthly' ? 'Mensuel' : 'Annuel'} - Début: {format(parseISO(sub.start_date), 'dd MMM yyyy')}</CardDescription>
                      {sub.spent_by && <CardDescription className="flex items-center mt-1"><User className="w-3 h-3 mr-1.5" />{sub.spent_by}</CardDescription>}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="-mt-2 -mr-2"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onEdit(sub)}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(sub.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <span className="font-bold text-lg">{currencySymbol}{sub.amount.toFixed(2)}</span>
                </CardContent>
              </Card>
            )) : <div className="text-center py-12 text-muted-foreground">Aucun abonnement.</div>}
          </div>
        </>
      )
    };

    const Expenses = () => {
      const { user, profile } = useAuth();
      const { toast } = useToast();
      const [expenses, setExpenses] = useState([]);
      const [subscriptions, setSubscriptions] = useState([]);
      const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
      const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
      const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
      const [isSubFormOpen, setIsSubFormOpen] = useState(false);
      const [editingExpense, setEditingExpense] = useState(null);
      const [editingSubscription, setEditingSubscription] = useState(null);

      const currencySymbol = useMemo(() => (profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'), [profile]);

      const initialExpenseState = { id: null, description: '', amount: '', category: '', expense_date: new Date(), spent_by: '' };
      const initialSubscriptionState = { id: null, name: '', amount: '', frequency: 'monthly', start_date: new Date(), spent_by: '' };

      const fetchExpenses = useCallback(async () => {
        if (!user) return;
        setIsLoadingExpenses(true);
        const { data, error } = await supabase.from('expenses').select('*').eq('user_id', user.id).order('expense_date', { ascending: false });
        if (error) {
          toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les dépenses." });
        } else {
          setExpenses(data);
        }
        setIsLoadingExpenses(false);
      }, [user, toast]);
      
      const fetchSubscriptions = useCallback(async () => {
        if (!user) return;
        setIsLoadingSubscriptions(true);
        const { data, error } = await supabase.from('recurring_expenses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (error) {
          toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les abonnements." });
        } else {
          setSubscriptions(data);
        }
        setIsLoadingSubscriptions(false);
      }, [user, toast]);

      useEffect(() => {
        fetchExpenses();
        fetchSubscriptions();
      }, [fetchExpenses, fetchSubscriptions]);

      const handleSaveExpense = async (expense) => {
        const { id, ...expenseData } = expense;
        const dataToSave = {
          ...expenseData,
          user_id: user.id,
          amount: parseFloat(expense.amount),
          spent_by: expense.spent_by || null,
        };

        let error;
        if (id) {
          ({ error } = await supabase.from('expenses').update(dataToSave).eq('id', id));
        } else {
          const { id: _, ...insertData } = dataToSave;
          ({ error } = await supabase.from('expenses').insert(insertData));
        }

        if (error) {
          toast({ variant: "destructive", title: "Erreur", description: "La dépense n'a pas pu être sauvegardée." });
        } else {
          toast({ title: "Succès", description: `Dépense ${id ? 'mise à jour' : 'créée'}.` });
          setIsExpenseFormOpen(false);
          fetchExpenses();
        }
      };
      
      const handleSaveSubscription = async (subscription) => {
        const { id, ...subscriptionData } = subscription;
        const dataToSave = {
          ...subscriptionData,
          user_id: user.id,
          amount: parseFloat(subscription.amount),
          spent_by: subscription.spent_by || null,
        };

        let error;
        let newSubId = id;

        if (id) {
          ({ error } = await supabase.from('recurring_expenses').update(dataToSave).eq('id', id));
        } else {
          const { id: _, ...insertData } = dataToSave;
          const { data: newData, error: insertError } = await supabase.from('recurring_expenses').insert(insertData).select().single();
          error = insertError;
          if (newData) {
            newSubId = newData.id;
          }
        }
        
        if (error) {
          toast({ variant: "destructive", title: "Erreur", description: "L'abonnement n'a pas pu être sauvegardé." });
        } else {
          toast({ title: "Succès", description: `Abonnement ${id ? 'mis à jour' : 'créé'}. Traitement en cours...` });
          setIsSubFormOpen(false);
          await fetchSubscriptions();

          if (newSubId) {
            const { error: functionError } = await supabase.functions.invoke('process-recurring-expenses', {
                body: { subscriptionId: newSubId }
            });
            if (functionError) {
                toast({ variant: "destructive", title: "Erreur de traitement", description: "Impossible de générer les dépenses passées." });
            } else {
                toast({ title: "Traitement terminé", description: "Les dépenses passées ont été ajoutées." });
                await fetchExpenses();
            }
          }
        }
      };

      const handleDeleteExpense = async (id) => {
        await supabase.from('expenses').delete().eq('id', id);
        toast({ title: "Dépense supprimée" });
        fetchExpenses();
      };
      
      const handleDeleteSubscription = async (id) => {
        await supabase.from('recurring_expenses').delete().eq('id', id);
        toast({ title: "Abonnement supprimé" });
        fetchSubscriptions();
      };

      const openExpenseForm = (expense = null) => {
        const date = expense?.expense_date ? parseISO(expense.expense_date) : new Date();
        setEditingExpense(expense ? { ...expense, expense_date: date } : { ...initialExpenseState, expense_date: date });
        setIsExpenseFormOpen(true);
      };

      const openSubscriptionForm = (sub = null) => {
        const date = sub?.start_date ? parseISO(sub.start_date) : new Date();
        setEditingSubscription(sub ? { ...sub, start_date: date } : { ...initialSubscriptionState, start_date: date });
        setIsSubFormOpen(true);
      };

      return (
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-foreground">Suivi des Dépenses</h1>
            <p className="text-muted-foreground">Gardez un œil sur toutes vos sorties d'argent.</p>
          </motion.div>

          <Tabs defaultValue="expenses" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="expenses">Dépenses</TabsTrigger>
                <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
              </TabsList>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={() => openSubscriptionForm()} className="w-full sm:w-auto"><Repeat className="mr-2 h-4 w-4" /> Nouvel Abo.</Button>
                <Button onClick={() => openExpenseForm()} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Dépense</Button>
              </div>
            </div>

            <TabsContent value="expenses">
              <Card>
                <CardHeader><CardTitle>Dépenses Récentes</CardTitle><CardDescription>Liste de toutes vos transactions ponctuelles.</CardDescription></CardHeader>
                <CardContent>
                  <ExpensesList expenses={expenses} onEdit={openExpenseForm} onDelete={handleDeleteExpense} currencySymbol={currencySymbol} isLoading={isLoadingExpenses} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions">
              <Card>
                <CardHeader><CardTitle>Abonnements</CardTitle><CardDescription>Gérez vos dépenses récurrentes.</CardDescription></CardHeader>
                <CardContent>
                  <SubscriptionsList subscriptions={subscriptions} onEdit={openSubscriptionForm} onDelete={handleDeleteSubscription} currencySymbol={currencySymbol} isLoading={isLoadingSubscriptions} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {isExpenseFormOpen && <ExpenseForm isOpen={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen} onSave={handleSaveExpense} expense={editingExpense} currencySymbol={currencySymbol} />}
          {isSubFormOpen && <SubscriptionForm isOpen={isSubFormOpen} onOpenChange={setIsSubFormOpen} onSave={handleSaveSubscription} subscription={editingSubscription} currencySymbol={currencySymbol} />}
        </div>
      );
    };

    export default Expenses;
  