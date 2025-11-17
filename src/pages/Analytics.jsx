import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/hooks/use-toast';
    import { BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Pie, Cell, CartesianGrid, PieChart, Bar } from 'recharts';
    import { format, subDays, startOfDay } from 'date-fns';
    import { useTranslation } from 'react-i18next';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import StatsCard from '@/components/StatsCard';
    import { DollarSign, Users, Activity, Loader2, BarChart2, TrendingUp, Cpu } from 'lucide-react';
    import { fr, enUS } from 'date-fns/locale';

    const Analytics = () => {
        const { user, profile, getPlan } = useAuth();
        const { toast } = useToast();
        const { t, i18n } = useTranslation();
        const [stats, setStats] = useState({ 
            totalRevenue: 0, newClients: 0, netProfit: 0, profitMargin: 0, totalExpenses: 0,
            revenueChange: null, profitChange: null, expensesChange: null,
            aiSummary: ''
        });
        const [chartData, setChartData] = useState([]);
        const [revenueSources, setRevenueSources] = useState([]);
        const [expenseCategories, setExpenseCategories] = useState([]);
        const [recentActivities, setRecentActivities] = useState([]);
        const [loading, setLoading] = useState(true);
        const plan = getPlan();

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

            const sixtyDaysAgo = format(subDays(new Date(), 60), 'yyyy-MM-dd');

            const [
                { data: revenuesData, error: revenuesError },
                { data: clientsData, error: clientsError },
                { data: expensesData, error: expensesError },
            ] = await Promise.all([
                supabase.from('revenues').select('amount, revenue_date, source_type').eq('user_id', user.id).gte('revenue_date', sixtyDaysAgo),
                supabase.from('clients').select('created_at').eq('user_id', user.id).gte('created_at', format(subDays(new Date(), 30), 'yyyy-MM-dd')),
                supabase.from('expenses').select('amount, expense_date, category').eq('user_id', user.id).gte('expense_date', sixtyDaysAgo),
            ]);

            if (revenuesError || clientsError || expensesError) {
                toast({ variant: 'destructive', title: t('toast_error_title'), description: t('analytics.load_error') });
                setLoading(false);
                return;
            }

            const today = startOfDay(new Date());
            const thirtyDaysAgo = startOfDay(subDays(today, 30));

            const currentPeriodRevenues = revenuesData.filter(r => new Date(r.revenue_date) >= thirtyDaysAgo);
            const previousPeriodRevenues = revenuesData.filter(r => new Date(r.revenue_date) < thirtyDaysAgo);
            const currentPeriodExpenses = expensesData.filter(e => new Date(e.expense_date) >= thirtyDaysAgo);
            const previousPeriodExpenses = expensesData.filter(e => new Date(e.expense_date) < thirtyDaysAgo);

            const totalRevenueCurrent = currentPeriodRevenues.reduce((acc, curr) => acc + curr.amount, 0);
            const totalExpensesCurrent = currentPeriodExpenses.reduce((acc, curr) => acc + curr.amount, 0);
            const netProfitCurrent = totalRevenueCurrent - totalExpensesCurrent;
            
            const totalRevenuePrevious = previousPeriodRevenues.reduce((acc, curr) => acc + curr.amount, 0);
            const totalExpensesPrevious = previousPeriodExpenses.reduce((acc, curr) => acc + curr.amount, 0);
            const netProfitPrevious = totalRevenuePrevious - totalExpensesPrevious;

            const calculateChange = (current, previous) => {
                if (previous === 0) return current > 0 ? '+100.0%' : '+0.0%';
                const change = ((current - previous) / previous) * 100;
                return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
            };

            setStats(prev => ({
                ...prev,
                totalRevenue: totalRevenueCurrent,
                totalExpenses: totalExpensesCurrent,
                netProfit: netProfitCurrent,
                profitMargin: totalRevenueCurrent > 0 ? (netProfitCurrent / totalRevenueCurrent) * 100 : 0,
                newClients: clientsData.length,
                revenueChange: calculateChange(totalRevenueCurrent, totalRevenuePrevious),
                profitChange: calculateChange(netProfitCurrent, netProfitPrevious),
                expensesChange: calculateChange(totalExpensesCurrent, totalExpensesPrevious),
            }));

            // Chart data for the last 30 days
            const dailyData = {};
            for (let i = 29; i >= 0; i--) {
                const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
                dailyData[date] = { date, revenues: 0, expenses: 0 };
            }
            currentPeriodRevenues.forEach(r => {
                const date = format(new Date(r.revenue_date), 'yyyy-MM-dd');
                if (dailyData[date]) dailyData[date].revenues += r.amount;
            });
            currentPeriodExpenses.forEach(e => {
                const date = format(new Date(e.expense_date), 'yyyy-MM-dd');
                if (dailyData[date]) dailyData[date].expenses += e.amount;
            });
            setChartData(Object.values(dailyData).map(d => ({ ...d, date: format(new Date(d.date), 'dd MMM', { locale: dateLocale }) })));
            
            const groupedSources = currentPeriodRevenues.reduce((acc, { source_type, amount }) => {
                const name = t(`analytics.source_${source_type || 'other'}`, { defaultValue: t('analytics.source_other') });
                acc[name] = (acc[name] || 0) + amount;
                return acc;
            }, {});
            setRevenueSources(Object.entries(groupedSources).map(([name, value]) => ({ name, value })));

            const groupedCategories = currentPeriodExpenses.reduce((acc, { category, amount }) => {
                const name = t(`expenses.category_${category?.toLowerCase()?.replace(/ /g, '_')}`, category || t('expenses.category_other'));
                acc[name] = (acc[name] || 0) + amount;
                return acc;
            }, {});
            setExpenseCategories(Object.entries(groupedCategories).map(([name, value]) => ({ name, value })));


            const { data: recent, error: recentError } = await supabase.rpc('get_recent_activity', { days_ago: 7 });
            if (!recentError) setRecentActivities(recent);

            setLoading(false);
            
            if (plan.name !== 'Free') {
                const { data: aiSummary, error: aiError } = await supabase.functions.invoke('ai-writing-assistant', {
                  body: {
                    context: 'business_summary',
                    userInput: `Current revenue: ${totalRevenueCurrent.toFixed(2)}, Previous revenue: ${totalRevenuePrevious.toFixed(2)}. Current expenses: ${totalExpensesCurrent.toFixed(2)}, Previous expenses: ${totalExpensesPrevious.toFixed(2)}. Give a short, encouraging summary in ${i18n.language}.`
                  },
                });

                if (!aiError) {
                    setStats(prev => ({ ...prev, aiSummary: aiSummary.suggestion }));
                }
            }
        }, [user, toast, t, dateLocale, plan, i18n.language]);

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
                    <StatsCard title={t('analytics.total_revenue')} value={`${currencySymbol}${stats.totalRevenue.toFixed(2)}`} change={stats.revenueChange} icon={DollarSign} />
                    <StatsCard title={t('analytics.net_profit')} value={`${currencySymbol}${stats.netProfit.toFixed(2)}`} change={stats.profitChange} icon={TrendingUp} changeColor={stats.netProfit < 0 ? 'text-red-500' : 'text-green-500'} />
                    <StatsCard title={t('analytics.profit_margin')} value={`${stats.profitMargin.toFixed(2)}%`} icon={BarChart2} />
                    <StatsCard title={t('analytics.new_clients')} value={`${stats.newClients}`} icon={Users} />
                </div>
                
                {plan.name !== 'Free' && stats.aiSummary && (
                  <Card className="bg-blue-900/20 border-blue-500/30">
                    <CardHeader className="flex flex-row items-center gap-4">
                       <Cpu className="w-8 h-8 text-blue-400" />
                       <div>
                         <CardTitle className="text-blue-300">Synthèse IA</CardTitle>
                         <CardDescription className="text-blue-400/80">Un aperçu de vos performances par notre IA.</CardDescription>
                       </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-blue-300/90">{stats.aiSummary}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('analytics.revenue_vs_expenses')}</CardTitle>
                            <CardDescription>{t('analytics.last_30_days')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
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
                                    <Tooltip formatter={(value) => `${currencySymbol}${Number(value).toFixed(2)}`} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
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
                                    <Tooltip formatter={(value) => `${currencySymbol}${Number(value).toFixed(2)}`} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
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
                            <div className="space-y-4 max-h-[350px] overflow-y-auto">
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