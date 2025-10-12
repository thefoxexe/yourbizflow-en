import React, { Fragment, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  FileText,
  Users,
  BarChart3,
  Settings,
  Package,
  Calendar,
  FileSignature,
  X,
  KanbanSquare,
  Clock,
  Receipt,
  AreaChart,
  Laptop as Notebook,
  Search,
  Repeat,
  MailWarning,
  Briefcase,
  Wrench as ProductManagement,
  ClipboardList,
  Mail,
  Warehouse,
  Sparkles,
  PiggyBank,
  TrendingUp,
  Bot,
  Landmark,
  Map,
  Car,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const allMenuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    module_key: "dashboard",
    plan: "Free",
    isCore: true,
    category: "General",
  },
  {
    icon: Store,
    label: "Marketplace",
    path: "/marketplace",
    module_key: "marketplace",
    plan: "Free",
    isCore: true,
    category: "General",
  },
  {
    icon: Landmark,
    label: "Money inflows",
    path: "/revenues",
    module_key: "revenues",
    plan: "Free",
    category: "Finance",
  },
  {
    icon: FileText,
    label: "Billing",
    path: "/billing",
    module_key: "billing",
    plan: "Free",
    category: "Finance",
  },
  {
    icon: FileSignature,
    label: "Devis",
    path: "/quotes",
    module_key: "quotes",
    plan: "Pro",
    category: "Finance",
  },
  {
    icon: Receipt,
    label: "Expenses",
    path: "/expenses",
    module_key: "expenses",
    plan: "Pro",
    category: "Finance",
  },
  {
    icon: PiggyBank,
    label: "Budget Management",
    path: "/budget",
    module_key: "budget",
    plan: "Free",
    category: "Finance",
  },
  {
    icon: TrendingUp,
    label: "Journal de Trading",
    path: "/trading-journal",
    module_key: "trading-journal",
    plan: "Free",
    category: "Finance",
  },
  {
    icon: AreaChart,
    label: "Financial Report",
    path: "/financial-report",
    module_key: "financial-report",
    plan: "Business",
    category: "Finance",
  },
  {
    icon: Repeat,
    label: "Recurring Payments",
    path: "/recurring-payments",
    module_key: "recurring-payments",
    plan: "Business",
    category: "Finance",
  },
  {
    icon: Users,
    label: "CRM",
    path: "/crm",
    module_key: "crm",
    plan: "Free",
    category: "CRM",
  },
  {
    icon: ProductManagement,
    label: "Product Management",
    path: "/product-management",
    module_key: "product-management",
    plan: "Free",
    category: "Inventory",
  },
  {
    icon: Package,
    label: "Purchase/Resale",
    path: "/inventory",
    module_key: "inventory",
    plan: "Pro",
    category: "Inventory",
  },
  {
    icon: Warehouse,
    label: "Stock Management",
    path: "/stock-management",
    module_key: "stock-management",
    plan: "Business",
    category: "Inventory",
  },
  {
    icon: ShoppingCart,
    label: "Order Management",
    path: "/order-management",
    module_key: "order-management",
    plan: "Business",
    category: "Business Management",
  },
  {
    icon: Car,
    label: "Rental Management",
    path: "/rental-management",
    module_key: "rental-management",
    plan: "Business",
    category: "Business Management",
  },
  {
    icon: Calendar,
    label: "Calendar",
    path: "/calendar",
    module_key: "calendar",
    plan: "Free",
    category: "Organization",
  },
  {
    icon: ClipboardList,
    label: "Task Manager",
    path: "/task-manager",
    module_key: "task-manager",
    plan: "Pro",
    category: "Organization",
  },
  {
    icon: KanbanSquare,
    label: "Projects",
    path: "/projects",
    module_key: "projects",
    plan: "Business",
    category: "Organization",
  },
  {
    icon: Clock,
    label: "Time management",
    path: "/time-tracking",
    module_key: "time-tracking",
    plan: "Business",
    category: "Organization",
  },
  {
    icon: Notebook,
    label: "Notes",
    path: "/notes",
    module_key: "notes",
    plan: "Free",
    category: "Organization",
  },
  {
    icon: Bot,
    label: "AI Writing Assistant",
    path: "/ai-writing-assistant",
    module_key: "ai-writing-assistant",
    plan: "Business",
    category: "Productivity",
  },
  {
    icon: Map,
    label: "AI Strategy Map",
    path: "/ai-strategy-map",
    module_key: "ai-strategy-map",
    plan: "Business",
    category: "Productivity",
  },
  {
    icon: Briefcase,
    label: "HR & Payroll",
    path: "/hr",
    module_key: "hr",
    plan: "Business",
    category: "HR",
  },
  {
    icon: Mail,
    label: "Integrated Mail",
    path: "/integrated-mail",
    module_key: "integrated-mail",
    plan: "Business",
    category: "Automation",
  },
  {
    icon: MailWarning,
    label: "Automated Reminders",
    path: "/automated-reminders",
    module_key: "automated-reminders",
    plan: "Business",
    category: "Automation",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    path: "/analytics",
    module_key: "analytics",
    plan: "Business",
    category: "Analytics",
  },
  {
    icon: Sparkles,
    label: "SEO Analyzer",
    path: "/seo-analyzer",
    module_key: "seo-analyzer",
    plan: "Pro",
    category: "Marketing",
  },
];

const SidebarContent = ({ onLinkClick }) => {
  const location = useLocation();
  const { isModuleActive } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const menuItemsByCategory = allMenuItems.reduce((acc, item) => {
    if (item.isCore || isModuleActive(item.module_key)) {
      const category = item.category || "Others";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
    }
    return acc;
  }, {});

  const filteredMenuItems = Object.keys(menuItemsByCategory)
    .map((category) => ({
      category,
      items: menuItemsByCategory[category].filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  const categoryOrder = [
    "General",
    "Finance",
    "CRM",
    "Business Management",
    "Organization",
    "Inventory",
    "Productivity",
    "Analytics",
    "Marketing",
    "Automation",
    "HR",
    "Others",
  ];

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
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={onLinkClick}
          >
            <img
              src="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/6b69cc214c03819301dd8cb8579b78dc.png"
              alt="YourBizFlow Logo"
              className="w-10 h-10"
            />
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                YourBizFlow
              </h1>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLinkClick}
            className="lg:hidden"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un module..."
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
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">
                  {category}
                </h2>
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
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/10 flex-shrink-0">
        <Link
          to="/settings"
          onClick={onLinkClick}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 group",
            location.pathname === "/settings"
              ? "bg-primary/20 text-white font-semibold"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          )}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
};

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const onLinkClick = () => setIsSidebarOpen(false);

  return (
    <Fragment>
      <div className="fixed left-0 top-0 h-full w-64 z-50 hidden lg:block">
        <SidebarContent />
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <Fragment>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-64 z-50 lg:hidden"
            >
              <SidebarContent onLinkClick={onLinkClick} />
            </motion.div>
          </Fragment>
        )}
      </AnimatePresence>
    </Fragment>
  );
};

export default Sidebar;
