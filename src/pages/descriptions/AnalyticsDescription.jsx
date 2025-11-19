import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { BarChart3, TrendingUp, PieChart, Activity, Download, Eye } from 'lucide-react';

const AnalyticsDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Analyse et Statistiques',
      metaDescription: 'Visualisez vos données avec des graphiques et tableaux de bord interactifs. Prenez des décisions éclairées grâce aux analytics.',
      heroTitle: 'Analytics et Rapports Détaillés',
      heroDescription: 'Transformez vos données en insights actionnables avec des tableaux de bord visuels et intuitifs.',
      ctaText: 'Essayer les analytics',
      features: [
        {
          icon: BarChart3,
          title: 'Tableaux de bord',
          description: 'Visualisez vos KPI les plus importants sur des tableaux de bord personnalisables.'
        },
        {
          icon: TrendingUp,
          title: 'Analyse des tendances',
          description: 'Identifiez les tendances et patterns dans vos données au fil du temps.'
        },
        {
          icon: PieChart,
          title: 'Graphiques variés',
          description: 'Affichez vos données sous forme de graphiques en barres, courbes, camemberts, etc.'
        },
        {
          icon: Activity,
          title: 'Temps réel',
          description: 'Suivez vos métriques en temps réel pour réagir rapidement.'
        },
        {
          icon: Eye,
          title: 'Rapports personnalisés',
          description: 'Créez des rapports sur mesure selon vos besoins spécifiques.'
        },
        {
          icon: Download,
          title: 'Export de données',
          description: 'Exportez vos rapports et données en PDF, Excel ou CSV.'
        }
      ],
      benefits: [
        {
          title: 'Décisions éclairées',
          description: 'Prenez de meilleures décisions basées sur des données concrètes.'
        },
        {
          title: 'Visibilité totale',
          description: 'Comprenez en profondeur votre activité et vos performances.'
        },
        {
          title: 'Gain de temps',
          description: 'Visualisez instantanément vos KPI sans créer de rapports manuellement.'
        },
        {
          title: 'Anticipation',
          description: 'Identifiez les problèmes avant qu\'ils ne deviennent critiques.'
        }
      ],
      useCases: [
        {
          title: 'E-commerce',
          description: 'Suivez vos ventes, taux de conversion et comportement des clients.'
        },
        {
          title: 'SaaS',
          description: 'Analysez vos métriques d\'acquisition, rétention et churn.'
        },
        {
          title: 'Marketing',
          description: 'Mesurez le ROI de vos campagnes et l\'engagement de votre audience.'
        },
        {
          title: 'PME',
          description: 'Visualisez vos revenus, dépenses et rentabilité en un coup d\'œil.'
        }
      ]
    },
    en: {
      title: 'Analytics and Statistics',
      metaDescription: 'Visualize your data with interactive charts and dashboards. Make informed decisions with analytics.',
      heroTitle: 'Analytics and Detailed Reports',
      heroDescription: 'Transform your data into actionable insights with visual and intuitive dashboards.',
      ctaText: 'Try Analytics',
      features: [
        {
          icon: BarChart3,
          title: 'Dashboards',
          description: 'Visualize your most important KPIs on customizable dashboards.'
        },
        {
          icon: TrendingUp,
          title: 'Trend Analysis',
          description: 'Identify trends and patterns in your data over time.'
        },
        {
          icon: PieChart,
          title: 'Various Charts',
          description: 'Display your data as bar charts, line graphs, pie charts, etc.'
        },
        {
          icon: Activity,
          title: 'Real-time',
          description: 'Track your metrics in real-time to react quickly.'
        },
        {
          icon: Eye,
          title: 'Custom Reports',
          description: 'Create tailored reports according to your specific needs.'
        },
        {
          icon: Download,
          title: 'Data Export',
          description: 'Export your reports and data in PDF, Excel or CSV.'
        }
      ],
      benefits: [
        {
          title: 'Informed Decisions',
          description: 'Make better decisions based on concrete data.'
        },
        {
          title: 'Total Visibility',
          description: 'Understand your business and performance in depth.'
        },
        {
          title: 'Time Saving',
          description: 'Instantly visualize your KPIs without creating manual reports.'
        },
        {
          title: 'Anticipation',
          description: 'Identify problems before they become critical.'
        }
      ],
      useCases: [
        {
          title: 'E-commerce',
          description: 'Track your sales, conversion rates and customer behavior.'
        },
        {
          title: 'SaaS',
          description: 'Analyze your acquisition, retention and churn metrics.'
        },
        {
          title: 'Marketing',
          description: 'Measure the ROI of your campaigns and audience engagement.'
        },
        {
          title: 'SMEs',
          description: 'Visualize your revenue, expenses and profitability at a glance.'
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
      icon={BarChart3}
      features={data.features}
      benefits={data.benefits}
      useCases={data.useCases}
      appPath="/analytics"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default AnalyticsDescription;
