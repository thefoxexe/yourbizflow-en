import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  TrendingUp, 
  Users as UsersIcon, 
  Bell, 
  Send,
  Crown,
  Briefcase,
  Calendar
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import logoYourBizFlow from '@/assets/logo-yourbizflow.png';
import ImageUploadZone from '@/components/ImageUploadZone';

const AdminPanel = () => {
  const [stats, setStats] = useState({ Free: 0, Pro: 0, Business: 0, total: 0 });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [selectedTarget, setSelectedTarget] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [contentImages, setContentImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  // Date filters
  const [dateFilter, setDateFilter] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Chart data
  const [chartData, setChartData] = useState([]);
  const [planChartData, setPlanChartData] = useState([]);
  
  const [growthStats, setGrowthStats] = useState({
    newUsersThisMonth: 0,
    conversionRate: 0,
    paidUsers: 0,
    freeUsers: 0
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterPlan !== 'all') {
      filtered = filtered.filter(user => {
        const planName = user.subscription_plan?.name || 'Free';
        return planName.toLowerCase() === filterPlan.toLowerCase();
      });
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filterPlan, users]);

  useEffect(() => {
    if (users.length > 0) {
      generateChartData();
    }
  }, [users, dateFilter, customStartDate, customEndDate]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/admin-login');
      return;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (error || !data) {
      navigate('/admin-login');
    }
  };

  const getDateRange = () => {
    const now = new Date();
    let start, end;

    switch (dateFilter) {
      case '7days':
        start = subDays(now, 7);
        end = now;
        break;
      case 'thisWeek':
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case '30days':
        start = subDays(now, 30);
        end = now;
        break;
      case 'thisMonth':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case '3months':
        start = subMonths(now, 3);
        end = now;
        break;
      case '6months':
        start = subMonths(now, 6);
        end = now;
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          start = parseISO(customStartDate);
          end = parseISO(customEndDate);
        } else {
          start = subDays(now, 30);
          end = now;
        }
        break;
      default:
        start = subDays(now, 30);
        end = now;
    }

    return { start, end };
  };

  const generateChartData = () => {
    const { start, end } = getDateRange();
    
    // Filter users by date range
    const filteredByDate = users.filter(user => {
      const userDate = parseISO(user.created_at);
      return userDate >= start && userDate <= end;
    });

    // Generate daily or monthly intervals based on range
    const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    const useMonthly = daysDiff > 60;

    const intervals = useMonthly 
      ? eachMonthOfInterval({ start, end })
      : eachDayOfInterval({ start, end });

    // Count users by interval
    const data = intervals.map(date => {
      const dateStr = useMonthly ? format(date, 'MMM yyyy', { locale: fr }) : format(date, 'dd MMM', { locale: fr });
      
      const usersOnDate = filteredByDate.filter(user => {
        const userDate = parseISO(user.created_at);
        if (useMonthly) {
          return userDate.getMonth() === date.getMonth() && userDate.getFullYear() === date.getFullYear();
        } else {
          return format(userDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        }
      });

      const free = usersOnDate.filter(u => (u.subscription_plan?.name || 'Free') === 'Free').length;
      const pro = usersOnDate.filter(u => u.subscription_plan?.name === 'Pro').length;
      const business = usersOnDate.filter(u => u.subscription_plan?.name === 'Business').length;

      return {
        date: dateStr,
        total: usersOnDate.length,
        Free: free,
        Pro: pro,
        Business: business,
      };
    });

    setChartData(data);

    // Plan distribution data
    const planData = [
      { name: 'Free', value: stats.Free, color: '#3b82f6' },
      { name: 'Pro', value: stats.Pro, color: '#a855f7' },
      { name: 'Business', value: stats.Business, color: '#22c55e' },
    ];
    setPlanChartData(planData);
  };

  const fetchStats = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('subscription_plan:subscription_plan_id(name), created_at');

      if (error) throw error;

      const planCounts = { Free: 0, Pro: 0, Business: 0, total: profiles.length };
      let paidCount = 0;
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      let newThisMonth = 0;

      profiles.forEach((profile) => {
        const planName = profile.subscription_plan?.name || 'Free';
        if (planCounts.hasOwnProperty(planName)) {
          planCounts[planName]++;
        }
        if (planName === 'Pro' || planName === 'Business') {
          paidCount++;
        }
        if (new Date(profile.created_at) >= thisMonth) {
          newThisMonth++;
        }
      });

      const conversionRate = planCounts.total > 0 
        ? ((paidCount / planCounts.total) * 100).toFixed(1)
        : 0;

      setStats(planCounts);
      setGrowthStats({
        newUsersThisMonth: newThisMonth,
        conversionRate: parseFloat(conversionRate),
        paidUsers: paidCount,
        freeUsers: planCounts.Free
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, subscription_plan:subscription_plan_id(name), created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading users',
          description: error.message,
        });
        return;
      }
      
      const usersData = (profiles || []).map(profile => ({
        ...profile,
        firstName: profile.full_name?.split(' ')[0] || '',
        lastName: profile.full_name?.split(' ').slice(1).join(' ') || ''
      }));

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredUsers.map(user => ({
      'Prénom': user.firstName,
      'Nom': user.lastName,
      'Email': user.email,
      'Plan': user.subscription_plan?.name || 'Free',
      'Date d\'inscription': new Date(user.created_at).toLocaleDateString('fr-FR')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, `yourbizflow-users-${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: 'Export réussi',
      description: `${filteredUsers.length} utilisateurs exportés`,
    });
  };

  const sendNotification = async () => {
    if (!notificationTitle || !notificationMessage) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
      });
      return;
    }

    setIsSending(true);

    try {
      let userIds = [];
      
      if (selectedTarget === 'all') {
        userIds = users.map((u) => u.id);
      } else if (selectedTarget === 'plan') {
        userIds = users
          .filter((u) => (u.subscription_plan?.name || 'Free') === selectedPlan)
          .map((u) => u.id);
      } else if (selectedTarget === 'user') {
        userIds = [selectedUser];
      }

      if (userIds.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Aucun utilisateur sélectionné',
        });
        setIsSending(false);
        return;
      }

      const notifications = userIds.map((userId) => ({
        user_id: userId,
        title: notificationTitle,
        message: notificationMessage,
        type: 'info',
        image_url: bannerImage || null,
        content_images: contentImages.length > 0 ? contentImages : null,
        read: false,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('notifications').insert(notifications);

      if (error) throw error;

      toast({
        title: 'Notifications envoyées',
        description: `${userIds.length} notification(s) envoyée(s) avec succès`,
      });

      setNotificationTitle('');
      setNotificationMessage('');
      setBannerImage('');
      setContentImages([]);
      setSelectedTarget('all');
      setSelectedPlan('');
      setSelectedUser('');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-40">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoYourBizFlow} alt="YourBizFlow Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              YourBizFlow
            </h1>
          </div>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Retour au Dashboard
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl p-4 sm:p-6">
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="stats">
              <TrendingUp className="w-4 h-4 mr-2" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="users">
              <UsersIcon className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            {/* Date Filter */}
            <Card className="p-6 backdrop-blur-sm bg-card/50 border-white/10">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Période :</span>
                </div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sélectionner une période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">7 derniers jours</SelectItem>
                    <SelectItem value="thisWeek">Cette semaine</SelectItem>
                    <SelectItem value="30days">30 derniers jours</SelectItem>
                    <SelectItem value="thisMonth">Ce mois-ci</SelectItem>
                    <SelectItem value="3months">3 derniers mois</SelectItem>
                    <SelectItem value="6months">6 derniers mois</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
                
                {dateFilter === 'custom' && (
                  <>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full sm:w-auto"
                    />
                    <span className="text-muted-foreground">à</span>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full sm:w-auto"
                    />
                  </>
                )}
              </div>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 backdrop-blur-sm bg-card/50 border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Utilisateurs</p>
                    <p className="text-3xl font-bold text-primary">{stats.total}</p>
                  </div>
                  <UsersIcon className="w-8 h-8 text-primary/50" />
                </div>
              </Card>

              <Card className="p-6 backdrop-blur-sm bg-card/50 border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Nouveaux ce mois</p>
                    <p className="text-3xl font-bold text-green-500">{growthStats.newUsersThisMonth}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500/50" />
                </div>
              </Card>

              <Card className="p-6 backdrop-blur-sm bg-card/50 border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Utilisateurs payants</p>
                    <p className="text-3xl font-bold text-yellow-500">{growthStats.paidUsers}</p>
                  </div>
                  <Crown className="w-8 h-8 text-yellow-500/50" />
                </div>
              </Card>

              <Card className="p-6 backdrop-blur-sm bg-card/50 border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux de conversion</p>
                    <p className="text-3xl font-bold text-purple-500">{growthStats.conversionRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500/50" />
                </div>
              </Card>
            </div>

            {/* Charts */}
            <Card className="p-6 backdrop-blur-sm bg-card/50 border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Évolution des inscriptions</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} name="Total" />
                  <Line type="monotone" dataKey="Free" stroke="#3b82f6" strokeWidth={2} name="Free" />
                  <Line type="monotone" dataKey="Pro" stroke="#a855f7" strokeWidth={2} name="Pro" />
                  <Line type="monotone" dataKey="Business" stroke="#22c55e" strokeWidth={2} name="Business" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 backdrop-blur-sm bg-card/50 border-white/10">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Répartition par plan</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={planChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 backdrop-blur-sm bg-card/50 border-white/10">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Détails des plans</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <UsersIcon className="w-6 h-6 text-blue-500" />
                      <div>
                        <p className="font-semibold text-foreground">Plan Free</p>
                        <p className="text-sm text-muted-foreground">
                          {stats.total > 0 ? ((stats.Free / stats.total) * 100).toFixed(1) : 0}% des utilisateurs
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-blue-500">{stats.Free}</p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-purple-500" />
                      <div>
                        <p className="font-semibold text-foreground">Plan Pro</p>
                        <p className="text-sm text-muted-foreground">
                          {stats.total > 0 ? ((stats.Pro / stats.total) * 100).toFixed(1) : 0}% des utilisateurs
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-purple-500">{stats.Pro}</p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="font-semibold text-foreground">Plan Business</p>
                        <p className="text-sm text-muted-foreground">
                          {stats.total > 0 ? ((stats.Business / stats.total) * 100).toFixed(1) : 0}% des utilisateurs
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-green-500">{stats.Business}</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="p-6 backdrop-blur-sm bg-card/50 border-white/10">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filtrer par plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les plans</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportToExcel} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Excel
                </Button>
              </div>

              <div className="rounded-md border border-border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prénom</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.firstName || '-'}</TableCell>
                          <TableCell>{user.lastName || '-'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.subscription_plan?.name === 'Business' ? 'bg-green-500/20 text-green-500' :
                              user.subscription_plan?.name === 'Pro' ? 'bg-purple-500/20 text-purple-500' :
                              'bg-blue-500/20 text-blue-500'
                            }`}>
                              {user.subscription_plan?.name || 'Free'}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString('fr-FR')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} affiché{filteredUsers.length > 1 ? 's' : ''}
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="p-6 backdrop-blur-sm bg-card/50 border-white/10">
              <h2 className="text-2xl font-bold mb-6 text-foreground">
                Envoyer une notification
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Cible</label>
                  <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une cible" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les utilisateurs</SelectItem>
                      <SelectItem value="plan">Par plan d'abonnement</SelectItem>
                      <SelectItem value="user">Utilisateur spécifique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedTarget === 'plan' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Plan d'abonnement</label>
                    <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="Pro">Pro</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedTarget === 'user' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Utilisateur</label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un utilisateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Titre</label>
                  <Input
                    placeholder="Titre de la notification"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    placeholder="Contenu de la notification"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <ImageUploadZone
                  label="Bannière (preview)"
                  isBanner={true}
                  images={bannerImage ? [bannerImage] : []}
                  onImageAdd={(img) => setBannerImage(img)}
                  onImageRemove={() => setBannerImage('')}
                />

                <ImageUploadZone
                  label="Images dans le contenu"
                  isBanner={false}
                  maxImages={10}
                  images={contentImages}
                  onImageAdd={(img) => setContentImages(prev => [...prev, img])}
                  onImageRemove={(index) => setContentImages(prev => prev.filter((_, i) => i !== index))}
                />

                <Button
                  onClick={sendNotification}
                  disabled={isSending}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSending ? 'Envoi en cours...' : 'Envoyer la notification'}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
