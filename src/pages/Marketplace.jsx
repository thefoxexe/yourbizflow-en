import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Lock,
  Power,
  PowerOff,
  FileText,
  FileSignature,
  Users,
  Package,
  Calendar,
  BarChart3,
  KanbanSquare,
  Clock,
  Receipt,
  AreaChart,
  Laptop as Notebook,
  Repeat,
  MailWarning,
  Briefcase,
  Wrench as ProductManagement,
  Info,
  ClipboardList,
  Mail,
  Warehouse,
  Clock as ClockIcon,
  Sparkles,
  PiggyBank,
  TrendingUp,
  Bot,
  Landmark,
  Map,
  Car,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Helmet } from "react-helmet";

const ModuleVideoDialog = ({ isOpen, onOpenChange, module }) => {
  if (!module) return null;

  const videoId = module.videoUrl.split("v=")[1];
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Presentation: {module.name}</DialogTitle>
          <DialogDescription>
            Learn how to use the {module.name} module.
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
    if (module.status === "locked") {
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
        module.status === "locked" || module.isComingSoon
          ? "bg-secondary/50"
          : "hover:border-primary/50"
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
                <h3
                  className={cn(
                    "text-lg font-bold",
                    (module.status === "locked" || module.isComingSoon) &&
                      "text-muted-foreground"
                  )}
                >
                  {module.name}
                </h3>
                {module.status === "locked" && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 rounded-full w-fit mt-1">
                    <span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                      {module.requiredPlan}
                    </span>
                  </div>
                )}
                {module.isComingSoon && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-full w-fit mt-1">
                    <ClockIcon className="w-3 h-3 text-blue-700 dark:text-blue-300" />
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      Soon
                    </span>
                  </div>
                )}
              </div>
            </div>
            <p
              className={cn(
                "text-sm mb-3",
                module.status === "locked" || module.isComingSoon
                  ? "text-muted-foreground/80"
                  : "text-muted-foreground"
              )}
            >
              {module.description}
            </p>
          </div>
        </div>
      </div>

      {module.isComingSoon ? (
        <Button variant="outline" className="w-full mt-4" disabled>
          <ClockIcon className="w-4 h-4 mr-2" />
          Coming soon
        </Button>
      ) : module.status === "locked" ? (
        <Button
          onClick={handleButtonClick}
          variant="default"
          className="w-full mt-4"
        >
          <Lock className="w-4 h-4 mr-2" />
          Upgrade
        </Button>
      ) : (
        <Button
          onClick={handleButtonClick}
          variant={module.status === "active" ? "outline" : "default"}
          className="w-full mt-4"
          disabled={module.isCoreModule}
        >
          {module.isCoreModule ? (
            "Activé par défaut"
          ) : (
            <>
              {module.status === "active" ? (
                <PowerOff className="w-4 h-4 mr-2" />
              ) : (
                <Power className="w-4 h-4 mr-2" />
              )}
              {module.status === "active" ? "Disable" : "Enable"}
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
};

const Marketplace = () => {
  const { toast } = useToast();
  const { hasPermission, isModuleActive, profile, updateActiveModules } =
    useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isvideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [selectedModuleForVideo, setSelectedModuleForVideo] = useState(null);
  const navigate = useNavigate();
  const planHierarchy = { Free: 0, Pro: 1, Business: 2 };

  const categories = [
    { id: "all", name: "All" },
    { id: "finance", name: "Finance" },
    { id: "organization", name: "Organization" },
    { id: "crm", name: "CRM" },
    { id: "business-management", name: "Business Management" },
    { id: "hr", name: "RH" },
    { id: "inventory", name: "Inventory" },
    { id: "analytics", name: "Analytics" },
    { id: "automation", name: "Automation" },
    { id: "marketing", name: "Marketing" },
    { id: "productivity", name: "Productivity" },
    { id: "strategy", name: "Strategy" },
  ];

  const allModules = [
    {
      id: 25,
      name: "Money inflows",
      description: "Quickly record miscellaneous income.",
      category: "finance",
      module_key: "revenues",
      requiredPlan: "Free",
      icon: Landmark,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 1,
      name: "Billing",
      description: "Manage your invoices and payments.",
      category: "finance",
      module_key: "billing",
      requiredPlan: "Free",
      icon: FileText,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 17,
      name: "Product Management",
      description: "Create your products and analyze their profitability.",
      category: "finance",
      module_key: "product-management",
      requiredPlan: "Free",
      icon: ProductManagement,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 22,
      name: "Budget Management",
      description: "Create budgets and track your spending.",
      category: "finance",
      module_key: "budget",
      requiredPlan: "Free",
      icon: PiggyBank,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 8,
      name: "Quotation",
      description: "Create professional quotes.",
      category: "finance",
      module_key: "quotes",
      requiredPlan: "Pro",
      icon: FileSignature,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 11,
      name: "Expense Tracker",
      description: "Record and categorize your expenses.",
      category: "finance",
      module_key: "expenses",
      requiredPlan: "Pro",
      icon: Receipt,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 23,
      name: "Trading Journal",
      description: "Track and analyze your trading performance.",
      category: "finance",
      module_key: "trading-journal",
      requiredPlan: "Free",
      icon: TrendingUp,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 12,
      name: "Financial Report",
      description: "Complete overview of your income and expenses.",
      category: "finance",
      module_key: "financial-report",
      requiredPlan: "Business",
      icon: AreaChart,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 13,
      name: "Recurring Payments",
      description: "Manage your recurring subscriptions and revenue.",
      category: "finance",
      module_key: "recurring-payments",
      requiredPlan: "Business",
      icon: Repeat,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 2,
      name: "CRM",
      description: "Track your customers and prospects.",
      category: "crm",
      module_key: "crm",
      requiredPlan: "Free",
      icon: Users,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 3,
      name: "Purchase/Resale",
      description: "Manage your inventory and your margins.",
      category: "inventory",
      module_key: "inventory",
      requiredPlan: "Pro",
      icon: Package,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 20,
      name: "Stock Management",
      description: "Track your stock levels and record sales.",
      category: "inventory",
      module_key: "stock-management",
      requiredPlan: "Business",
      icon: Warehouse,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 28,
      name: "Order Management",
      description: "Manage the lifecycle of your sales orders.",
      category: "business-management",
      module_key: "order-management",
      requiredPlan: "Business",
      icon: ShoppingCart,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 6,
      name: "Notes & Documents",
      description: "Storing notes and documents.",
      category: "organization",
      module_key: "notes",
      requiredPlan: "Free",
      icon: Notebook,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 7,
      name: "Calendar",
      description: "Organize your tasks and appointments.",
      category: "organization",
      module_key: "calendar",
      requiredPlan: "Free",
      icon: Calendar,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 18,
      name: "Task Manager",
      description: "Manage missions, priorities and deadlines.",
      category: "organization",
      module_key: "task-manager",
      requiredPlan: "Pro",
      icon: ClipboardList,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 9,
      name: "Project Tracking",
      description: "Kanban view to track progress.",
      category: "organization",
      module_key: "projects",
      requiredPlan: "Business",
      icon: KanbanSquare,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 10,
      name: "Time Management",
      description: "Track the time spent on your projects.",
      category: "organization",
      module_key: "time-tracking",
      requiredPlan: "Business",
      icon: Clock,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 16,
      name: "HR & Payroll",
      description: "Manage your employees, salaries and payroll.",
      category: "hr",
      module_key: "hr",
      requiredPlan: "Business",
      icon: Briefcase,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 27,
      name: "Rental Management",
      description: "Manage the rental of goods (cars, equipment...).",
      category: "business-management",
      module_key: "rental-management",
      requiredPlan: "Pro",
      icon: Car,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 24,
      name: "AI Writing Assistant",
      description: "Generate content (emails, posts...) with AI.",
      category: "productivity",
      module_key: "ai-writing-assistant",
      requiredPlan: "Business",
      icon: Bot,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 4,
      name: "Analytics",
      description: "Business analytics and insights.",
      category: "analytics",
      module_key: "analytics",
      requiredPlan: "Business",
      icon: BarChart3,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 14,
      name: "Automated Reminders",
      description: "Detect unpaid debts and send automatic reminders.",
      category: "automation",
      module_key: "automated-reminders",
      requiredPlan: "Business",
      icon: MailWarning,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 19,
      name: "Integrated Mail",
      description: "Connect your Gmail to manage your emails.",
      category: "automation",
      module_key: "integrated-mail",
      requiredPlan: "Business",
      icon: Mail,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
      isComingSoon: true,
    },
    {
      id: 21,
      name: "SEO Analyzer",
      description: "Analyze the SEO performance of your website.",
      category: "marketing",
      module_key: "seo-analyzer",
      requiredPlan: "Pro",
      icon: Sparkles,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
    {
      id: 26,
      name: "AI Strategy Map",
      description: "Plan and execute your business strategy with AI.",
      category: "strategy",
      module_key: "ai-strategy-map",
      requiredPlan: "Business",
      icon: Map,
      videoUrl: "https://www.youtube.com/watch?v=KbcAsVY_yf8",
    },
  ];

  const modules = useMemo(() => {
    const userPlanLevel =
      planHierarchy[profile?.subscription_plan?.name || "Free"];

    return allModules
      .map((m) => ({
        ...m,
        status: !hasPermission(m.requiredPlan)
          ? "locked"
          : isModuleActive(m.module_key)
          ? "active"
          : "inactive",
      }))
      .sort((a, b) => {
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

  const filteredModules = modules.filter((module) => {
    const matchesSearch = module.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleModule = (module) => {
    if (module.isCoreModule) {
      toast({
        variant: "destructive",
        title: "Basic module",
        description: "This module cannot be disabled.",
      });
      return;
    }

    const currentActiveModules = profile.active_modules || [];
    let newModules;

    if (module.status === "active") {
      newModules = currentActiveModules.filter((m) => m !== module.module_key);
    } else {
      newModules = [...currentActiveModules, module.module_key];
    }
    updateActiveModules(newModules);
  };

  const handleUpgrade = (module) => {
    toast({
      title: "🔒 Module locked",
      description: `Switch to plan ${module.requiredPlan} to enable it. Redirect...`,
    });
    setTimeout(() => {
      navigate("/subscription");
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
        <meta
          name="description"
          content="Discover and activate modules to extend the functionality of your YourBizFlow platform."
        />
        <meta
          name="keywords"
          content="marketplace, modules, YourBizFlow, extensions, plugins, features"
        />
      </Helmet>
      <ModuleVideoDialog
        isOpen={isvideoDialogOpen}
        onOpenChange={setIsVideoDialogOpen}
        module={selectedModuleForVideo}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Marketplace</h1>
        <p className="text-muted-foreground">
          Discover and activate modules to extend your platform.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search for a module..."
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
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
