import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/customSupabaseClient";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/DatePicker";
import { Landmark, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";

const Revenues = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [revenues, setRevenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRevenue, setNewRevenue] = useState({
    amount: "",
    description: "",
    revenue_date: new Date(),
  });

  const currencySymbol = useMemo(() => {
    const currency = profile?.currency || "eur";
    if (currency === "usd") return "$";
    if (currency === "chf") return "CHF";
    return "€";
  }, [profile]);

  const fetchRevenues = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("revenues")
      .select("*")
      .eq("user_id", user.id)
      .order("revenue_date", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load revenue.",
      });
    } else {
      setRevenue(data);
    }
    setIsLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchRevenues();
  }, [fetchRevenues]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRevenue((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setNewRevenue((prev) => ({ ...prev, revenue_date: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRevenue.amount || !newRevenue.description) {
      toast({
        variant: "destructive",
        title: "Required fields",
        description: "Amount and description are required.",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("revenues").insert({
      ...newRevenue,
      user_id: user.id,
      amount: parseFloat(newRevenue.amount),
      revenue_date: format(newRevenue.revenue_date, "yyyy-MM-dd"),
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to add money entry.",
      });
    } else {
      toast({ title: "Success", description: "Money entry added." });
      setNewRevenue({ amount: "", description: "", revenue_date: new Date() });
      await fetchRevenues();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("revenues").delete().eq("id", id);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to delete entry.",
      });
    } else {
      toast({ title: "Success", description: "Entry deleted." });
      await fetchRevenues();
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-2">
          <Landmark className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Money Inflows</h1>
        </div>
        <p className="text-muted-foreground">
          Quickly record all your miscellaneous cash receipts.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Add entry</CardTitle>
              <CardDescription>
                Enter the details of the cash receipt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ({currencySymbol})</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="ex: 150.00"
                    value={newRevenue.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    placeholder="ex: Exceptional sale"
                    value={newRevenue.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <DatePicker
                    date={newRevenue.revenue_date}
                    setDate={handleDateChange}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  Add entry
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Entry history</CardTitle>
              <CardDescription>
                List of all your recorded cash receipts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[60vh] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan="4" className="text-center h-24">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : revenues.length > 0 ? (
                      revenues.map((revenue) => (
                        <TableRow key={revenue.id}>
                          <TableCell>
                            {format(
                              new Date(revenue.revenue_date),
                              "dd/MM/yyyy"
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {revenue.description}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-500">
                            {revenue.amount.toFixed(2)} {currencySymbol}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(revenue.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan="4"
                          className="text-center h-24 text-muted-foreground"
                        >
                          No money entry recorded.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
export default Revenues;
