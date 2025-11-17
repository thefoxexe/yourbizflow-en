import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DatePicker } from '@/components/DatePicker';
import { PlusCircle, DollarSign, ArrowUp, ArrowDown, BrainCircuit, Loader2, Lock, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfToday, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const StatCard = ({ title, value, icon, valuePrefix = ''}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{valuePrefix}{value}</div>
    </CardContent>
  </Card>
);

const InsightsDialog = ({ isOpen, onOpenChange, insights, t }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <BrainCircuit className="w-6 h-6 text-primary" />
            {t('trading_journal.insights_dialog_title')}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {t('trading_journal.insights_dialog_desc')}
          </DialogDescription>
        </DialogHeader>
        <div 
          className="prose prose-invert prose-sm sm:prose-base max-h-[60vh] overflow-y-auto mt-4 p-4 rounded-lg bg-gray-800/50 text-gray-300" 
          dangerouslySetInnerHTML={{ __html: insights }}
        />
      </DialogContent>
    </Dialog>
  )
};

const TradeDialog = ({ isOpen, onOpenChange, trade, onSave, t }) => {
  const [currentTrade, setCurrentTrade] = useState({});

  useEffect(() => {
    if (trade) {
      setCurrentTrade({
        ...trade,
        open_date: trade.open_date ? new Date(trade.open_date) : new Date(),
        close_date: trade.close_date ? new Date(trade.close_date) : null
      });
    } else {
      setCurrentTrade({
        trade_type: 'long', asset: '', pnl_amount: '', pnl_percentage: '',
        open_date: new Date(), close_date: null, notes: ''
      });
    }
  }, [trade, isOpen]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTrade({ ...currentTrade, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setCurrentTrade({ ...currentTrade, [name]: value });
  };

  const handleDateChange = (name, date) => {
    setCurrentTrade({ ...currentTrade, [name]: date });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(currentTrade);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{trade ? t('trading_journal.edit_trade_title') : t('trading_journal.dialog_title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <Select onValueChange={(value) => handleSelectChange('trade_type', value)} value={currentTrade.trade_type || 'long'}>
            <SelectTrigger><SelectValue placeholder={t('trading_journal.dialog_trade_type_placeholder')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="long">{t('trading_journal.dialog_trade_type_long')}</SelectItem>
              <SelectItem value="short">{t('trading_journal.dialog_trade_type_short')}</SelectItem>
            </SelectContent>
          </Select>
          <Input name="asset" placeholder={t('trading_journal.dialog_asset_placeholder')} value={currentTrade.asset || ''} onChange={handleInputChange} />
          <Input name="pnl_amount" type="number" step="0.01" placeholder={t('trading_journal.dialog_pnl_amount_placeholder')} value={currentTrade.pnl_amount || ''} onChange={handleInputChange} />
          <Input name="pnl_percentage" type="number" step="0.01" placeholder={t('trading_journal.dialog_pnl_percentage_placeholder')} value={currentTrade.pnl_percentage || ''} onChange={handleInputChange} />
          <div><Label className="text-sm text-muted-foreground mb-2 block">{t('trading_journal.dialog_open_date_label')}</Label><DatePicker date={currentTrade.open_date} setDate={(date) => handleDateChange('open_date', date)} /></div>
          <div><Label className="text-sm text-muted-foreground mb-2 block">{t('trading_journal.dialog_close_date_label')}</Label><DatePicker date={currentTrade.close_date} setDate={(date) => handleDateChange('close_date', date)} /></div>
          <Textarea name="notes" placeholder={t('trading_journal.dialog_notes_placeholder')} value={currentTrade.notes || ''} onChange={handleInputChange} />
          <Button type="submit">{t('dialog_save')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};


const TradingJournal = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [deletingTrade, setDeletingTrade] = useState(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [insights, setInsights] = useState("");
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  
  const isFreePlan = profile?.subscription_plan?.name === 'Free';
  const tradeLimit = 10;
  const limitReached = isFreePlan && trades.length >= tradeLimit;

  const fetchTrades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trading_journal_entries')
      .select('*')
      .order('open_date', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('trading_journal.load_error') });
    } else {
      setTrades(data);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchTrades();
  }, []);

  const handleSaveTrade = async (tradeData) => {
    if (limitReached && !tradeData.id) {
      toast({
        variant: 'destructive',
        title: t('trading_journal.limit_reached_title'),
        description: t('trading_journal.limit_reached_desc', { max: tradeLimit }),
      });
      setIsDialogOpen(false);
      return;
    }

    if (!tradeData.asset || !tradeData.pnl_amount) {
      toast({ variant: 'destructive', title: t('toast_required_fields_title'), description: t('trading_journal.add_error_fields_required') });
      return;
    }
    
    const payload = { ...tradeData, user_id: user.id };
    let error;
    let successMessage;

    if (tradeData.id) {
        ({ error } = await supabase.from('trading_journal_entries').update(payload).eq('id', tradeData.id));
        successMessage = t('trading_journal.update_success');
    } else {
        ({ error } = await supabase.from('trading_journal_entries').insert(payload));
        successMessage = t('trading_journal.add_success');
    }

    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('trading_journal.save_error') });
    } else {
      toast({ title: t('toast_success_title'), description: successMessage });
      setIsDialogOpen(false);
      setEditingTrade(null);
      fetchTrades();
    }
  };

  const handleDeleteTrade = async (tradeId) => {
    if (!tradeId) return;
    const { error } = await supabase.from('trading_journal_entries').delete().eq('id', tradeId);
    if(error){
        toast({ variant: 'destructive', title: t('toast_error_title'), description: t('trading_journal.delete_error') });
    } else {
        toast({ title: t('toast_success_title'), description: t('trading_journal.delete_success') });
        fetchTrades();
    }
    setDeletingTrade(null);
  };
  
  const openDialog = (trade = null) => {
    setEditingTrade(trade);
    setIsDialogOpen(true);
  }

  const calculateStats = (filteredTrades) => {
    if (filteredTrades.length === 0) {
      return { pnl: 0, winRate: 0, lossRate: 0 };
    }
    const totalPnl = filteredTrades.reduce((acc, trade) => acc + (trade.pnl_amount || 0), 0);
    const winningTrades = filteredTrades.filter(trade => (trade.pnl_amount || 0) > 0).length;
    const winRate = (winningTrades / filteredTrades.length) * 100;
    const lossRate = 100 - winRate;
    return { pnl: totalPnl, winRate, lossRate };
  };

  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfToday();
    const thirtyDaysAgo = subDays(now, 30);

    const todayTrades = trades.filter(t => new Date(t.open_date) >= today);
    const monthTrades = trades.filter(t => new Date(t.open_date) >= thirtyDaysAgo);

    const detailedStats = {
      totalTrades: trades.length,
      winningTrades: trades.filter(t => t.pnl_amount > 0).length,
      losingTrades: trades.filter(t => t.pnl_amount <= 0).length,
      avgGain: trades.filter(t => t.pnl_amount > 0).reduce((sum, t) => sum + t.pnl_amount, 0) / (trades.filter(t => t.pnl_amount > 0).length || 1),
      avgLoss: trades.filter(t => t.pnl_amount <= 0).reduce((sum, t) => sum + t.pnl_amount, 0) / (trades.filter(t => t.pnl_amount <= 0).length || 1),
      biggestGain: Math.max(0, ...trades.map(t => t.pnl_amount)),
      biggestLoss: Math.min(0, ...trades.map(t => t.pnl_amount)),
    };

    return {
      allTime: calculateStats(trades),
      last30Days: calculateStats(monthTrades),
      today: calculateStats(todayTrades),
      detailed: detailedStats,
    };
  }, [trades]);

  const chartData = useMemo(() => {
    const sortedTrades = [...trades].sort((a, b) => new Date(a.open_date) - new Date(b.open_date));
    let cumulativePnl = 0;
    return sortedTrades.map(trade => {
      cumulativePnl += trade.pnl_amount || 0;
      return {
        date: format(parseISO(trade.open_date), 'dd/MM/yy'),
        pnl: cumulativePnl,
      };
    });
  }, [trades]);
  
  const handleInsights = async () => {
    if (limitReached) {
      toast({
        variant: 'destructive',
        title: 'Fonctionnalité Pro',
        description: 'Les Insights IA sont disponibles dans le plan Pro.',
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
        <p class="text-lg font-semibold">${t('trading_journal.insights_loading')}</p>
        <p class="text-sm text-muted-foreground">${t('trading_journal.insights_loading_desc')}</p>
      </div>
    `);

    try {
        const { data, error } = await supabase.functions.invoke('generate-trading-insights', {
            body: JSON.stringify({ trades: trades, lang: i18n.language }),
        });

        if (error) throw error;
        
        setInsights(data.insights);
    } catch (error) {
        setInsights(`<p>${t('trading_journal.insights_error')}</p>`);
        toast({
            variant: "destructive",
            title: "Erreur IA",
            description: t('trading_journal.insights_error_contact'),
        });
    } finally {
        setIsInsightsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <Helmet>
        <title>{t('trading_journal.title')} - YourBizFlow</title>
        <meta name="description" content={t('trading_journal.subtitle')} />
      </Helmet>

      <InsightsDialog isOpen={isInsightsOpen} onOpenChange={setIsInsightsOpen} insights={insights} t={t} />
      <TradeDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} trade={editingTrade} onSave={handleSaveTrade} t={t}/>
      <AlertDialog open={!!deletingTrade} onOpenChange={() => setDeletingTrade(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('trading_journal.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('trading_journal.delete_confirm_desc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('dialog_cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteTrade(deletingTrade)}>{t('billing.action_delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">{t('trading_journal.title')}</h1>
          <p className="text-muted-foreground">{t('trading_journal.subtitle')}</p>
        </motion.div>
        <Button onClick={() => openDialog(null)} disabled={limitReached}>
            {limitReached ? <Lock className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />} 
            {t('trading_journal.add_trade')}
        </Button>
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
              <p className="font-bold">{t('trading_journal.limit_reached_title')}</p>
              <p className="text-sm">{t('trading_journal.limit_reached_desc', { max: tradeLimit })}</p>
              <Button asChild variant="link" className="p-0 h-auto text-yellow-300 mt-1">
                <Link to="/subscription">{t('trading_journal.upgrade_now')}</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}


      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title={t('trading_journal.today')} value={stats.today.pnl.toFixed(2)} valuePrefix="$" icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title={t('trading_journal.last_30_days')} value={stats.last30Days.pnl.toFixed(2)} valuePrefix="$" icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title={t('trading_journal.all_time')} value={stats.allTime.pnl.toFixed(2)} valuePrefix="$" icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-xs sm:text-sm font-medium">{t('trading_journal.win_rate_total')}</CardTitle></CardHeader>
          <CardContent><div className="text-xl sm:text-2xl font-bold text-green-500">{stats.allTime.winRate.toFixed(1)}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-xs sm:text-sm font-medium">{t('trading_journal.winning_trades')}</CardTitle></CardHeader>
          <CardContent><div className="text-xl sm:text-2xl font-bold">{stats.detailed.winningTrades}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-xs sm:text-sm font-medium">{t('trading_journal.losing_trades')}</CardTitle></CardHeader>
          <CardContent><div className="text-xl sm:text-2xl font-bold">{stats.detailed.losingTrades}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-xs sm:text-sm font-medium">{t('trading_journal.total_trades')}</CardTitle></CardHeader>
          <CardContent><div className="text-xl sm:text-2xl font-bold">{stats.detailed.totalTrades} / {isFreePlan ? tradeLimit : '∞'}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('trading_journal.detailed_stats')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between"><span>{t('trading_journal.avg_gain')}</span><span className="font-bold text-green-500">${stats.detailed.avgGain.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>{t('trading_journal.avg_loss')}</span><span className="font-bold text-red-500">${stats.detailed.avgLoss.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>{t('trading_journal.biggest_gain')}</span><span className="font-bold text-green-500">${stats.detailed.biggestGain.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>{t('trading_journal.biggest_loss')}</span><span className="font-bold text-red-500">${stats.detailed.biggestLoss.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>{t('trading_journal.rr_ratio')}</span><span className="font-bold">{Math.abs(stats.detailed.avgGain / stats.detailed.avgLoss).toFixed(2) || 'N/A'}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('trading_journal.pnl_evolution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tick={{ dy: 5 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Line type="monotone" dataKey="pnl" name={t('trading_journal.cumulative_pnl')} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>{t('trading_journal.trade_history')}</CardTitle>
            <Button variant="outline" size="sm" onClick={handleInsights} disabled={isInsightsLoading || limitReached}>
              {isInsightsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
              {limitReached ? t('trading_journal.upgrade_for_ai') : t('trading_journal.ai_insights')}
            </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('trading_journal.asset')}</TableHead>
                  <TableHead className="text-right">{t('trading_journal.pnl_amount')}</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">{t('trading_journal.pnl_percentage')}</TableHead>
                  <TableHead className="text-right hidden md:table-cell">{t('trading_journal.date')}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center">{t('trading_journal.loading')}</TableCell></TableRow>
                ) : trades.length > 0 ? (
                  trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>
                        <div className="flex items-center">
                           <span className={`flex items-center justify-center rounded-full w-6 h-6 mr-2 ${trade.trade_type === 'long' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                             {trade.trade_type === 'long' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                           </span>
                           <span className="font-medium text-sm">{trade.asset}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-semibold text-sm ${trade.pnl_amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${trade.pnl_amount?.toFixed(2)}
                      </TableCell>
                      <TableCell className={`text-right text-sm hidden sm:table-cell ${trade.pnl_percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trade.pnl_percentage?.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm hidden md:table-cell">{format(new Date(trade.open_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openDialog(trade)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>{t('rental.edit')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingTrade(trade.id)} className="text-red-500 focus:text-red-500">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>{t('rental.delete')}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} className="text-center">{t('trading_journal.no_trades')}</TableCell></TableRow>
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