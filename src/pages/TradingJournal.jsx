import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { supabase } from "@/lib/customSupabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/DatePicker";
import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUp,
  ArrowDown,
  BrainCircuit,
  Loader2,
  Lock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfToday, parseISO } from "date-fns";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, icon, valuePrefix = "" }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {valuePrefix}
        {value}
      </div>
    </CardContent>
  </Card>
);

const InsightsDialog = ({ isOpen, onOpenChange, insights }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <BrainCircuit className="w-6 h-6 text-primary" />
            Your AI Trading Insights
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Analysis of your performance to help you progress.
          </DialogDescription>
        </DialogHeader>
        <div
          className="prose prose-invert prose-sm sm:prose-base max-h-[60vh] overflow-y-auto mt-4 p-4 rounded-lg bg-gray-800/50 text-gray-300"
          dangerouslySetInnerHTML={{ __html: insights }}
        />
      </DialogContent>
    </Dialog>
  );
};

const TradingJournal = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [insights, setInsights] = useState("");
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [newTrade, setNewTrade] = useState({
    trade_type: "long",
    asset: "",
    pnl_amount: "",
    pnl_percentage: "",
    open_date: new Date(),
    close_date: null,
    notes: "",
  });

  const isFreePlan = profile?.subscription_plan?.name === "Free";
  const tradeLimit = 10;
  const limitReached = isFreePlan && trades.length >= tradeLimit;

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("trading_journal_entries")
      .select("*")
      .order("open_date", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load trades.",
      });
    } else {
      setTrades(data);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTrade({ ...newTrade, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setNewTrade({ ...newTrade, [name]: value });
  };

  const handleDateChange = (name, date) => {
    setNewTrade({ ...newTrade, [name]: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (limitReached) {
      toast({
        variant: "destructive",
        title: "Limit reached",
        description: "Upgrade to the Pro plan to add unlimited trades.",
      });
      setIsDialogOpen(false);
      return;
    }

    if (!newTrade.asset || !newTrade.pnl_amount) {
      toast({
        variant: "destructive",
        title: "Required fields",
        description: "Please complete Assets and P&L.",
      });
      return;
    }

    const { data, error } = await supabase
      .from("trading_journal_entries")
      .insert([{ ...newTrade, user_id: user.id }])
      .select();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to add trade.",
      });
    } else {
      toast({ title: "Success", description: "Trade added successfully." });
      setTrades([data[0], ...trades]);
      setIsDialogOpen(false);
      setNewTrade({
        trade_type: "long",
        asset: "",
        pnl_amount: "",
        pnl_percentage: "",
        open_date: new Date(),
        close_date: null,
        notes: "",
      });
    }
  };

  const calculateStats = (filteredTrades) => {
    if (filteredTrades.length === 0) {
      return { pnl: 0, winRate: 0, lossRate: 0 };
    }
    const totalPnl = filteredTrades.reduce(
      (acc, trade) => acc + (trade.pnl_amount || 0),
      0
    );
    const winningTrades = filteredTrades.filter(
      (trade) => (trade.pnl_amount || 0) > 0
    ).length;
    const winRate = (winningTrades / filteredTrades.length) * 100;
    const lossRate = 100 - winRate;
    return { pnl: totalPnl, winRate, lossRate };
  };
  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfToday();
    const thirtyDaysAgo = subDays(now, 30);

    const todayTrades = trades.filter((t) => new Date(t.open_date) >= today);
    const monthTrades = trades.filter(
      (t) => new Date(t.open_date) >= thirtyDaysAgo
    );

    const detailedStats = {
      totalTrades: trades.length,
      winningTrades: trades.filter((t) => t.pnl_amount > 0).length,
      losingTrades: trades.filter((t) => t.pnl_amount <= 0).length,
      avgGain:
        trades
          .filter((t) => t.pnl_amount > 0)
          .reduce((sum, t) => sum + t.pnl_amount, 0) /
        (trades.filter((t) => t.pnl_amount > 0).length || 1),
      avgLoss:
        trades
          .filter((t) => t.pnl_amount <= 0)
          .reduce((sum, t) => sum + t.pnl_amount, 0) /
        (trades.filter((t) => t.pnl_amount <= 0).length || 1),
      biggestGain: Math.max(0, ...trades.map((t) => t.pnl_amount)),
      biggestLoss: Math.min(0, ...trades.map((t) => t.pnl_amount)),
    };

    return {
      allTime: calculateStats(trades),
      last30Days: calculateStats(monthTrades),
      today: calculateStats(todayTrades),
      detailed: detailedStats,
    };
  }, [trades]);

  const chartData = useMemo(() => {
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.open_date) - new Date(b.open_date)
    );
    let cumulativePnl = 0;
    return sortedTrades.map((trade) => {
      cumulativePnl += trade.pnl_amount || 0;
      return {
        date: format(parseISO(trade.open_date), "dd/MM/yy"),
        pnl: cumulativePnl,
      };
    });
  }, [trades]);

  const handleInsights = async () => {
    if (limitReached) {
      toast({
        variant: "destructive",
        title: "Pro Feature",
        description: "AI Insights are available in the Pro plan.",
      });
      return;
    }

    setIsInsightsLoading(true);
    setIsInsightsOpen(true);
    setInsights(` 
<div class="flex flex-col items-center justify-center p-8 text-center"> 
<svg class="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> 
<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> 
<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> 
</svg> 
<p class="text-lg font-semibold">Analysis of your current performance...</p> 
<p class="text-sm text-muted-foreground">Our AI sifts through your data to find nuggets.</p> 
</div> 
`);

    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-trading-insights",
        {
          body: JSON.stringify({ trades: trades }),
        }
      );

      if (error) throw error;

      setInsights(data.insights);
    } catch (error) {
      setInsights(
        "<p>An error occurred while generating the analysis. Please try again.</p>"
      );
      toast({
        variant: "destructive",
        title: "AI error",
        description: "Unable to contact analytics service.",
      });
    } finally {
      setIsInsightsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Trading Journal - YourBizFlow</title>
        <meta
          name="description"
          content="Track and analyze your trading performance with precision."
        />
      </Helmet>

      <InsightsDialog
        isOpen={isInsightsOpen}
        onOpenChange={setIsInsightsOpen}
        insights={insights}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold">Trading Journal</h1>
          <p className="text-muted-foreground">
            Analyze your performance to optimize your strategy.
          </p>
        </motion.div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={limitReached}>
              {limitReached ? (
                <Lock className="mr-2 h-4 w-4" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              Add a Trade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Trade</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <Select
                onValueChange={(value) =>
                  handleSelectChange("trade_type", value)
                }
                defaultValue="long"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trade type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long / Purchase</SelectItem>
                  <SelectItem value="short">Shorts / Sale</SelectItem>
                </SelectContent>
              </Select>
              <Input
                name="asset"
                placeholder="Asset (ex: BTC/USD)"
                value={newTrade.asset}
                onChange={handleInputChange}
              />
              <Input
                name="pnl_amount"
                type="number"
                placeholder="P&L ($)"
                value={newTrade.pnl_amount}
                onChange={handleInputChange}
              />
              <Input
                name="pnl_percentage"
                type="number"
                placeholder="P&L (%)"
                value={newTrade.pnl_percentage}
                onChange={handleInputChange}
              />
              <DatePicker
                date={newTrade.open_date}
                setDate={(date) => handleDateChange("open_date", date)}
                label="Open Date"
              />
              <DatePicker
                date={newTrade.close_date}
                setDate={(date) => handleDateChange("close_date", date)}
                label="Closed date (optional)"
              />
              <Textarea
                name="notes"
                placeholder="Strategy Notes..."
                value={newTrade.notes}
                onChange={handleInputChange}
              />
              <Button type="submit">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {limitReached && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-300 p-4 rounded-md"
          role="alert"
        >
          <div className="flex items-center">
            <Lock className="h-5 w-5 mr-3" />
            <div>
              <p className="font-bold">Free plan limit reached</p>
              <p className="text-sm">
                You have reached the {tradeLimit} allowed trades. To add more
                and unlock AI analytics, upgrade to the Pro plan.
              </p>
              <Button
                asChild
                variant="link"
                className="p-0 h-auto text-yellow-300 mt-1"
              >
                <Link to="/subscription">Upgrade now</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Today"
          value={stats.today.pnl.toFixed(2)}
          valuePrefix="$"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Last 30 Days"
          value={stats.last30Days.pnl.toFixed(2)}
          valuePrefix="$"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="From the Beginning"
          value={stats.allTime.pnl.toFixed(2)}
          valuePrefix="$"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-medium">
              Win Rate (Total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-500">
              {stats.allTime.winRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-medium">
              Winning Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {stats.detailed.winningTrades}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-medium">
              Losing Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {stats.detailed.losingTrades}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {stats.detailed.totalTrades} / {isFreePlan ? tradeLimit : "∞"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detailed Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span>Average Gain</span>
              <span className="font-bold text-green-500">
                ${stats.detailed.avgGain.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average Loss</span>
              <span className="font-bold text-red-500">
                ${stats.detailed.avgLoss.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Biggest Gain</span>
              <span className="font-bold text-green-500">
                ${stats.detailed.biggestGain.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Biggest Loss</span>
              <span className="font-bold text-red-500">
                ${stats.detailed.biggestLoss.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Risk/Reward Ratio</span>
              <span className="font-bold">
                {Math.abs(
                  stats.detailed.avgGain / stats.detailed.avgLoss
                ).toFixed(2) || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Evolution of P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tick={{ dy: 5 }}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "14px" }} />
                <Line
                  type="monotone"
                  dataKey="pnl"
                  name="Cumulative P&L"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Trade History</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleInsights}
            disabled={isInsightsLoading || limitReached}
          >
            {isInsightsLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BrainCircuit className="mr-2 h-4 w-4" />
            )}
            {limitReached ? "Upgrade for AI" : "AI Insights"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">P&L ($)</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">
                    P&L (%)
                  </TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : trades.length > 0 ? (
                  trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <span
                            className={`flex items-center justify-center rounded-full w-6 h-6 mr-2 ${
                              trade.trade_type === "long"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-orange-500/20 text-orange-400"
                            }`}
                          >
                            {trade.trade_type === "long" ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )}
                          </span>
                          <span className="font-medium text-sm">
                            {trade.asset}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold text-sm ${
                          trade.pnl_amount >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        ${trade.pnl_amount?.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={`text-right text-sm hidden sm:table-cell ${
                          trade.pnl_percentage >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {trade.pnl_percentage?.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm hidden md:table-cell">
                        {format(new Date(trade.open_date), "dd/MM/yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No trades recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingJournal;
