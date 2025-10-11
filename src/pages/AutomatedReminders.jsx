import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MailWarning,
  Shield,
  TrendingUp,
  TrendingDown,
  User,
  AlertTriangle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/customSupabaseClient";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { differenceInDays, parseISO } from "date-fns";

const AutomatedReminders = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [riskyClients, setRiskyClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateRiskScore = (client, invoices) => {
    let score = 0;
    const clientInvoices = invoices.filter(
      (inv) => inv.client_id === client.id
    );
    const overdue = clientInvoices.filter((inv) => inv.status === "overdue");

    if (overdue.length > 0) score += overdue.length * 20;
    const totalOverdueAmount = overdue.reduce(
      (sum, inv) => sum + inv.amount,
      0
    );
    if (totalOverdueAmount > 1000) score += 30;
    if (totalOverdueAmount > 500) score += 15;

    const avgDelay =
      overdue.reduce(
        (sum, inv) =>
          sum + differenceInDays(new Date(), parseISO(inv.due_date)),
        0
      ) / overdue.length;
    if (avgDelay > 30) score += 20;
    if (avgDelay > 15) score += 10;

    return Math.min(100, score);
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];
    await supabase
      .from("invoices")
      .update({ status: "overdue" })
      .eq("user_id", user.id)
      .eq("status", "pending")
      .lt("due_date", today);

    const [
      { data: invoicesData, error: invoicesError },
      { data: clientsData, error: clientsError },
    ] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, client:clients(name)")
        .eq("user_id", user.id)
        .eq("status", "overdue")
        .order("due_date", { ascending: true }),
      supabase.from("clients").select("*").eq("user_id", user.id),
    ]);

    if (invoicesError || clientsError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load data.",
      });
      setLoading(false);
      return;
    }

    setOverdueInvoices(invoicesData);

    const clientsWithScores = clientsData
      .map((client) => ({
        ...client,
        risk_score: calculateRiskScore(client, invoicesData),
      }))
      .filter((c) => c.risk_score > 0)
      .sort((a, b) => b.risk_score - a.risk_score);

    setRiskyClients(clientsWithScores);
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendReminder = (invoiceId) => {
    toast({
      title: "Restart sent (simulation)",
      description: `A reminder email was sent for invoice #${invoiceId}.`,
    });
  };

  const getRiskColor = (score) => {
    if (score > 75) return "text-red-500";
    if (score > 40) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Reminders & Scoring Client
        </h1>
        <p className="text-muted-foreground">
          Identify risks and act on unpaid invoices.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur-sm border rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3 text-yellow-400" />
            Late Invoices
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              <p>Loading...</p>
            ) : (
              overdueInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">
                      Invoice #{invoice.invoice_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.client.name} - {invoice.amount}€ - Delay:{" "}
                      {differenceInDays(new Date(), parseISO(invoice.due_date))}{" "}
                      days
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSendReminder(invoice.invoice_number)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Restart
                  </Button>
                </div>
              ))
            )}
            {overdueInvoices.length === 0 && !loading && (
              <p className="text-muted-foreground text-center py-8">
                No overdue invoices. Well done!
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur-sm border rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-3 text-red-400" />
            At-Risk Clients
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              <p>Loading...</p>
            ) : (
              riskyClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {client.email}
                    </p>
                  </div>
                  <div
                    className={`text-lg font-bold ${getRiskColor(
                      client.risk_score
                    )}`}
                  >
                    Score: {client.risk_score}
                  </div>
                </div>
              ))
            )}
            {riskyClients.length === 0 && !loading && (
              <p className="text-muted-foreground text-center py-8">
                No risky clients detected.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AutomatedReminders;
