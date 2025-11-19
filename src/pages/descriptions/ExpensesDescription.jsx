import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { Receipt, Camera, PieChart, Download, Filter, TrendingDown } from 'lucide-react';

const ExpensesDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Gestion des Dépenses',
      metaDescription: 'Suivez et gérez vos dépenses professionnelles facilement. Scanner de reçus, catégorisation automatique et rapports détaillés.',
      heroTitle: 'Gestion des Dépenses Simplifiée',
      heroDescription: 'Scannez vos reçus, catégorisez vos dépenses et générez des rapports en quelques clics.',
      ctaText: 'Essayer la gestion des dépenses',
      features: [
        {
          icon: Receipt,
          title: 'Suivi des dépenses',
          description: 'Enregistrez toutes vos dépenses professionnelles en quelques secondes.'
        },
        {
          icon: Camera,
          title: 'Scanner de reçus',
          description: 'Photographiez vos reçus et l\'application extrait automatiquement les données.'
        },
        {
          icon: PieChart,
          title: 'Catégorisation',
          description: 'Classez vos dépenses par catégories pour une meilleure analyse.'
        },
        {
          icon: Filter,
          title: 'Filtres avancés',
          description: 'Trouvez rapidement n\'importe quelle dépense avec des filtres puissants.'
        },
        {
          icon: Download,
          title: 'Export comptable',
          description: 'Exportez vos données pour votre comptable ou votre logiciel comptable.'
        },
        {
          icon: TrendingDown,
          title: 'Analyse des coûts',
          description: 'Identifiez les postes de dépenses et optimisez vos coûts.'
        }
      ],
      benefits: [
        {
          title: 'Gain de temps',
          description: 'Finissez-en avec la saisie manuelle grâce au scanner de reçus.'
        },
        {
          title: 'Meilleur contrôle',
          description: 'Gardez un œil sur toutes vos dépenses en temps réel.'
        },
        {
          title: 'Conformité',
          description: 'Conservez tous vos justificatifs de manière organisée et sécurisée.'
        },
        {
          title: 'Optimisation',
          description: 'Identifiez les opportunités de réduction de coûts.'
        }
      ],
      useCases: [
        {
          title: 'Freelances',
          description: 'Suivez toutes vos dépenses professionnelles pour optimiser vos déductions fiscales.'
        },
        {
          title: 'PME',
          description: 'Centralisez les dépenses de tous vos collaborateurs pour un meilleur contrôle.'
        },
        {
          title: 'Commerciaux',
          description: 'Enregistrez vos frais de déplacement et notes de frais facilement.'
        },
        {
          title: 'Entrepreneurs',
          description: 'Gardez une trace de tous vos investissements et dépenses d\'exploitation.'
        }
      ]
    },
    en: {
      title: 'Expense Management',
      metaDescription: 'Track and manage your business expenses easily. Receipt scanner, automatic categorization and detailed reports.',
      heroTitle: 'Simplified Expense Management',
      heroDescription: 'Scan your receipts, categorize your expenses and generate reports in just a few clicks.',
      ctaText: 'Try Expense Management',
      features: [
        {
          icon: Receipt,
          title: 'Expense Tracking',
          description: 'Record all your business expenses in seconds.'
        },
        {
          icon: Camera,
          title: 'Receipt Scanner',
          description: 'Photograph your receipts and the app automatically extracts the data.'
        },
        {
          icon: PieChart,
          title: 'Categorization',
          description: 'Classify your expenses by categories for better analysis.'
        },
        {
          icon: Filter,
          title: 'Advanced Filters',
          description: 'Quickly find any expense with powerful filters.'
        },
        {
          icon: Download,
          title: 'Accounting Export',
          description: 'Export your data for your accountant or accounting software.'
        },
        {
          icon: TrendingDown,
          title: 'Cost Analysis',
          description: 'Identify expense items and optimize your costs.'
        }
      ],
      benefits: [
        {
          title: 'Time Saving',
          description: 'No more manual entry thanks to receipt scanning.'
        },
        {
          title: 'Better Control',
          description: 'Keep an eye on all your expenses in real-time.'
        },
        {
          title: 'Compliance',
          description: 'Keep all your receipts organized and secure.'
        },
        {
          title: 'Optimization',
          description: 'Identify cost reduction opportunities.'
        }
      ],
      useCases: [
        {
          title: 'Freelancers',
          description: 'Track all your business expenses to optimize your tax deductions.'
        },
        {
          title: 'SMEs',
          description: 'Centralize expenses from all your employees for better control.'
        },
        {
          title: 'Sales Teams',
          description: 'Record your travel expenses and expense reports easily.'
        },
        {
          title: 'Entrepreneurs',
          description: 'Keep track of all your investments and operating expenses.'
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
      icon={Receipt}
      features={data.features}
      benefits={data.benefits}
      useCases={data.useCases}
      appPath="/expenses"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default ExpensesDescription;
