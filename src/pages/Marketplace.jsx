
import React, { useState, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Search, Lock, Power, PowerOff, FileText, FileSignature, Users, Package, Calendar, BarChart3, KanbanSquare, Clock, Receipt, AreaChart, Laptop as Notebook, Repeat, MailWarning, Briefcase, Wrench as ProductManagement, Info, ClipboardList, Mail, Warehouse, Clock as ClockIcon, Sparkles, PiggyBank, TrendingUp, Bot, Landmark, Map, Car, ShoppingCart } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { cn } from '@/lib/utils';
    import { useNavigate } from 'react-router-dom';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
    import { Helmet } from 'react-helmet';

    const ModuleVideoDialog = ({ isOpen, onOpenChange, module }) => {
      if (!module) return null;

      const videoId = module.videoUrl.split('v=')[1];
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Présentation: {module.name}</DialogTitle>
              <DialogDescription>
                Découvrez comment utiliser le module {module.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="aspect-video mt-4">
              <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                title={`Tutoriel YouTube pour ${module.name}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
          </DialogContent>
        </Dialog>
      );
    };

    const MarketplaceCard = ({ module, onToggle, onUpgrade, delay = 0 }) => {
      const handleButtonClick = () => {
        if (module.status === 'locked') {
          onUpgrade(module);
        } else {
          onToggle(module);
        }
      };

      const Icon = module.icon;

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay }}
          className={cn(
            "bg-card border rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300",
            module.status === 'locked' || module.isComingSoon ? 'bg-secondary/50' : 'hover:border-primary/50'
          )}
        >
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn("text-lg font-bold", (module.status === 'locked' || module.isComingSoon) && 'text-muted-foreground')}>
                      {module.name}
                    </h3>
                    {module.status === 'locked' && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 rounded-full w-fit mt-1">
                        <span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">{module.requiredPlan}</span>
                      </div>
                    )}
                    {module.isComingSoon && (
                       <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-full w-fit mt-1">
                        <ClockIcon className="w-3 h-3 text-blue-700 dark:text-blue-300" />
                        <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Bientôt</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className={cn("text-sm mb-3", (module.status === 'locked' || module.isComingSoon) ? 'text-muted-foreground/80' : 'text-muted-foreground')}>
                  {module.description}
                </p>
              </div>
            </div>
          </div>

          {module.isComingSoon ? (
            <Button variant="outline" className="w-full mt-4" disabled>
              <ClockIcon className="w-4 h-4 mr-2" />
              Bientôt disponible
            </Button>
          ) : module.status === 'locked' ? (
            <Button onClick={handleButtonClick} variant="default" className="w-full mt-4">
              <Lock className="w-4 h-4 mr-2" />
              Mettre à niveau
            </Button>
          ) : (
            <Button
              onClick={handleButtonClick}
              variant={module.status === 'active' ? 'outline' : 'default'}
              className="w-full mt-4"
              disabled={module.isCoreModule}
            >
              {module.isCoreModule ? 'Activé par défaut' : (
                <>
                  {module.status === 'active' ? <PowerOff className="w-4 h-4 mr-2" /> : <Power className="w-4 h-4 mr-2" />}
                  {module.status === 'active' ? 'Désactiver' : 'Activer'}
                </>
              )}
            </Button>
          )}
        </motion.div>
      );
    };

    const Marketplace = () => {
      const { toast } = useToast();
      const { hasPermission, isModuleActive, profile, updateActiveModules } = useAuth();
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedCategory, setSelectedCategory] = useState('all');
      const [isvideoDialogOpen, setIsVideoDialogOpen] = useState(false);
      const [selectedModuleForVideo, setSelectedModuleForVideo] = useState(null);
      const navigate = useNavigate();
      const planHierarchy = { 'Free': 0, 'Pro': 1, 'Business': 2 };

      const categories = [
        { id: 'all', name: 'Tous' },
        { id: 'finance', name: 'Finance' },
        { id: 'organization', name: 'Organisation' },
        { id: 'crm', name: 'CRM' },
        { id: 'business-management', name: 'Business Management' },
        { id: 'hr', name: 'RH' },
        { id: 'inventory', name: 'Inventaire' },
        { id: 'analytics', name: 'Analytique' },
        { id: 'automation', name: 'Automatisation' },
        { id: 'marketing', name: 'Marketing' },
        { id: 'productivity', name: 'Productivité' },
        { id: 'strategy', name: 'Stratégie' },
      ];

      const allModules = [
        { id: 25, name: 'Entrées d\'argent', description: 'Enregistrez rapidement des revenus divers.', category: 'finance', module_key: 'revenues', requiredPlan: 'Free', icon: Landmark, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 1, name: 'Facturation', description: 'Gérez vos factures et paiements.', category: 'finance', module_key: 'billing', requiredPlan: 'Free', icon: FileText, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 17, name: 'Gestion des Produits', description: 'Créez vos produits et analysez leur rentabilité.', category: 'finance', module_key: 'product-management', requiredPlan: 'Free', icon: ProductManagement, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 22, name: 'Gestion de Budget', description: 'Créez des budgets et suivez vos dépenses.', category: 'finance', module_key: 'budget', requiredPlan: 'Free', icon: PiggyBank, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 8, name: 'Devis', description: 'Créez des devis professionnels.', category: 'finance', module_key: 'quotes', requiredPlan: 'Pro', icon: FileSignature, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 11, name: 'Suivi des Dépenses', description: 'Enregistrez et catégorisez vos dépenses.', category: 'finance', module_key: 'expenses', requiredPlan: 'Pro', icon: Receipt, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 23, name: 'Journal de Trading', description: 'Suivez et analysez vos performances de trading.', category: 'finance', module_key: 'trading-journal', requiredPlan: 'Free', icon: TrendingUp, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 12, name: 'Rapport Financier', description: 'Bilan complet de vos revenus et dépenses.', category: 'finance', module_key: 'financial-report', requiredPlan: 'Business', icon: AreaChart, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 13, name: 'Paiements Récurrents', description: 'Gérez vos abonnements et revenus récurrents.', category: 'finance', module_key: 'recurring-payments', requiredPlan: 'Business', icon: Repeat, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 2, name: 'CRM', description: 'Suivez vos clients et prospects.', category: 'crm', module_key: 'crm', requiredPlan: 'Free', icon: Users, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 3, name: 'Achat/Revente', description: 'Gérez votre inventaire et vos marges.', category: 'inventory', module_key: 'inventory', requiredPlan: 'Pro', icon: Package, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 20, name: 'Gestion de Stock', description: 'Suivez vos niveaux de stock et enregistrez les ventes.', category: 'inventory', module_key: 'stock-management', requiredPlan: 'Business', icon: Warehouse, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 28, name: 'Gestion des Commandes', description: 'Gérez le cycle de vie de vos commandes clients.', category: 'business-management', module_key: 'order-management', requiredPlan: 'Business', icon: ShoppingCart, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 6, name: 'Notes & Documents', description: 'Stockage de notes et documents.', category: 'organization', module_key: 'notes', requiredPlan: 'Free', icon: Notebook, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 7, name: 'Calendrier', description: 'Organisez vos tâches et rendez-vous.', category: 'organization', module_key: 'calendar', requiredPlan: 'Free', icon: Calendar, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 18, name: 'Gestionnaire de Tâches', description: 'Gérez missions, priorités et deadlines.', category: 'organization', module_key: 'task-manager', requiredPlan: 'Pro', icon: ClipboardList, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 9, name: 'Suivi de Projets', description: 'Vue Kanban pour suivre l\'avancement.', category: 'organization', module_key: 'projects', requiredPlan: 'Business', icon: KanbanSquare, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 10, name: 'Gestion des heures', description: 'Suivez le temps passé sur vos projets.', category: 'organization', module_key: 'time-tracking', requiredPlan: 'Business', icon: Clock, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 16, name: 'RH & Paie', description: 'Gérez vos employés, salaires et masse salariale.', category: 'hr', module_key: 'hr', requiredPlan: 'Business', icon: Briefcase, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 27, name: 'Gestion de Location', description: 'Gérez la location de biens (voitures, matériel...).', category: 'business-management', module_key: 'rental-management', requiredPlan: 'Pro', icon: Car, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 24, name: 'AI Writing Assistant', description: 'Générez du contenu (emails, posts...) avec l\'IA.', category: 'productivity', module_key: 'ai-writing-assistant', requiredPlan: 'Business', icon: Bot, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 4, name: 'Analytique', description: 'Analyses et insights business.', category: 'analytics', module_key: 'analytics', requiredPlan: 'Business', icon: BarChart3, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 14, name: 'Relances Automatisées', description: 'Détectez les impayés et envoyez des rappels automatiques.', category: 'automation', module_key: 'automated-reminders', requiredPlan: 'Business', icon: MailWarning, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 19, name: 'Mail Intégré', description: 'Connectez votre Gmail pour gérer vos mails.', category: 'automation', module_key: 'integrated-mail', requiredPlan: 'Business', icon: Mail, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8', isComingSoon: true },
        { id: 21, name: 'SEO Analyzer', description: 'Analysez la performance SEO de votre site web.', category: 'marketing', module_key: 'seo-analyzer', requiredPlan: 'Pro', icon: Sparkles, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
        { id: 26, name: 'AI Strategy Map', description: 'Planifiez et exécutez votre stratégie business avec l\'IA.', category: 'strategy', module_key: 'ai-strategy-map', requiredPlan: 'Business', icon: Map, videoUrl: 'https://www.youtube.com/watch?v=KbcAsVY_yf8' },
      ];
      
      const modules = useMemo(() => {
        const userPlanLevel = planHierarchy[profile?.subscription_plan?.name || 'Free'];
        
        return allModules.map(m => ({
          ...m,
          status: !hasPermission(m.requiredPlan) ? 'locked' : (isModuleActive(m.module_key) ? 'active' : 'inactive')
        })).sort((a, b) => {
          const aLevel = planHierarchy[a.requiredPlan];
          const bLevel = planHierarchy[b.requiredPlan];

          const aIsAccessible = aLevel <= userPlanLevel;
          const bIsAccessible = bLevel <= userPlanLevel;

          if (aIsAccessible && !bIsAccessible) return -1;
          if (!aIsAccessible && bIsAccessible) return 1;

          if (aLevel < bLevel) return -1;
          if (aLevel > bLevel) return 1;
          
          return a.name.localeCompare(b.name);
        });
      }, [profile, hasPermission, isModuleActive]);


      const filteredModules = modules.filter(module => {
        const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

      const handleToggleModule = (module) => {
        if (module.isCoreModule) {
          toast({
            variant: 'destructive',
            title: 'Module de base',
            description: 'Ce module ne peut pas être désactivé.',
          });
          return;
        }
        
        const currentActiveModules = profile.active_modules || [];
        let newModules;

        if (module.status === 'active') {
          newModules = currentActiveModules.filter(m => m !== module.module_key);
        } else {
          newModules = [...currentActiveModules, module.module_key];
        }
        updateActiveModules(newModules);
      };

      const handleUpgrade = (module) => {
        toast({ 
          title: "🔒 Module verrouillé", 
          description: `Passez au plan ${module.requiredPlan} pour l'activer. Redirection...` 
        });
        setTimeout(() => {
          navigate('/subscription');
        }, 1500);
      };

      const handleShowVideo = (module) => {
        setSelectedModuleForVideo(module);
        setIsVideoDialogOpen(true);
      };

      return (
        <div className="space-y-8">
          <Helmet>
            <title>Marketplace - YourBizFlow</title>
            <meta name="description" content="Découvrez et activez des modules pour étendre les fonctionnalités de votre plateforme YourBizFlow." />
            <meta name="keywords" content="marketplace, modules, YourBizFlow, extensions, plugins, fonctionnalités" />
          </Helmet>
          <ModuleVideoDialog 
            isOpen={isvideoDialogOpen}
            onOpenChange={setIsVideoDialogOpen}
            module={selectedModuleForVideo}
          />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-foreground mb-2">Marketplace</h1>
            <p className="text-muted-foreground">Découvrez et activez des modules pour étendre votre plateforme.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un module..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModules.map((module, index) => (
              <MarketplaceCard
                key={module.id}
                module={module}
                onToggle={handleToggleModule}
                onUpgrade={handleUpgrade}
                delay={index * 0.05}
              />
            ))}
          </motion.div>
        </div>
      );
    };

    export default Marketplace;
