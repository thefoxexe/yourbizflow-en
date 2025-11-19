import React, { useState } from 'react';
    import { Link, useLocation } from 'react-router-dom';
    import { motion, AnimatePresence } from 'framer-motion';
    import { LayoutDashboard, Store, FileText, Users, BarChart3, Settings, Package, Calendar, FileSignature, X, KanbanSquare, Clock, Receipt, AreaChart, Laptop as Notebook, Search, Repeat, MailWarning, Briefcase, Wrench as ProductManagement, ClipboardList, Mail, Warehouse, Sparkles, PiggyBank, TrendingUp, Bot, Landmark, Map, Car, ShoppingCart } from 'lucide-react';
    import { cn } from '@/lib/utils';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Button } from './ui/button';
    import { Input } from './ui/input';
    import { useTranslation } from 'react-i18next';

    const allMenuItems = [
      { icon: LayoutDashboard, labelKey: 'sidebar_module_dashboard', path: '/dashboard', module_key: 'dashboard', plan: 'Free', isCore: true, category: 'sidebar_category_general' },
      { icon: Store, labelKey: 'sidebar_module_marketplace', path: '/marketplace', module_key: 'marketplace', plan: 'Free', isCore: true, category: 'sidebar_category_general' },
      { icon: Landmark, labelKey: 'sidebar_module_revenues', path: '/revenues', module_key: 'revenues', plan: 'Free', category: 'sidebar_category_finance' },
      { icon: FileText, labelKey: 'sidebar_module_billing', path: '/billing', module_key: 'billing', plan: 'Free', category: 'sidebar_category_finance' },
      { icon: FileSignature, labelKey: 'sidebar_module_quotes', path: '/quotes', module_key: 'quotes', plan: 'Pro', category: 'sidebar_category_finance' },
      { icon: Receipt, labelKey: 'sidebar_module_expenses', path: '/expenses', module_key: 'expenses', plan: 'Pro', category: 'sidebar_category_finance' },
      { icon: PiggyBank, labelKey: 'sidebar_module_budget', path: '/budget', module_key: 'budget', plan: 'Free', category: 'sidebar_category_finance' },
      { icon: TrendingUp, labelKey: 'sidebar_module_trading_journal', path: '/trading-journal', module_key: 'trading-journal', plan: 'Free', category: 'sidebar_category_finance' },
      { icon: AreaChart, labelKey: 'sidebar_module_financial_report', path: '/financial-report', module_key: 'financial-report', plan: 'Business', category: 'sidebar_category_finance' },
      { icon: Repeat, labelKey: 'sidebar_module_recurring_payments', path: '/recurring-payments', module_key: 'recurring-payments', plan: 'Business', category: 'sidebar_category_finance' },
      { icon: Users, labelKey: 'sidebar_module_crm', path: '/crm', module_key: 'crm', plan: 'Free', category: 'sidebar_category_crm' },
      { icon: ProductManagement, labelKey: 'sidebar_module_product_management', path: '/product-management', module_key: 'product-management', plan: 'Free', category: 'sidebar_category_inventory' },
      { icon: Package, labelKey: 'sidebar_module_inventory', path: '/inventory', module_key: 'inventory', plan: 'Pro', category: 'sidebar_category_inventory' },
      { icon: Warehouse, labelKey: 'sidebar_module_stock_management', path: '/stock-management', module_key: 'stock-management', plan: 'Business', category: 'sidebar_category_inventory' },
      { icon: ShoppingCart, labelKey: 'sidebar_module_order_management', path: '/order-management', module_key: 'order-management', plan: 'Business', category: 'sidebar_category_business_management' },
      { icon: Car, labelKey: 'sidebar_module_rental_management', path: '/rental-management', module_key: 'rental-management', plan: 'Business', category: 'sidebar_category_business_management' },
      { icon: Calendar, labelKey: 'sidebar_module_calendar', path: '/calendar', module_key: 'calendar', plan: 'Free', category: 'sidebar_category_organization' },
      { icon: ClipboardList, labelKey: 'sidebar_module_task_manager', path: '/task-manager', module_key: 'task-manager', plan: 'Pro', category: 'sidebar_category_organization' },
      { icon: KanbanSquare, labelKey: 'sidebar_module_projects', path: '/projects', module_key: 'projects', plan: 'Business', category: 'sidebar_category_organization' },
      { icon: Clock, labelKey: 'sidebar_module_time_tracking', path: '/time-tracking', module_key: 'time-tracking', plan: 'Business', category: 'sidebar_category_organization' },
      { icon: Notebook, labelKey: 'sidebar_module_notes', path: '/notes', module_key: 'notes', plan: 'Free', category: 'sidebar_category_organization' },
      { icon: Bot, labelKey: 'sidebar_module_ai_writing_assistant', path: '/ai-writing-assistant', module_key: 'ai-writing-assistant', plan: 'Business', category: 'sidebar_category_productivity' },
      { icon: Map, labelKey: 'sidebar_module_ai_strategy_map', path: '/ai-strategy-map', module_key: 'ai-strategy-map', plan: 'Business', category: 'sidebar_category_productivity' },
      { icon: Briefcase, labelKey: 'sidebar_module_hr', path: '/hr', module_key: 'hr', plan: 'Business', category: 'sidebar_category_hr' },
      { icon: Mail, labelKey: 'sidebar_module_integrated_mail', path: '/integrated-mail', module_key: 'integrated-mail', plan: 'Business', category: 'sidebar_category_automation' },
      { icon: MailWarning, labelKey: 'sidebar_module_automated_reminders', path: '/automated-reminders', module_key: 'automated-reminders', plan: 'Business', category: 'sidebar_category_automation' },
      { icon: BarChart3, labelKey: 'sidebar_module_analytics', path: '/analytics', module_key: 'analytics', plan: 'Business', category: 'sidebar_category_analytics' },
      { icon: Sparkles, labelKey: 'sidebar_module_seo_analyzer', path: '/seo-analyzer', module_key: 'seo-analyzer', plan: 'Pro', category: 'sidebar_category_marketing' },
    ];


    const SidebarContent = ({ onLinkClick }) => {
      const location = useLocation();
      const { isModuleActive, profile } = useAuth();
      const [searchQuery, setSearchQuery] = useState('');
      const { t } = useTranslation();

      const menuItemsByCategory = allMenuItems.reduce((acc, item) => {
        if (item.isCore || isModuleActive(item.module_key)) {
          const category = item.category || 'sidebar_category_other';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
        }
        return acc;
      }, {});

      const filteredMenuItems = Object.keys(menuItemsByCategory)
        .map(categoryKey => ({
          category: t(categoryKey),
          items: menuItemsByCategory[categoryKey].filter(item =>
            t(item.labelKey).toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(group => group.items.length > 0);

      const categoryOrder = [t('sidebar_category_general'), t('sidebar_category_finance'), t('sidebar_category_crm'), t('sidebar_category_business_management'), t('sidebar_category_organization'), t('sidebar_category_inventory'), t('sidebar_category_productivity'), t('sidebar_category_analytics'), t('sidebar_category_marketing'), t('sidebar_category_automation'), t('sidebar_category_hr'), t('sidebar_category_other')];
      
      filteredMenuItems.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a.category);
        const indexB = categoryOrder.indexOf(b.category);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });


      return (
        <div className="flex flex-col h-full bg-background border-r border-white/10">
          <div className="p-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="flex items-center gap-3" onClick={onLinkClick}>
                <img src="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/6b69cc214c03819301dd8cb8579b78dc.png" alt="YourBizFlow Logo" className="w-10 h-10" />
                <div>
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">{t('app_name')}</h1>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={onLinkClick} className="lg:hidden">
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('sidebar_search_placeholder')}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto px-6 pb-6">
            <nav className="space-y-4 mt-4">
              {filteredMenuItems.map(({ category, items }) => (
                <div key={category}>
                  {
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">{category}</h2>
                  }
                  <div className="space-y-1">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname.startsWith(item.path);
                      
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={onLinkClick}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 group",
                            isActive 
                              ? "bg-primary/20 text-white font-semibold" 
                              : "text-muted-foreground hover:text-white hover:bg-white/5"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{t(item.labelKey)}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-white/10 flex-shrink-0 space-y-2">
            <Link
              to="/settings"
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 group",
                location.pathname === '/settings'
                  ? "bg-primary/20 text-white font-semibold" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <Settings className="w-5 h-5" />
              <span>{t('header_settings')}</span>
            </Link>
            
            {profile?.subscription_plan?.name && (profile.subscription_plan.name.toLowerCase() === 'free' || profile.subscription_plan.name.toLowerCase() === 'pro') && (
              <Button
                onClick={() => window.open('https://billing.stripe.com/p/login/3cIfZi3ML4OwflKciwawo00', '_blank')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
              >
                {t('upgrade')}
              </Button>
            )}
          </div>
        </div>
      );
    };

    const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
      const onLinkClick = () => setIsSidebarOpen(false);

      return (
        <React.Fragment>
          <div className="fixed left-0 top-0 h-full w-64 z-50 hidden lg:block">
            <SidebarContent />
          </div>

          <AnimatePresence>
            {isSidebarOpen && (
              <React.Fragment>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="fixed left-0 top-0 h-full w-64 z-50 lg:hidden"
                >
                  <SidebarContent onLinkClick={onLinkClick} />
                </motion.div>
              </React.Fragment>
            )}
          </AnimatePresence>
        </React.Fragment>
      );
    };

    export default Sidebar;