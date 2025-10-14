import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Pie, Cell, CartesianGrid, PieChart, Bar } from 'recharts';
import { format, subDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import StatsCard from '@/components/StatsCard';
import { DollarSign, Users, ShoppingCart, Activity, Loader2, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { fr, enUS } from 'date-fns/locale';

const Analytics = () => {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const { t, i18n } = useTranslation();
    const [stats, setStats] = useState({ totalRevenue: 0, newClients: 0, totalOrders: 0, avgOrderValue: 0, netProfit: 0, profitMargin: 0, totalExpenses: 0 });
    const [chartData, setChartData] = useState([]);
    const [revenueSources, setRevenueSources] = useState([]);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const currencySymbol = useMemo(() => {
        const currency = profile?.currency || 'eur';
        if (currency === 'usd') return '$';
        if (currency === 'chf') return 'CHF';
        return '€';
    }, [profile]);
    
    const dateLocale = i18n.language.startsWith('fr') ? fr : enUS;

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

        const [
            { data: revenuesData, error: revenuesError },
            { data: clientsData, error: clientsError },
            { data: ordersData, error: ordersError },
            { data: expensesData, error: expensesError },
        ] = await Promise.all([
            supabase.from('revenues').select('amount, revenue_date, source_type').eq('user_id', user.id).gte('revenue_date', thirtyDaysAgo),
            supabase.from('clients').select('created_at').eq('user_id', user.id).gte('created_at', thirtyDaysAgo),
            supabase.from('orders').select('total_amount, created_at').eq('user_id', user.id).gte('created_at', thirtyDaysAgo),
            supabase.from('expenses').select('amount, expense_date, category').eq('user_id', user.id).gte('expense_date', thirtyDaysAgo),
        ]);

        if (revenuesError || clientsError || ordersError || expensesError) {
            toast({ variant: 'destructive', title: t('toast_error_title'), description: t('analytics.load_error') });
            setLoading(false);
            return;
        }

        const totalRevenue = revenuesData.reduce((acc, curr) => acc + curr.amount, 0);
        const totalExpenses = expensesData.reduce((acc, curr) => acc + curr.amount, 0);
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        const totalOrders = ordersData.length;
        
        setStats({
            totalRevenue,
            totalExpenses,
            netProfit,
            profitMargin,
            newClients: clientsData.length,
            totalOrders,
            avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        });

        const dailyData = {};
        for (let i = 29; i >= 0; i--) {
            const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
            dailyData[date] = { date, revenues: 0, expenses: 0 };
        }
        revenuesData.forEach(r => {
            const date = format(new Date(r.revenue_date), 'yyyy-MM-dd');
            if (dailyData[date]) dailyData[date].revenues += r.amount;
        });
        expensesData.forEach(e => {
            const date = format(new Date(e.expense_date), 'yyyy-MM-dd');
            if (dailyData[date]) dailyData[date].expenses += e.amount;
        });
        setChartData(Object.values(dailyData).map(d => ({ ...d, date: format(new Date(d.date), 'dd MMM', { locale: dateLocale }) })));
        
        const groupedSources = revenuesData.reduce((acc, { source_type, amount }) => {
            const name = t(`analytics.source_${source_type || 'other'}`);
            acc[name] = (acc[name] || 0) + amount;
            return acc;
        }, {});
        setRevenueSources(Object.entries(groupedSources).map(([name, value]) => ({ name, value })));

        const groupedCategories = expensesData.reduce((acc, { category, amount }) => {
            const name = t(`expenses.category_${category?.toLowerCase()?.replace(/ /g, '_')}`, category || t('expenses.category_other'));
            acc[name] = (acc[name] || 0) + amount;
            return acc;
        }, {});
        setExpenseCategories(Object.entries(groupedCategories).map(([name, value]) => ({ name, value })));


        const { data: recent, error: recentError } = await supabase.rpc('get_recent_activity', { days_ago: 7 });
        if (!recentError) setRecentActivities(recent);

        setLoading(false);
    }, [user, toast, t, dateLocale]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#8b5cf6', '#f97316', '#14b8a6'];

    if(loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>
                <p className="text-muted-foreground">{t('analytics.subtitle_30_days')}</p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title={t('analytics.total_revenue')} value={`${currencySymbol}${stats.totalRevenue.toFixed(2)}`} icon={DollarSign} />
                <StatsCard title={t('analytics.net_profit')} value={`${currencySymbol}${stats.netProfit.toFixed(2)}`} icon={DollarSign} />
                <StatsCard title={t('analytics.profit_margin')} value={`${stats.profitMargin.toFixed(2)}%`} icon={BarChart2} />
                <StatsCard title={t('analytics.total_expenses')} value={`${currencySymbol}${stats.totalExpenses.toFixed(2)}`} icon={DollarSign} />
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.revenue_vs_expenses')}</CardTitle>
                        <CardDescription>{t('analytics.last_30_days')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${currencySymbol}${value}`} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value) => `${currencySymbol}${Number(value).toFixed(2)}`}/>
                                <Legend />
                                <Bar dataKey="revenues" name={t('analytics.revenues')} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name={t('analytics.expenses')} fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.revenue_sources')}</CardTitle>
                        <CardDescription>{t('analytics.last_30_days')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie data={revenueSources} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {revenueSources.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${currencySymbol}${Number(value).toFixed(2)}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.expense_categories')}</CardTitle>
                        <CardDescription>{t('analytics.last_30_days')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie data={expenseCategories} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {expenseCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${currencySymbol}${Number(value).toFixed(2)}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.recent_activity')}</CardTitle>
                        <CardDescription>{t('analytics.last_7_days_activity')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="p-2 bg-secondary rounded-full mr-4">
                                       <Activity className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-medium">{t(`analytics.activity_${activity.type}`, activity.details)}</p>
                                        <p className="text-sm text-muted-foreground">{format(new Date(activity.activity_time), 'dd MMM yyyy, HH:mm')}</p>
                                    </div>
                                    {activity.amount != null && (
                                        <div className={`font-semibold ${activity.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {activity.amount > 0 ? '+' : ''}{Number(activity.amount).toFixed(2)}{currencySymbol}
                                        </div>
                                    )}
                                </div>
                            )) : <p className="text-muted-foreground text-center">{t('analytics.no_recent_activity')}</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;