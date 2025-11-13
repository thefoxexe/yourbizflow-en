import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign,
  Users, 
  FileText, 
  Clock,
  CheckCircle,
  UserPlus,
  FilePlus,
  Repeat,
  Eye,
  EyeOff
} from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { format, subMonths, startOfMonth, getMonth, getYear, differenceInMonths, isBefore } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip as ShadTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';


const Dashboard = () => {
  const { user, isModuleActive, profile } = useAuth();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    clientCount: 0,
    pendingInvoices: 0,
    pendingAmount: 0,
    monthlyRecurringRevenue: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  const dateLocale = i18n.language.startsWith('fr') ? fr : enUS;

  const currencySymbol = useMemo(() => {
    if (!profile) return '€';
    const currency = profile.currency || 'eur';
    if (currency === 'usd') return '$';
    if (currency === 'chf') return 'CHF';
    return '€';
  }, [profile]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!user || !profile) {
      setLoading(false);
      return
    };
    setLoading(true);

    try {
        const [
          { data: clientsData, error: clientsError },
          { data: invoicesData, error: invoicesError },
          { data: revenuesData, error: revenuesError },
          { data: subscriptionsData, error: subscriptionsError }
        ] = await Promise.all([
          supabase.from('clients').select('id, created_at, name', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('invoices').select('amount, status, issue_date, due_date, created_at, invoice_number').eq('user_id', user.id),
          supabase.from('revenues').select('amount, revenue_date').eq('user_id', user.id),
          supabase.from('customer_subscriptions').select('*, subscription_product_id(price, interval)').eq('user_id', user.id)
        ]);

        if (clientsError || invoicesError || subscriptionsError || revenuesError) {
          console.error("Error fetching dashboard data:", clientsError || invoicesError || subscriptionsError || revenuesError);
          setLoading(false);
          return;
        }

        const paidInvoices = invoicesData.filter(inv => inv.status === 'paid');
        const totalInvoiceRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const totalMiscRevenue = revenuesData.reduce((sum, rev) => sum + rev.amount, 0);
        
        let totalSubscriptionRevenue = 0;
        const now = new Date();
        if (subscriptionsData) {
            subscriptionsData.forEach(sub => {
                if (sub.subscription_product_id) {
                    const startDate = new Date(sub.start_date);
                    if (isBefore(startDate, now)) {
                        const monthsActive = differenceInMonths(now, startDate) + 1;
                        const pricePerMonth = sub.subscription_product_id.interval === 'year' ? sub.subscription_product_id.price / 12 : sub.subscription_product_id.price;
                        totalSubscriptionRevenue += monthsActive * pricePerMonth;
                    }
                }
            });
        }

        const totalRevenue = totalInvoiceRevenue + totalMiscRevenue + totalSubscriptionRevenue;
        
        const pendingInvoices = invoicesData.filter(inv => inv.status === 'pending').length;
        const pendingAmount = invoicesData.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);

        const monthlyRecurringRevenue = (subscriptionsData || [])
          .filter(s => s.status === 'active' && s.subscription_product_id)
          .reduce((acc, sub) => {
            if (sub.subscription_product_id.interval === 'month') {
              return acc + sub.subscription_product_id.price;
            }
            if (sub.subscription_product_id.interval === 'year') {
              return acc + sub.subscription_product_id.price / 12;
            }
            return acc;
        }, 0);

        setStats({
          totalRevenue,
          clientCount: clientsData.length,
          pendingInvoices,
          pendingAmount,
          monthlyRecurringRevenue,
        });

        const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
        const monthlyRevenue = {};
        for (let i = 0; i < 6; i++) {
          const monthDate = subMonths(new Date(), i);
          const monthKey = format(monthDate, 'MMM', { locale: dateLocale });
          monthlyRevenue[monthKey] = {
            date: monthDate,
            Revenus: 0
          };
        }
        
        const allRevenues = [
          ...paidInvoices.map(i => ({ amount: i.amount, date: i.due_date })),
          ...revenuesData.map(r => ({ amount: r.amount, date: r.revenue_date }))
        ];

        allRevenues
          .filter(rev => new Date(rev.date) >= sixMonthsAgo)
          .forEach(rev => {
            const month = format(new Date(rev.date), 'MMM', { locale: dateLocale });
            if (monthlyRevenue.hasOwnProperty(month)) {
              monthlyRevenue[month].Revenus += rev.amount;
            }
          });
        
        if (subscriptionsData) {
            subscriptionsData.forEach(sub => {
                if (sub.subscription_product_id) {
                    const pricePerMonth = sub.subscription_product_id.interval === 'year' ? sub.subscription_product_id.price / 12 : sub.subscription_product_id.price;
                    const subStartDate = new Date(sub.start_date);
                    Object.values(monthlyRevenue).forEach(monthData => {
                        if (getYear(subStartDate) < getYear(monthData.date) || (getYear(subStartDate) === getYear(monthData.date) && getMonth(subStartDate) <= getMonth(monthData.date))) {
                        monthData.Revenus += pricePerMonth;
                        }
                    });
                }
            });
        }

        const formattedChartData = Object.entries(monthlyRevenue).map(([month, data]) => ({
          name: month.charAt(0).toUpperCase() + month.slice(1),
          Revenus: data.Revenus,
        })).reverse();
        setChartData(formattedChartData);

        const clientActivities = clientsData.map(c => ({ type: 'client', ...c, date: c.created_at }));
        const invoiceActivities = invoicesData.map(i => ({ type: 'invoice', ...i, date: i.created_at }));
        const allActivities = [...clientActivities, ...invoiceActivities]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        setRecentActivity(allActivities);
    } catch (error) {
        console.error("An error occurred during data fetching:", error);
    } finally {
        setLoading(false);
    }
  }, [user, profile, dateLocale]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getDisplayStats = () => {
    const baseStats = [
      { title: t('dashboard_stat_revenue'), value: `${currencySymbol}${stats.totalRevenue.toLocaleString('fr-FR')}`, change: '', icon: DollarSign, isSensitive: true },
      { title: t('dashboard_stat_pending_invoices'), value: `${currencySymbol}${stats.pendingAmount.toLocaleString('fr-FR')}`, change: t('dashboard_stat_invoices_count', { count: stats.pendingInvoices }), icon: FileText, isSensitive: true },
      { title: t('dashboard_stat_time', { date: format(currentTime, 'eeee d MMMM', { locale: dateLocale }) }), value: format(currentTime, 'HH:mm:ss'), change: '', icon: Clock, isTime: true, isSensitive: false }
    ];

    if (isModuleActive('recurring-payments')) {
      baseStats.splice(1, 0, { title: t('dashboard_stat_mrr'), value: `${currencySymbol}${stats.monthlyRecurringRevenue.toLocaleString('fr-FR')}`, change: 'MRR', icon: Repeat, isSensitive: true });
    }
    
    return baseStats;
  };

  const displayStats = getDisplayStats();

  const renderActivityIcon = (type) => {
    switch(type) {
      case 'client': return <UserPlus className="w-5 h-5 text-blue-400" />;
      case 'invoice': return <FilePlus className="w-5 h-5 text-green-400" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return t('dashboard_time_ago_years', { count: Math.floor(interval) });
    interval = seconds / 2592000;
    if (interval > 1) return t('dashboard_time_ago_months', { count: Math.floor(interval) });
    interval = seconds / 86400;
    if (interval > 1) return t('dashboard_time_ago_days', { count: Math.floor(interval) });
    interval = seconds / 3600;
    if (interval > 1) return t('dashboard_time_ago_hours', { count: Math.floor(interval) });
    interval = seconds / 60;
    if (interval > 1) return t('dashboard_time_ago_minutes', { count: Math.floor(interval) });
    return t('dashboard_time_ago_seconds');
  };

  const barColor = theme === 'dark' ? '#60a5fa' : '#3b82f6';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = theme === 'dark' ? '#a1a1aa' : '#71717a';

  const gridColsClass = displayStats.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

  return (
    <div className="space-y-8">
      <Helmet>
        <title>{t('dashboard_title')} - {t('app_name')}</title>
        <meta name="description" content={t('dashboard_subtitle')} />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('dashboard_title')}</h1>
            <p className="text-muted-foreground">{t('dashboard_subtitle')}</p>
          </div>
          <TooltipProvider>
            <ShadTooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsPrivacyMode(!isPrivacyMode)}>
                  {isPrivacyMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPrivacyMode ? t('dashboard_privacy_show') : t('dashboard_privacy_hide')}</p>
              </TooltipContent>
            </ShadTooltip>
          </TooltipProvider>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cn("grid grid-cols-1 sm:grid-cols-2 gap-6", gridColsClass)}>
        {displayStats.map((stat, index) => (
          <StatsCard 
            key={index} 
            {...stat} 
            loading={loading && !stat.isTime}
            isBlurred={isPrivacyMode && stat.isSensitive}
          />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-card/50 backdrop-blur-sm border rounded-xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">{t('dashboard_chart_title')}</h2>
          <div style={{ width: '100%', height: 300 }}>
            {loading ? (
              <div className="w-full h-full bg-muted/50 rounded-md animate-pulse"></div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke={textColor} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => isPrivacyMode ? `${currencySymbol}****` : `${currencySymbol}${value}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(147, 197, 253, 0.1)' }} 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} 
                    formatter={(value) => isPrivacyMode ? `${currencySymbol}****` : `${currencySymbol}${value.toLocaleString('fr-FR')}`} 
                  />
                  <Legend content={() => <p className="text-center text-sm text-muted-foreground">{t('dashboard_chart_revenue_label')}</p>} />
                  <Bar dataKey="Revenus" fill={barColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-sm border rounded-xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">{t('dashboard_activity_title')}</h2>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted/50 rounded-md animate-pulse"></div>)}
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <motion.div 
                  key={activity.type + index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="bg-secondary p-2 rounded-full">
                    {renderActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {activity.type === 'client' ? t('dashboard_activity_new_client', { name: activity.name }) : t('dashboard_activity_new_invoice', { number: activity.invoice_number })}
                    </p>
                    <p className="text-muted-foreground text-xs">{formatTimeAgo(activity.date)}</p>
                  </div>
                </motion.div>
              )) : <p className="text-muted-foreground text-sm text-center mt-8">{t('dashboard_activity_no_activity')}</p>}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;