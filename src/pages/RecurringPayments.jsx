import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  MinusCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/customSupabaseClient";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DatePicker } from "@/components/DatePicker";
import { format } from "date-fns";

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
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    interval: "month",
  });

  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    client_id: "",
    subscription_product_id: "",
    start_date: new Date(),
  });

  const currencySymbol = useMemo(() => {
    const currency = profile?.currency || "eur";
    if (currency === "usd") return "$";
    if (currency === "chf") return "CHF";
    return "€";
  }, [profile]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [plansRes, subsRes, clientsRes] = await Promise.all([
      supabase.from("subscription_products").select("*").eq("user_id", user.id),
      supabase
        .from("customer_subscriptions")
        .select(
          "*, client:clients(name), plan:subscription_product_id(name, price, interval)"
        )
        .eq("user_id", user.id),
      supabase.from("clients").select("id, name").eq("user_id", user.id),
    ]);

    if (plansRes.error || subsRes.error || clientsRes.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load data.",
      });
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
    plans.forEach((plan) => {
      counts[plan.id] = subscriptions.filter(
        (sub) =>
          sub.subscription_product_id === plan.id && sub.status === "active"
      ).length;
    });
    return counts;
  }, [plans, subscriptions]);

  const handleSavePlan = async () => {
    if (!newPlan.name || !newPlan.price) {
      toast({
        variant: "destructive",
        title: "Required fields",
        description: "Name and price are required.",
      });
      return;
    }
    const planData = {
      ...newPlan,
      user_id: user.id,
      price: Number(newPlan.price),
    };
    const { error } = currentPlan
      ? await supabase
          .from("subscription_products")
          .update(planData)
          .eq("id", currentPlan.id)
      : await supabase.from("subscription_products").insert(planData);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The plan could not be saved.",
      });
    } else {
      toast({
        title: "Success",
        description: `Plan ${currentPlan ? "updated" : "created"}.`,
      });
      setIsPlanDialogOpen(false);
      fetchData();
    }
  };

  const handleDeletePlan = async (planId) => {
    const { error } = await supabase
      .from("subscription_products")
      .delete()
      .eq("id", planId);
    if (error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "The plan could not be deleted.",
      });
    else {
      toast({ title: "Success", description: "Plan deleted." });
      fetchData();
    }
  };

  const handleSaveSubscription = async () => {
    if (
      !newSubscription.client_id ||
      !newSubscription.subscription_product_id ||
      !newSubscription.start_date
    ) {
      toast({
        variant: "destructive",
        title: "Required fields",
        description: "All fields are required.",
      });
      return;
    }
    const subData = {
      ...newSubscription,
      user_id: user.id,
      status: "active",
      start_date: format(newSubscription.start_date, "yyyy-MM-dd"),
    };
    const { error } = await supabase
      .from("customer_subscriptions")
      .insert(subData);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Subscriber could not be added.",
      });
    } else {
      toast({ title: "Success", description: "Subscriber added." });
      setIsSubDialogOpen(false);
      fetchData();
    }
  };

  const handleQuickAddSubscriber = async (planId) => {
    setProcessingPlanId(planId);
    const subData = {
      subscription_product_id: planId,
      user_id: user.id,
      status: "active",
      start_date: format(new Date(), "yyyy-MM-dd"),
    };
    const { error } = await supabase
      .from("customer_subscriptions")
      .insert(subData);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Subscriber could not be added.",
      });
    } else {
      toast({ title: "Success", description: "Anonymous subscriber added." });
      await fetchData();
    }
    setProcessingPlanId(null);
  };

  const handleQuickRemoveSubscriber = async (planId) => {
    setProcessingPlanId(planId);
    const subToDelete = subscriptions.find(
      (s) =>
        s.subscription_product_id === planId &&
        s.client_id === null &&
        s.status === "active"
    );
    if (!subToDelete) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No anonymous subscribers to delete for this plan.",
      });
      setProcessingPlanId(null);
      return;
    }

    const { error } = await supabase
      .from("customer_subscriptions")
      .delete()
      .eq("id", subToDelete.id);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The subscriber could not be deleted.",
      });
    } else {
      toast({ title: "Success", description: "Anonymous subscriber removed." });
      await fetchData();
    }
    setProcessingPlanId(null);
  };

  const handleCancelSubscription = async (subId) => {
    const { error } = await supabase
      .from("customer_subscriptions")
      .update({ status: "canceled", canceled_at: new Date().toISOString() })
      .eq("id", subId);
    if (error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "The subscription could not be canceled.",
      });
    else {
      toast({ title: "Success", description: "Subscription cancelled." });
      fetchData();
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Recurring Payments
          </h1>
          <p className="text-muted-foreground">
            Manage your subscriptions and recurring revenue.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-foreground">
              Your Subscription Plans
            </h2>
            <Button
              onClick={() => {
                setCurrentPlan(null);
                setNewPlan({ name: "", price: "", interval: "month" });
                setIsPlanDialogOpen(true);
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" /> New Plan
            </Button>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-4 space-y-3">
            {loading ? (
              <p>Loading...</p>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {plan.price}
                      {currencySymbol} /{" "}
                      {plan.interval === "month" ? "month" : "year"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuickRemoveSubscriber(plan.id)}
                      disabled={
                        processingPlanId === plan.id ||
                        planSubscriberCounts[plan.id] === 0
                      }
                    >
                      {processingPlanId === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MinusCircle className="w-4 h-4" />
                      )}
                    </Button>
                    <span className="font-bold text-lg w-8 text-center">
                      {planSubscriberCounts[plan.id] || 0}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuickAddSubscriber(plan.id)}
                      disabled={processingPlanId === plan.id}
                    >
                      {processingPlanId === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setCurrentPlan(plan);
                            setNewPlan(plan);
                            setIsPlanDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePlan(plan.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-foreground">
              Subscribers (Customers)
            </h2>
            <Button
              onClick={() => {
                setNewSubscription({
                  client_id: "",
                  subscription_product_id: "",
                  start_date: new Date(),
                });
                setIsSubDialogOpen(true);
              }}
              className="w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Assign to a client
            </Button>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-4 space-y-3">
            {loading ? (
              <p>Loading...</p>
            ) : (
              subscriptions
                .filter((s) => s.status === "active" && s.client_id)
                .map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">
                        {sub.client?.name || "Customer deleted"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sub.plan?.name || "Plan deleted"} -{" "}
                        {new Date(sub.start_date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelSubscription(sub.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                ))
            )}
            {subscriptions.filter((s) => s.status === "active" && s.client_id)
              .length === 0 &&
              !loading && (
                <p className="text-center text-muted-foreground py-4">
                  No subscribers assigned to a client.
                </p>
              )}
          </div>
        </motion.div>
      </div>

      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{currentPlan ? "Edit plan" : "New plan"}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newPlan.name}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ({currencySymbol})</Label>
              <Input
                id="price"
                type="number"
                value={newPlan.price}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, price: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interval">Interval</Label>
              <select
                id="interval"
                value={newPlan.interval}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, interval: e.target.value })
                }
                className="w-full mt-1 border rounded-md p-2 bg-background text-foreground"
              >
                <option value="month">Monthly</option>
                <option value="year">Annual</option>
              </select>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsPlanDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePlan}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Assign Subscription</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <select
                id="client"
                value={newSubscription.client_id}
                onChange={(e) =>
                  setNewSubscription({
                    ...newSubscription,
                    client_id: e.target.value,
                  })
                }
                className="w-full mt-1 border rounded-md p-2 bg-background text-foreground"
              >
                <option value="">Select...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <select
                id="plan"
                value={newSubscription.subscription_product_id}
                onChange={(e) =>
                  setNewSubscription({
                    ...newSubscription,
                    subscription_product_id: e.target.value,
                  })
                }
                className="w-full mt-1 border rounded-md p-2 bg-background text-foreground"
              >
                <option value="">Select...</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start date</Label>
              <DatePicker
                date={newSubscription.start_date}
                setDate={(date) =>
                  setNewSubscription({ ...newSubscription, start_date: date })
                }
              />
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setIsSubDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSubscription}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecurringPayments;
