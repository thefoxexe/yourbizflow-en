import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/customSupabaseClient";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  PiggyBank,
  Calendar as CalendarIcon,
  Target,
  MoreVertical,
  DollarSign,
  Package,
  Home,
  Wrench as Tool,
  ShoppingCart,
  Plane,
  Utensils,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Helmet } from "react-helmet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
];

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
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    budget_category_id: "",
  });

  const currencySymbol = useMemo(
    () =>
      profile?.currency === "usd"
        ? "$"
        : profile?.currency === "chf"
        ? "CHF"
        : "€",
    [profile]
  );

  const fetchBudgetData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data: budgetsData, error: budgetsError } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false });
    if (budgetsError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load budgets.",
      });
      setIsLoading(false);
      return;
    }
    setBudgets(budgetsData);

    const currentBudget = budgetsData.length > 0 ? budgetsData[0] : null;
    setActiveBudget(currentBudget);

    if (currentBudget) {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("budget_id", currentBudget.id);

      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("expense_date", currentBudget.start_date)
        .lte("expense_date", currentBudget.end_date);

      if (categoriesError || expensesError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to load budget details.",
        });
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
      amount: parseFloat(budget.amount),
    };
    const { error } = editingBudget
      ? await supabase
          .from("budgets")
          .update(budgetData)
          .eq("id", editingBudget.id)
      : await supabase.from("budgets").insert(budgetData);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The budget could not be saved.",
      });
    } else {
      toast({
        title: "Success",
        description: `Budget ${editingBudget ? "updated" : "created"}.`,
      });
      setIsBudgetFormOpen(false);
      fetchBudgetData();
    }
  };

  const handleSaveCategory = async (category) => {
    const categoryData = {
      ...category,
      user_id: user.id,
      budget_id: activeBudget.id,
      allocated_amount: parseFloat(category.allocated_amount),
    };
    const { error } = editingCategory
      ? await supabase
          .from("budget_categories")
          .update(categoryData)
          .eq("id", editingCategory.id)
      : await supabase.from("budget_categories").insert(categoryData);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The category could not be saved.",
      });
    } else {
      toast({
        title: "Success",
        description: `Category ${editingCategory ? "updated" : "created"}.`,
      });
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
      expense_date: new Date().toISOString().split("T")[0],
      category: "budget",
    };
    const { error } = await supabase.from("expenses").insert(expenseData);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The expense could not be saved.",
      });
    } else {
      toast({ title: "Success", description: "Added expense." });
      setIsExpenseFormOpen(false);
      setNewExpense({ amount: "", description: "", budget_category_id: "" });
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

  const formatCurrency = (value) =>
    `${(value || 0).toFixed(2)}${currencySymbol}`;

  const categorySpending = useMemo(() => {
    return categories.map((cat) => {
      const spent = allExpenses
        .filter((ex) => ex.budget_category_id === cat.id)
        .reduce((sum, ex) => sum + ex.amount, 0);
      const remaining = cat.allocated_amount - spent;
      const percentage =
        cat.allocated_amount > 0 ? (spent / cat.allocated_amount) * 100 : 0;
      return { ...cat, spent, remaining, percentage };
    });
  }, [categories, allExpenses]);

  const totalSpent = useMemo(
    () => allExpenses.reduce((sum, ex) => sum + ex.amount, 0),
    [allExpenses]
  );
  const totalAllocated = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.allocated_amount, 0),
    [categories]
  );
  const totalBudgetAmount = activeBudget?.amount || 0;
  const totalRemaining = totalBudgetAmount - totalSpent;
  const totalPercentage =
    totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount) * 100 : 0;

  const pieData = categorySpending
    .filter((c) => c.spent > 0)
    .map((c) => ({ name: c.name, value: c.spent }));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Budget Management - YourBizFlow</title>
        <meta
          name="description"
          content="Create monthly budgets, track your expenses by category and stay in control of your finances."
        />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Budget Management
            </h1>
            <p className="text-muted-foreground">
              Keep control of your finances in real time.
            </p>
          </div>
          <Button onClick={() => openBudgetForm()}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Budget
          </Button>
        </div>
      </motion.div>

      {!activeBudget ? (
        <Card className="text-center py-16">
          <CardHeader>
            <CardTitle>No budget found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Start by creating your first monthly budget.
            </p>
            <Button onClick={() => openBudgetForm()}>
              <PiggyBank className="mr-2 h-4 w-4" /> Create a budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">
                    {activeBudget.name}
                  </CardTitle>
                  <CardDescription>
                    {format(parseISO(activeBudget.start_date), "dd MMM", {
                      locale: fr,
                    })}{" "}
                    -{" "}
                    {format(parseISO(activeBudget.end_date), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBudgetForm(activeBudget)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Spent: {formatCurrency(totalSpent)}</span>
                  <span>Remaining: {formatCurrency(totalRemaining)}</span>
                </div>
                <Progress value={totalPercentage} />
                <div className="text-right text-lg font-bold">
                  Total: {formatCurrency(totalBudgetAmount)}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Categories</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => openCategoryForm()}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Category
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsExpenseFormOpen(true)}
                    >
                      <DollarSign className="mr-2 h-4 w-4" /> Expense
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorySpending.length > 0 ? (
                  categorySpending.map((cat) => (
                    <div key={cat.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(cat.spent)} /{" "}
                            {formatCurrency(cat.allocated_amount)}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => openCategoryForm(cat)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  await supabase
                                    .from("budget_categories")
                                    .delete()
                                    .eq("id", cat.id);
                                  fetchBudgetData();
                                }}
                                className="text-red-500"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <Progress value={cat.percentage} />
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No category. Add one to start.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Distribution of Expenditures</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-20">
                    No expenses recorded.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Dialog open={isBudgetFormOpen} onOpenChange={setIsBudgetFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBudget ? "Edit" : "New"} Budget</DialogTitle>
          </DialogHeader>
          <BudgetFormFields
            budget={editingBudget}
            onSave={handleSaveBudget}
            onCancel={() => setIsBudgetFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit" : "New"} Category
            </DialogTitle>
          </DialogHeader>
          <CategoryFormFields
            category={editingCategory}
            onSave={handleSaveCategory}
            onCancel={() => setIsCategoryFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add an Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="exp-desc">Description</Label>
              <Input
                id="exp-desc"
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="exp-amount">Amount ({currencySymbol})</Label>
              <Input
                id="exp-amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, amount: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="exp-cat">Category</Label>
              <select
                id="exp-cat"
                value={newExpense.budget_category_id}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    budget_category_id: e.target.value,
                  })
                }
                className="w-full mt-1 bg-background border border-input rounded-md p-2"
              >
                <option value="">Choose a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveExpense}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const BudgetFormFields = ({ budget, onSave, onCancel }) => {
  const [currentBudget, setCurrentBudget] = useState(
    budget || {
      name: `Budget ${format(new Date(), "MMMM yyyy", { locale: fr })}`,
      amount: "",
      start_date: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      end_date: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    }
  );
  const handleChange = (field, value) =>
    setCurrentBudget((p) => ({ ...p, [field]: value }));
  return (
    <>
      <div className="space-y-4 py-4">
        <div>
          <Label htmlFor="b-name">Name</Label>
          <Input
            id="b-name"
            value={currentBudget.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="b-amount">Total Amount</Label>
          <Input
            id="b-amount"
            type="number"
            value={currentBudget.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="b-start">Start date</Label>
            <Input
              id="b-start"
              type="date"
              value={currentBudget.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="b-end">End date</Label>
            <Input
              id="b-end"
              type="date"
              value={currentBudget.end_date}
              onChange={(e) => handleChange("end_date", e.target.value)}
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(currentBudget)}>Save</Button>
      </DialogFooter>
    </>
  );
};

const CategoryFormFields = ({ category, onSave, onCancel }) => {
  const [currentCategory, setCurrentCategory] = useState(
    category || { name: "", allocated_amount: "" }
  );
  const handleChange = (field, value) =>
    setCurrentCategory((p) => ({ ...p, [field]: value }));
  return (
    <>
      <div className="space-y-4 py-4">
        <div>
          <Label htmlFor="c-name">Name</Label>
          <Input
            id="c-name"
            value={currentCategory.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="c-amount">Allocated Amount</Label>
          <Input
            id="c-amount"
            type="number"
            value={currentCategory.allocated_amount}
            onChange={(e) => handleChange("allocated_amount", e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(currentCategory)}>Save</Button>
      </DialogFooter>
    </>
  );
};

export default Budget;
