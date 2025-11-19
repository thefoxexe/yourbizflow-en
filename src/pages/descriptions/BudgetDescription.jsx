import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { PiggyBank, TrendingUp, Calendar, Bell, PieChart, Target } from 'lucide-react';

const BudgetDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Gestion de Budget',
      metaDescription: 'Gérez votre budget efficacement. Suivez vos dépenses, définissez des objectifs et atteignez vos cibles financières.',
      heroTitle: 'Maîtrisez votre Budget',
      heroDescription: 'Planifiez, suivez et optimisez vos finances avec des outils de budgétisation puissants.',
      ctaText: 'Commencer à budgétiser',
      features: [
        {
          icon: PiggyBank,
          title: 'Budgets personnalisés',
          description: 'Créez des budgets par catégorie adaptés à vos besoins.'
        },
        {
          icon: TrendingUp,
          title: 'Suivi en temps réel',
          description: 'Visualisez vos dépenses et revenus en direct.'
        },
        {
          icon: Calendar,
          title: 'Prévisions',
          description: 'Anticipez vos finances avec des projections automatiques.'
        },
        {
          icon: Bell,
          title: 'Alertes budget',
          description: 'Recevez des notifications avant de dépasser vos limites.'
        },
        {
          icon: PieChart,
          title: 'Analyses visuelles',
          description: 'Graphiques et rapports pour comprendre vos finances.'
        },
        {
          icon: Target,
          title: 'Objectifs financiers',
          description: 'Définissez et suivez vos objectifs d\'épargne.'
        }
      ],
      benefits: [
        {
          title: 'Contrôle total',
          description: 'Gardez le contrôle de vos finances en tout temps.'
        },
        {
          title: 'Économies accrues',
          description: 'Identifiez les dépenses inutiles et économisez plus.'
        },
        {
          title: 'Planification facilitée',
          description: 'Planifiez vos dépenses futures en toute confiance.'
        },
        {
          title: 'Tranquillité d\'esprit',
          description: 'Plus de stress financier avec une vision claire.'
        }
      ],
      useCases: [
        {
          title: 'Entrepreneurs',
          description: 'Gérez le budget de votre entreprise et vos finances personnelles.'
        },
        {
          title: 'Freelances',
          description: 'Suivez vos revenus irréguliers et planifiez en conséquence.'
        },
        {
          title: 'Familles',
          description: 'Gérez le budget familial et atteignez vos objectifs ensemble.'
        },
        {
          title: 'Étudiants',
          description: 'Apprenez à gérer votre argent dès maintenant.'
        }
      ]
    },
    en: {
      title: 'Budget Management',
      metaDescription: 'Manage your budget effectively. Track expenses, set goals and achieve your financial targets.',
      heroTitle: 'Master Your Budget',
      heroDescription: 'Plan, track and optimize your finances with powerful budgeting tools.',
      ctaText: 'Start Budgeting',
      features: [
        {
          icon: PiggyBank,
          title: 'Custom Budgets',
          description: 'Create category-based budgets tailored to your needs.'
        },
        {
          icon: TrendingUp,
          title: 'Real-time Tracking',
          description: 'Visualize your expenses and income in real-time.'
        },
        {
          icon: Calendar,
          title: 'Forecasting',
          description: 'Anticipate your finances with automatic projections.'
        },
        {
          icon: Bell,
          title: 'Budget Alerts',
          description: 'Get notifications before exceeding your limits.'
        },
        {
          icon: PieChart,
          title: 'Visual Analytics',
          description: 'Charts and reports to understand your finances.'
        },
        {
          icon: Target,
          title: 'Financial Goals',
          description: 'Set and track your savings objectives.'
        }
      ],
      benefits: [
        {
          title: 'Total Control',
          description: 'Keep control of your finances at all times.'
        },
        {
          title: 'Increased Savings',
          description: 'Identify unnecessary expenses and save more.'
        },
        {
          title: 'Easy Planning',
          description: 'Plan your future expenses with confidence.'
        },
        {
          title: 'Peace of Mind',
          description: 'No more financial stress with a clear vision.'
        }
      ],
      useCases: [
        {
          title: 'Entrepreneurs',
          description: 'Manage your business budget and personal finances.'
        },
        {
          title: 'Freelancers',
          description: 'Track irregular income and plan accordingly.'
        },
        {
          title: 'Families',
          description: 'Manage family budget and achieve goals together.'
        },
        {
          title: 'Students',
          description: 'Learn to manage your money from now.'
        }
      ]
    }
  };

  const data = isFr ? content.fr : content.en;

  return (
    <AppDescriptionTemplate
      title={data.title}
      description={data.metaDescription}
      metaDescription={data.metaDescription}
      icon={PiggyBank}
      features={data.features}
      benefits={data.benefits}
      useCases={data.useCases}
      appPath="/budget"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default BudgetDescription;
