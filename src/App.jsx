import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Helmet } from "react-helmet";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import Marketplace from "@/pages/Marketplace";
import Billing from "@/pages/Billing";
import Quotes from "@/pages/Quotes";
import CRM from "@/pages/CRM";
import Analytics from "@/pages/Analytics";
import Notes from "@/pages/Notes";
import Settings from "@/pages/Settings";
import Inventory from "@/pages/Inventory";
import CalendarPage from "@/pages/Calendar";
import NoteEditor from "@/pages/NoteEditor";
import Projects from "@/pages/Projects";
import TimeTracking from "@/pages/TimeTracking";
import Expenses from "@/pages/Expenses";
import FinancialReport from "@/pages/FinancialReport";
import RecurringPayments from "@/pages/RecurringPayments";
import AutomatedReminders from "@/pages/AutomatedReminders";
import HR from "@/pages/HR";
import ProductManagement from "@/pages/ProductManagement";
import TaskManager from "@/pages/TaskManager";
import IntegratedMail from "@/pages/IntegratedMail";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Subscription from "@/pages/Subscription";
import LandingPage from "@/pages/LandingPage";
import About from "@/pages/About";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import CompanyDataDialog from "@/components/CompanyDataDialog";
import StockManagement from "@/pages/StockManagement";
import BlogPage from "@/pages/BlogPage";
import BlogPost1 from "@/pages/blog/BlogPost1";
import BlogPost2 from "@/pages/blog/BlogPost2";
import BlogPost3 from "@/pages/blog/BlogPost3";
import BlogPost4 from "@/pages/blog/BlogPost4";
import BlogPost5 from "@/pages/blog/BlogPost5";
import BlogPost6 from "@/pages/blog/BlogPost6";
import SeoAnalyzer from "@/pages/SeoAnalyzer";
import Budget from "@/pages/Budget";
import TradingJournal from "@/pages/TradingJournal";
import AiWritingAssistant from "@/pages/AiWritingAssistant";
import Revenues from "@/pages/Revenues";
import AiStrategyMap from "@/pages/AiStrategyMap";
import AppBilling from "@/pages/apps/AppBilling";
import AppCRM from "@/pages/apps/AppCRM";
import AppAnalytics from "@/pages/apps/AppAnalytics";
import AppHR from "@/pages/apps/AppHR";
import AppInventory from "@/pages/apps/AppInventory";
import AppProjects from "@/pages/apps/AppProjects";
import AppSeoAnalyzer from "@/pages/apps/AppSeoAnalyzer";
import AppTaskManager from "@/pages/apps/AppTaskManager";
import AppTimeTracking from "@/pages/apps/AppTimeTracking";
import AppWorkflow from "@/pages/apps/AppWorkflow";
import AppQuotes from "@/pages/apps/AppQuotes";
import AppExpenses from "@/pages/apps/AppExpenses";
import AppFinancialReport from "@/pages/apps/AppFinancialReport";
import AppRecurringPayments from "@/pages/apps/AppRecurringPayments";
import AppAutomatedReminders from "@/pages/apps/AppAutomatedReminders";
import AppStockManagement from "@/pages/apps/AppStockManagement";
import AppTradingJournal from "@/pages/apps/AppTradingJournal";
import AppAiWritingAssistant from "@/pages/apps/AppAiWritingAssistant";
import RentalManagement from "@/pages/RentalManagement";
import OrderManagement from "@/pages/OrderManagement";
import AppRentalManagement from "@/pages/apps/AppRentalManagement";
import AppOrderManagement from "@/pages/apps/AppOrderManagement";
import PasswordReset from "@/pages/PasswordReset";
import EmailChangeConfirmation from "@/pages/EmailChangeConfirmation";
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

