import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Lock, CheckCircle, Clock, LayoutDashboard, Store, FileText, Users, BarChart3, Settings, Package, Calendar, FileSignature, X, KanbanSquare, Clock as ClockIcon, Receipt, AreaChart, Laptop as Notebook, Repeat, MailWarning, Briefcase, Wrench as ProductManagement, ClipboardList, Mail, Warehouse, Sparkles, PiggyBank, TrendingUp, Bot, Landmark, Map, Car, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const allModules = [
  { id: 'dashboard', icon: LayoutDashboard, category: 'general', requiredPlan: 'Free', isCore: true },
  { id: 'marketplace', icon: Store, category: 'general', requiredPlan: 'Free', isCore: true },
  { id: 'revenues', icon: Landmark, category: 'finance', requiredPlan: 'Free' },
  { id: 'billing', icon: FileText, category: 'finance', requiredPlan: 'Free' },
  { id: 'quotes', icon: FileSignature, category: 'finance', requiredPlan: 'Pro' },
  { id: 'expenses', icon: Receipt, category: 'finance', requiredPlan: 'Pro' },
  { id: 'budget', icon: PiggyBank, category: 'finance', requiredPlan: 'Free' },
  { id: 'trading-journal', icon: TrendingUp, category: 'finance', requiredPlan: 'Free' },
  { id: 'financial-report', icon: AreaChart, category: 'finance', requiredPlan: 'Business' },
  { id: 'recurring-payments', icon: Repeat, category: 'finance', requiredPlan: 'Business' },
  { id: 'crm', icon: Users, category: 'crm', requiredPlan: 'Free' },
  { id: 'product-management', icon: ProductManagement, category: 'inventory', requiredPlan: 'Free' },
  { id: 'inventory', icon: Package, category: 'inventory', requiredPlan: 'Pro' },
  { id: 'stock-management', icon: Warehouse, category: 'inventory', requiredPlan: 'Business' },
  { id: 'order-management', icon: ShoppingCart, category: 'business_management', requiredPlan: 'Business' },
  { id: 'rental-management', icon: Car, category: 'business_management', requiredPlan: 'Business' },
  { id: 'calendar', icon: Calendar, category: 'organization', requiredPlan: 'Free' },
  { id: 'task-manager', icon: ClipboardList, category: 'organization', requiredPlan: 'Pro' },
  { id: 'projects', icon: KanbanSquare, category: 'organization', requiredPlan: 'Business' },
  { id: 'time-tracking', icon: ClockIcon, category: 'organization', requiredPlan: 'Business' },
  { id: 'notes', icon: Notebook, category: 'organization', requiredPlan: 'Free' },
  { id: 'ai-writing-assistant', icon: Bot, category: 'productivity', requiredPlan: 'Business' },
  { id: 'ai-strategy-map', icon: Map, category: 'strategy', requiredPlan: 'Business' },
  { id: 'hr', icon: Briefcase, category: 'hr', requiredPlan: 'Business' },
  { id: 'integrated-mail', icon: Mail, category: 'automation', requiredPlan: 'Business', comingSoon: true },
  { id: 'automated-reminders', icon: MailWarning, category: 'automation', requiredPlan: 'Business' },
  { id: 'analytics', icon: BarChart3, category: 'analytics', requiredPlan: 'Business' },
  { id: 'seo-analyzer', icon: Sparkles, category: 'marketing', requiredPlan: 'Pro' },
];

const Marketplace = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { hasPermission, isModuleActive, toggleModule } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollPosRef = useRef(0);
  
  const categories = useMemo(() => [
    { id: 'all', name: t('category_all') },
    { id: 'finance', name: t('category_finance') },
    { id: 'organization', name: t('category_organization') },
    { id: 'crm', name: t('category_crm') },
    { id: 'business_management', name: t('category_business_management') },
    { id: 'hr', name: t('category_hr') },
    { id: 'inventory', name: t('category_inventory') },
    { id: 'analytics', name: t('category_analytics') },
    { id: 'automation', name: t('category_automation') },
    { id: 'marketing', name: t('category_marketing') },
    { id: 'productivity', name: t('category_productivity') },
    { id: 'strategy', name: t('category_strategy') },
  ], [t]);

  const filteredModules = useMemo(() => {
    return allModules.filter(module => {
      const title = t(`sidebar_module_${module.id.replace(/-/g, '_')}`);
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || module.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, t]);
  
  const handleModuleAction = async (module) => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      scrollPosRef.current = mainEl.scrollTop;
    }

    if (module.comingSoon) {
      toast({ title: t('module_status_coming_soon'), description: t('module_core_toast_desc') });
      return;
    }

    if (!hasPermission(module.requiredPlan)) {
       toast({
        title: t('module_upgrade_toast_title'),
        description: t('module_upgrade_toast_desc', { plan: module.requiredPlan }),
      });
      setTimeout(() => navigate('/subscription'), 2000);
      return;
    }

    if (module.isCore) {
      toast({ title: t('module_core_toast_title'), description: t('module_core_toast_desc') });
      return;
    }
    
    await toggleModule(module.id);
  };
  
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl && mainEl.scrollTop !== scrollPosRef.current) {
        mainEl.scrollTop = scrollPosRef.current;
    }
  });

  const getButtonInfo = (module) => {
    if (module.comingSoon) {
      return { text: t('module_status_coming_soon'), icon: <Clock className="w-4 h-4 mr-2" />, disabled: true, variant: 'secondary' };
    }
    
    if (!hasPermission(module.requiredPlan)) {
      return { text: t('module_status_locked'), icon: <Lock className="w-4 h-4 mr-2" />, disabled: false, variant: 'destructive' };
    }
    if (module.isCore) {
      return { text: t('module_status_default'), icon: <CheckCircle className="w-4 h-4 mr-2" />, disabled: true, variant: 'outline' };
    }
    const isActive = isModuleActive(module.id);
    return { text: isActive ? t('module_status_deactivate') : t('module_status_activate'), icon: <Zap className="w-4 h-4 mr-2" />, disabled: false, variant: isActive ? 'outline' : 'default' };
  };

  return (
    <div className="h-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('marketplace_title')}</h1>
        <p className="text-muted-foreground">{t('marketplace_subtitle')}</p>
      </motion.div>

      <div className="mb-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={t('marketplace_search_placeholder')}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'default' : 'outline'}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
      
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
        {filteredModules.map((feature) => {
          const buttonInfo = getButtonInfo(feature);
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-card border rounded-xl p-6 flex flex-col"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-primary/10 rounded-lg mr-4"><Icon className="w-6 h-6 text-primary" /></div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t(`sidebar_module_${feature.id.replace(/-/g, '_')}`)}</h2>
                  {feature.requiredPlan && <span className="text-xs font-semibold text-primary">{feature.requiredPlan}</span>}
                </div>
              </div>
              <p className="text-muted-foreground text-sm flex-grow mb-6">{t(`module_${feature.id.replace(/-/g, '_')}_desc`)}</p>
              <Button onClick={() => handleModuleAction(feature)} disabled={buttonInfo.disabled} variant={buttonInfo.variant}>
                {buttonInfo.icon}
                {buttonInfo.text}
              </Button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Marketplace;