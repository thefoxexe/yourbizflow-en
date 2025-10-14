import React from 'react';
import { motion } from 'framer-motion';
import { Star, Download, Lock, Crown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Store, FileText, Users, BarChart3, Settings, Package, Calendar, FileSignature, X, KanbanSquare, Clock, Receipt, AreaChart, Laptop as Notebook, Search, Repeat, MailWarning, Briefcase, Wrench as ProductManagement, ClipboardList, Mail, Warehouse, Sparkles, PiggyBank, TrendingUp, Bot, Landmark, Map, Car, ShoppingCart } from 'lucide-react';

const MarketplaceCard = ({ module, onInstall, delay = 0 }) => {
  const getStatusIcon = () => {
    switch (module.status) {
      case 'active': return <Check className="w-4 h-4" />;
      case 'locked': return <Lock className="w-4 h-4" />;
      default: return <Download className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (module.status) {
      case 'active': return 'Activé';
      case 'locked': return 'Upgrade';
      default: return 'Installer';
    }
  };

  const getButtonVariant = () => {
    switch (module.status) {
      case 'active': return 'outline';
      case 'locked': return 'default';
      default: return 'default';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-black/20 backdrop-blur-xl border rounded-xl p-6 flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300 ${
        module.status === 'locked' ? 'border-gray-500/20' : 'border-white/10'
      }`}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`text-lg font-bold ${module.status === 'locked' ? 'text-gray-400' : 'text-white'}`}>
                {module.name}
              </h3>
              {module.price === 'Premium' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                  <Crown className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-yellow-300">{module.requiredPlan}</span>
                </div>
              )}
            </div>
            <p className={`text-sm mb-3 ${module.status === 'locked' ? 'text-gray-500' : 'text-gray-300'}`}>
              {module.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className={`text-sm ${module.status === 'locked' ? 'text-gray-500' : 'text-gray-300'}`}>
              {module.rating}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4 text-gray-400" />
            <span className={`text-sm ${module.status === 'locked' ? 'text-gray-500' : 'text-gray-300'}`}>
              {module.downloads}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h4 className={`text-sm font-medium mb-2 ${module.status === 'locked' ? 'text-gray-500' : 'text-gray-300'}`}>
            Fonctionnalités:
          </h4>
          <ul className="space-y-1">
            {module.features.map((feature, index) => (
              <li key={index} className={`text-xs flex items-center gap-2 ${
                module.status === 'locked' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button
        onClick={onInstall}
        variant={getButtonVariant()}
        className={`w-full mt-4 ${
          module.status === 'active' 
            ? 'bg-green-500/20 border-green-500/30 text-green-400 cursor-not-allowed'
            : module.status === 'locked'
            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
        }`}
      >
        {getStatusIcon()}
        <span className="ml-2">{getStatusText()}</span>
      </Button>
    </motion.div>
  );
};

export const allFeatures = [
  { icon: LayoutDashboard, labelKey: 'sidebar_module_dashboard', path: '/dashboard', module_key: 'dashboard', color: 'text-blue-500' },
  { icon: FileText, labelKey: 'sidebar_module_billing', path: '/billing', module_key: 'billing', color: 'text-green-500' },
  { icon: FileSignature, labelKey: 'sidebar_module_quotes', path: '/quotes', module_key: 'quotes', color: 'text-purple-500' },
  { icon: Users, labelKey: 'sidebar_module_crm', path: '/crm', module_key: 'crm', color: 'text-pink-500' },
  { icon: Package, labelKey: 'sidebar_module_inventory', path: '/inventory', module_key: 'inventory', color: 'text-yellow-500' },
  { icon: Calendar, labelKey: 'sidebar_module_calendar', path: '/calendar', module_key: 'calendar', color: 'text-red-500' },
  { icon: KanbanSquare, labelKey: 'sidebar_module_projects', path: '/projects', module_key: 'projects', color: 'text-indigo-500' },
  { icon: Clock, labelKey: 'sidebar_module_time_tracking', path: '/time-tracking', module_key: 'time-tracking', color: 'text-orange-500' },
  { icon: Notebook, labelKey: 'sidebar_module_notes', path: '/notes', module_key: 'notes', color: 'text-teal-500' },
  { icon: Receipt, labelKey: 'sidebar_module_expenses', path: '/expenses', module_key: 'expenses', color: 'text-amber-500' },
  { icon: AreaChart, labelKey: 'sidebar_module_financial_report', path: '/financial-report', module_key: 'financial-report', color: 'text-lime-500' },
  { icon: Repeat, labelKey: 'sidebar_module_recurring_payments', path: '/recurring-payments', module_key: 'recurring-payments', color: 'text-fuchsia-500' },
  { icon: MailWarning, labelKey: 'sidebar_module_automated_reminders', path: '/automated-reminders', module_key: 'automated-reminders', color: 'text-rose-500' },
  { icon: Briefcase, labelKey: 'sidebar_module_hr', path: '/hr', module_key: 'hr', color: 'text-cyan-500' },
  { icon: ProductManagement, labelKey: 'sidebar_module_product_management', path: '/product-management', module_key: 'product-management', color: 'text-emerald-500' },
  { icon: ClipboardList, labelKey: 'sidebar_module_task_manager', path: '/task-manager', module_key: 'task-manager', color: 'text-violet-500' },
  { icon: Mail, labelKey: 'sidebar_module_integrated_mail', path: '/integrated-mail', module_key: 'integrated-mail', color: 'text-sky-500' },
  { icon: Warehouse, labelKey: 'sidebar_module_stock_management', path: '/stock-management', module_key: 'stock-management', color: 'text-orange-500' },
  { icon: Sparkles, labelKey: 'sidebar_module_seo_analyzer', path: '/seo-analyzer', module_key: 'seo-analyzer', color: 'text-yellow-500' },
  { icon: PiggyBank, labelKey: 'sidebar_module_budget', path: '/budget', module_key: 'budget', color: 'text-green-500' },
  { icon: TrendingUp, labelKey: 'sidebar_module_trading_journal', path: '/trading-journal', module_key: 'trading-journal', color: 'text-blue-500' },
  { icon: Bot, labelKey: 'sidebar_module_ai_writing_assistant', path: '/ai-writing-assistant', module_key: 'ai-writing-assistant', color: 'text-purple-500' },
  { icon: Landmark, labelKey: 'sidebar_module_revenues', path: '/revenues', module_key: 'revenues', color: 'text-pink-500' },
  { icon: Map, labelKey: 'sidebar_module_ai_strategy_map', path: '/ai-strategy-map', module_key: 'ai-strategy-map', color: 'text-red-500' },
  { icon: Car, labelKey: 'sidebar_module_rental_management', path: '/rental-management', module_key: 'rental-management', color: 'text-green-500' },
  { icon: ShoppingCart, labelKey: 'sidebar_module_order_management', path: '/order-management', module_key: 'order-management', color: 'text-cyan-500' },
];

export default MarketplaceCard;