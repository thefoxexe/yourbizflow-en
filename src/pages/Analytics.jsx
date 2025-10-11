
    import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, FileText, TrendingUp, Repeat, Award, BrainCircuit, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell, LineChart, Line, PieChart } from 'recharts';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { format, subMonths, startOfMonth, getMonth, getYear, addMonths, differenceInMonths, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';

const Analytics = () => {
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    clientCount: 0,
    avgInvoice: 0,
    conversionRate: 0,
    monthlyRecurringRevenue: 0,
    clientLTV: 0,
  });
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [statusPieData, setStatusPieData] = useState([]);
  const [topClientsData, setTopClientsData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const currencySymbol = useMemo(() => {
    const currency = profile?.currency || 'eur';
    if (currency === 'usd') return '$';
    if (currency === 'chf') return 'CHF';
    return '€';
  }, [profile]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return;
      setLoading(true);

      const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
      const now = new Date();

      const [
        { data: clientsData, error: clientsError },
        { data: invoicesData, error: invoicesError },
        { data: quotesData, error: quotesError },
        { data: subscriptionsData, error: subscriptionsError },
        { data: revenuesData, error: revenuesError }
      ] = await Promise.all([
        supabase.from('clients').select('id, created_at, name').eq('user_id', user.id),
        supabase.from('invoices').select('amount, status, issue_date, client_id, due_date').eq('user_id', user.id),
        supabase.from('quotes').select('id, status').eq('user_id', user.id),
        supabase.from('customer_subscriptions').select('*, subscription_product_id(price, interval), start_date, canceled_at, status').eq('user_id', user.id),
        supabase.from('revenues').select('amount, revenue_date').eq('user_id', user.id)
      ]);

      if (clientsError || invoicesError || quotesError || subscriptionsError || revenuesError) {
        console.error("Error fetching analytics data:", clientsError || invoicesError || quotesError || subscriptionsError || revenuesError);
        setLoading(false);
        return;
      }

      const paidInvoices = invoicesData.filter(inv => inv.status === 'paid');
      const totalInvoiceRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const totalMiscRevenue = revenuesData.reduce((sum, rev) => sum + rev.amount, 0);
      
      let totalSubscriptionRevenue = 0;
      subscriptionsData.forEach(sub => {
        const startDate = new Date(sub.start_date);
        if (isBefore(startDate, now)) {
            const monthsActive = differenceInMonths(now, startDate) + 1;
            const pricePerMonth = sub.subscription_product_id.interval === 'year' ? sub.subscription_product_id.price / 12 : sub.subscription_product_id.price;
            totalSubscriptionRevenue += monthsActive * pricePerMonth;
        }
      });
      
      const totalRevenue = totalInvoiceRevenue + totalMiscRevenue + totalSubscriptionRevenue;
      const avgInvoice = paidInvoices.length > 0 ? totalInvoiceRevenue / paidInvoices.length : 0;
      
      const acceptedQuotes = quotesData.filter(q => q.status === 'accepted').length;
      const conversionRate = quotesData.length > 0 ? (acceptedQuotes / quotesData.length) * 100 : 0;

      const monthlyRecurringRevenue = subscriptionsData
        .filter(s => s.status === 'active')
        .reduce((acc, sub) => {
          if (sub.subscription_product_id.interval === 'month') return acc + sub.subscription_product_id.price;
          if (sub.subscription_product_id.interval === 'year') return acc + sub.subscription_product_id.price / 12;
          return acc;
      }, 0);

      const clientLTV = clientsData.length > 0 ? totalRevenue / clientsData.length : 0;

      setStats({
        totalRevenue,
        clientCount: clientsData.length,
        avgInvoice,
        conversionRate,
        monthlyRecurringRevenue,
        clientLTV,
      });

      const monthlyData = {};
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const monthKey = format(monthDate, 'yyyy-MM');
        const monthName = format(monthDate, 'MMM', { locale: fr });
        monthlyData[monthKey] = { name: monthName.charAt(0).toUpperCase() + monthName.slice(1), revenus: 0, clients: 0, date: monthDate };
      }

      const allRevenuesForChart = [
        ...paidInvoices.map(i => ({ amount: i.amount, date: i.due_date })),
        ...revenuesData.map(r => ({ amount: r.amount, date: r.revenue_date }))
      ];

      allRevenuesForChart.forEach(rev => {
        if (new Date(rev.date) >= sixMonthsAgo) {
          const monthKey = format(new Date(rev.date), 'yyyy-MM');
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].revenus += rev.amount;
          }
        }
      });

      subscriptionsData.forEach(sub => {
        const pricePerMonth = sub.subscription_product_id.interval === 'year' ? sub.subscription_product_id.price / 12 : sub.subscription_product_id.price;
        const subStartDate = new Date(sub.start_date);
        Object.entries(monthlyData).forEach(([key, monthDataItem]) => {
          const monthDate = new Date(key + '-01T00:00:00');
          if (getYear(subStartDate) < getYear(monthDate) || (getYear(subStartDate) === getYear(monthDate) && getMonth(subStartDate) <= getMonth(monthDate))) {
            if (sub.status === 'canceled') {
              const cancelDate = new Date(sub.canceled_at);
              if (getYear(cancelDate) > getYear(monthDate) || (getYear(cancelDate) === getYear(monthDate) && getMonth(cancelDate) > getMonth(monthDate))) {
                monthlyData[key].revenus += pricePerMonth;
              }
            } else {
              monthlyData[key].revenus += pricePerMonth;
            }
          }
        });
      });

      clientsData.forEach(client => {
        if (new Date(client.created_at) >= sixMonthsAgo) {
          const monthKey = format(new Date(client.created_at), 'yyyy-MM');
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].clients += 1;
          }
        }
      });
      
      const formattedChartData = Object.values(monthlyData);
      setRevenueChartData(formattedChartData);

      const statusCounts = invoicesData.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
      }, {});
      
      const pieData = [
        { name: 'Payées', value: statusCounts.paid || 0 },
        { name: 'En attente', value: statusCounts.pending || 0 },
        { name: 'En retard', value: statusCounts.overdue || 0 },
      ].filter(item => item.value > 0);
      setStatusPieData(pieData);

      const clientRevenue = paidInvoices.reduce((acc, inv) => {
        const client = clientsData.find(c => c.id === inv.client_id);
        if (client) {
          acc[client.name] = (acc[client.name] || 0) + inv.amount;
        }
        return acc;
      }, {});
      const sortedTopClients = Object.entries(clientRevenue)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, revenue]) => ({ name, revenue }));
      setTopClientsData(sortedTopClients);

      const lastMonthRevenue = formattedChartData[formattedChartData.length - 1]?.revenus || 0;
      const forecast = [];
      for (let i = 1; i <= 3; i++) {
        const futureMonth = addMonths(new Date(), i);
        const monthName = format(futureMonth, 'MMM', { locale: fr });
        const trend = (lastMonthRevenue - (formattedChartData[0]?.revenus || 0)) / 6;
        const predictedRevenue = Math.max(0, lastMonthRevenue + monthlyRecurringRevenue * i + trend * i);
        forecast.push({ name: monthName.charAt(0).toUpperCase() + monthName.slice(1), prévision: predictedRevenue });
      }
      setForecastData(forecast);

      const insights = [];
      const currentMonthRevenue = formattedChartData[formattedChartData.length - 1]?.revenus || 0;
      const prevMonthRevenue = formattedChartData[formattedChartData.length - 2]?.revenus || 0;
      if (currentMonthRevenue > prevMonthRevenue) {
        insights.push({ text: 'Les revenus sont en hausse ce mois-ci. Excellent travail !', type: 'positive' });
      } else {
        insights.push({ text: 'Les revenus ont légèrement baissé ce mois-ci. Analysons pourquoi.', type: 'negative' });
      }
      if (monthlyRecurringRevenue > 0) {
        insights.push({ text: `Votre MRR de ${monthlyRecurringRevenue.toLocaleString('fr-FR')} ${currencySymbol} assure une base solide.`, type: 'positive' });
      }
      if ((statusCounts.overdue || 0) > 0) {
        insights.push({ text: `Vous avez ${statusCounts.overdue} factures en retard. Pensez à les relancer.`, type: 'warning' });
      }
      if (sortedTopClients.length > 0) {
        insights.push({ text: `Votre meilleur client, ${sortedTopClients[0].name}, est un atout majeur.`, type: 'positive' });
      }
      setAiInsights(insights);

      setLoading(false);
    };

    fetchAnalyticsData();
  }, [user, currencySymbol]);

  const displayStats = [
    { title: 'Chiffre d\'affaires (Total)', value: `${currencySymbol}${stats.totalRevenue.toLocaleString('fr-FR')}`, change: '', icon: DollarSign },
    { title: 'Revenus Mensuels Récurrents', value: `${currencySymbol}${stats.monthlyRecurringRevenue.toLocaleString('fr-FR')}`, change: 'MRR', icon: Repeat },
    { title: 'Valeur Vie Client (LTV)', value: `${currencySymbol}${stats.clientLTV.toFixed(2)}`, change: '', icon: Award },
    { title: 'Taux de Conversion Devis', value: `${stats.conversionRate.toFixed(1)}%`, change: '', icon: TrendingUp }
  ];

  const barColor = theme === 'dark' ? '#8b5cf6' : '#7c3aed';
  const lineColor = theme === 'dark' ? '#34d399' : '#10b981';
  const forecastLineColor = theme === 'dark' ? '#60a5fa' : '#3b82f6';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = theme === 'dark' ? '#a1a1aa' : '#71717a';
  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const InsightIcon = ({ type }) => {
    switch (type) {
      case 'positive': return <ArrowUp className="w-5 h-5 text-green-500" />;
      case 'negative': return <ArrowDown className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytique IA</h1>
        <p className="text-muted-foreground">Votre copilote business pour des décisions éclairées.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayStats.map((stat, index) => (
          <StatsCard key={index} {...stat} loading={loading} />
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-sm border rounded-xl p-6">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-primary" /> Synthèse IA</h2>
        {loading ? <div className="h-24 bg-muted/50 rounded-md animate-pulse"></div> : (
          <div className="space-y-3">
            {aiInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <InsightIcon type={insight.type} />
                <p className="text-muted-foreground">{insight.text}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-sm border rounded-xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Revenus & Nouveaux Clients (6 derniers mois)</h2>
          <div style={{ width: '100%', height: 300 }}>
            {loading ? <div className="w-full h-full bg-muted/50 rounded-md animate-pulse"></div> : (
              <ResponsiveContainer>
                <BarChart data={revenueChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${currencySymbol}${value}`} />
                  <YAxis yAxisId="right" orientation="right" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar yAxisId="left" dataKey="revenus" name="Revenus" fill={barColor} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="clients" name="Nouveaux Clients" stroke={lineColor} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card/50 backdrop-blur-sm border rounded-xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Prévisions de Revenus (3 prochains mois)</h2>
          <div style={{ width: '100%', height: 300 }}>
            {loading ? <div className="w-full h-full bg-muted/50 rounded-md animate-pulse"></div> : (
              <ResponsiveContainer>
                <LineChart data={forecastData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${currencySymbol}${value}`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="prévision" name="Prévision" stroke={forecastLineColor} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2 bg-card/50 backdrop-blur-sm border rounded-xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Répartition des Factures</h2>
          <div style={{ width: '100%', height: 300 }}>
            {loading ? <div className="w-full h-full bg-muted/50 rounded-md animate-pulse"></div> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-3 bg-card/50 backdrop-blur-sm border rounded-xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Top 5 Clients par Revenus</h2>
          {loading ? <div className="h-72 bg-muted/50 rounded-md animate-pulse"></div> : (
            <div className="space-y-4">
              {topClientsData.map((client, index) => (
                <div key={index} className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">{index + 1}</span>
                    <p className="font-medium text-foreground">{client.name}</p>
                  </div>
                  <p className="font-semibold text-foreground">{currencySymbol}{client.revenue.toLocaleString('fr-FR')}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
  