const PaymentSuccessHandler = () => {
  const { refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    toast({
      title: "Achat réussi !",
      description: "Mise à jour de votre compte...",
    });

    const timer = setTimeout(async () => {
      await refreshProfile();
      navigate("/dashboard", { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [refreshProfile, toast, navigate]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-background">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-16 h-16 border-4 border-t-primary border-secondary rounded-full"
      />
      <p className="mt-4 text-muted-foreground">
        Finalisation de votre abonnement...
      </p>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-t-primary border-secondary rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  const hasSubscription = !!profile?.subscription_plan_id;

  if (!hasSubscription && location.pathname !== "/subscription") {
    return <Navigate to="/subscription" replace />;
  }

  if (hasSubscription && location.pathname === "/subscription") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const ProtectedModule = ({ children, requiredPermission, moduleKey }) => {
  const { hasPermission, isModuleActive } = useAuth();

  if (moduleKey && !isModuleActive(moduleKey)) {
    return <Navigate to="/marketplace" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/subscription" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, loading, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const isPaymentSuccess = searchParams.has("session_id");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-t-primary border-secondary rounded-full"
        />
      </div>
    );
  }

  if (isPaymentSuccess) {
    return <PaymentSuccessHandler />;
  }

  const MainLayout = ({ children }) => (
    <AppLayout
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      openCompanyDialog={() => setIsCompanyDialogOpen(true)}
    >
      {children}
      <CompanyDataDialog
        isOpen={isCompanyDialogOpen}
        onOpenChange={setIsCompanyDialogOpen}
      />
    </AppLayout>
  );

  // Modified AuthRedirect to handle non-logged in state more directly for login/signup pages
  const AuthRedirect = ({ PageComponent }) => {
    if (!user) {
      return <PageComponent />;
    }
    const hasSubscription = !!profile?.subscription_plan_id;
    return hasSubscription ? (
      <Navigate to="/dashboard" />
    ) : (
      <Navigate to="/subscription" />
    );
  };

  return (
    <Routes>
      <Route path="/welcome" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route
        path="/blog/5-astuces-pour-optimiser-votre-facturation"
        element={<BlogPost1 />}
      />
      <Route
        path="/blog/pourquoi-un-crm-est-essentiel-pour-votre-pme"
        element={<BlogPost2 />}
      />
      <Route
        path="/blog/comment-calculer-la-rentabilite-de-vos-produits"
        element={<BlogPost3 />}
      />
      <Route
        path="/blog/automatiser-les-taches-repetitives-pour-gagner-du-temps"
        element={<BlogPost4 />}
      />
      <Route
        path="/blog/creer-des-devis-qui-convertissent-a-coup-sur"
        element={<BlogPost5 />}
      />
      <Route
        path="/blog/l-importance-du-suivi-de-temps-pour-les-freelances"
        element={<BlogPost6 />}
      />
      <Route path="/login" element={<AuthRedirect PageComponent={Login} />} />
      <Route path="/signup" element={<AuthRedirect PageComponent={SignUp} />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route
        path="/email-change-confirmation"
        element={<EmailChangeConfirmation />}
      />

      <Route path="/apps/facturation" element={<AppBilling />} />
      <Route path="/apps/quotes" element={<AppQuotes />} />
      <Route path="/apps/crm" element={<AppCRM />} />
      <Route path="/apps/inventory" element={<AppInventory />} />
      <Route path="/apps/projects" element={<AppProjects />} />
      <Route path="/apps/time-tracking" element={<AppTimeTracking />} />
      <Route path="/apps/analytics" element={<AppAnalytics />} />
      <Route path="/apps/hr" element={<AppHR />} />
      <Route path="/apps/seo-analyzer" element={<AppSeoAnalyzer />} />
      <Route path="/apps/task-manager" element={<AppTaskManager />} />
      <Route path="/apps/expenses" element={<AppExpenses />} />
      <Route path="/apps/financial-report" element={<AppFinancialReport />} />
      <Route
        path="/apps/recurring-payments"
        element={<AppRecurringPayments />}
      />
      <Route
        path="/apps/automated-reminders"
        element={<AppAutomatedReminders />}
      />
      <Route path="/apps/stock-management" element={<AppStockManagement />} />
      <Route path="/apps/workflow" element={<AppWorkflow />} />
      <Route path="/apps/trading-journal" element={<AppTradingJournal />} />
      <Route
        path="/apps/ai-writing-assistant"
        element={<AppAiWritingAssistant />}
      />
      <Route path="/apps/rental-management" element={<AppRentalManagement />} />
      <Route path="/apps/order-management" element={<AppOrderManagement />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Navigate to="/dashboard" replace />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Marketplace />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/notes/:noteId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <NoteEditor />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="billing">
              <MainLayout>
                <Billing />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotes"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="quotes" requiredPermission="Pro">
              <MainLayout>
                <Quotes />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/crm"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="crm">
              <MainLayout>
                <CRM />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="inventory" requiredPermission="Pro">
              <MainLayout>
                <Inventory />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <ProtectedModule
              moduleKey="analytics"
              requiredPermission="Business"
            >
              <MainLayout>
                <Analytics />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="notes">
              <MainLayout>
                <Notes />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="calendar">
              <MainLayout>
                <CalendarPage />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="projects" requiredPermission="Business">
              <MainLayout>
                <Projects />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/time-tracking"
        element={
          <ProtectedRoute>
            <ProtectedModule
              moduleKey="time-tracking"
              requiredPermission="Business"
            >
              <MainLayout>
                <TimeTracking />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="expenses" requiredPermission="Pro">
              <MainLayout>
                <Expenses />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-report"
        element={
          <ProtectedRoute>
            <ProtectedModule
              moduleKey="financial-report"
              requiredPermission="Business"
            >
              <MainLayout>
                <FinancialReport />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/product-management"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="product-management">
              <MainLayout>
                <ProductManagement />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/task-manager"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="task-manager" requiredPermission="Pro">
              <MainLayout>
                <TaskManager />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recurring-payments"
        element={
          <ProtectedRoute>
            <ProtectedModule
              moduleKey="recurring-payments"
              requiredPermission="Business"
            >
              <MainLayout>
                <RecurringPayments />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/automated-reminders"
        element={
          <ProtectedRoute>
            <ProtectedModule
              moduleKey="automated-reminders"
              requiredPermission="Business"
            >
              <MainLayout>
                <AutomatedReminders />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="hr" requiredPermission="Business">
              <MainLayout>
                <HR />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/integrated-mail"
        element={
          <ProtectedRoute>
            <ProtectedModule
              moduleKey="integrated-mail"
              requiredPermission="Business"
            >
              <MainLayout>
                <IntegratedMail />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stock-management"
        element={
          <ProtectedRoute>
            <ProtectedModule
              moduleKey="stock-management"
              requiredPermission="Business"
            >
              <MainLayout>
                <StockManagement />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-management"
        element={
          <ProtectedRoute>
            <ProtectedModule
              moduleKey="order-management"
              requiredPermission="Business"
            >
              <MainLayout>
                <OrderManagement />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seo-analyzer"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="seo-analyzer" requiredPermission="Pro">
              <MainLayout>
                <SeoAnalyzer />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/budget"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="budget">
              <MainLayout>
                <Budget />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/trading-journal"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="trading-journal">
              <MainLayout>
                <TradingJournal />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-writing-assistant"
        element={
          <ProtectedRoute>
            <ProtectedModule
              moduleKey="ai-writing-assistant"
              requiredPermission="Business"
            >
              <MainLayout>
                <AiWritingAssistant />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/revenues"
        element={
          <ProtectedRoute>
            <ProtectedModule moduleKey="revenues">
              <MainLayout>
                <Revenues />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-strategy-map"
        element={
          <ProtectedRoute>
            <ProtectedModule
              moduleKey="ai-strategy-map"
              requiredPermission="Business"
            >
              <MainLayout>
                <AiStrategyMap />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rental-management"
        element={
          <ProtectedRoute>
            <ProtectedModule
              moduleKey="rental-management"
              requiredPermission="Pro"
            >
              <MainLayout>
                <RentalManagement />
              </MainLayout>
            </ProtectedModule>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
};

const AppLayout = ({
  children,
  isSidebarOpen,
  setIsSidebarOpen,
  openCompanyDialog,
}) => {
  return (
    <div className="flex min-h-screen dark bg-background text-white">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex-1 lg:ml-64 flex flex-col h-screen">
        {" "}
        {/* Added h-screen here */}
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          openCompanyDialog={openCompanyDialog}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <>
      <Helmet>
        <title>YourBizFlow - Your Business, Simplified</title>
        <meta
          name="description"
          content="Manage your business from A to Z on a single platform: YourBizFlow."
        />
      </Helmet>
      <ScrollToTop />
      <div className="min-h-screen bg-background">
        <AppRoutes />
        <Toaster />
      </div>
    </>
  );
}

export default App;
