import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { FileText, Zap, Clock, BarChart, Mail, DollarSign } from 'lucide-react';

const BillingDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Facturation',
      metaDescription: 'Créez, gérez et envoyez vos factures professionnelles en quelques clics. Solution de facturation complète pour entrepreneurs et PME.',
      heroTitle: 'Facturation Professionnelle Simplifiée',
      heroDescription: 'Créez des factures professionnelles en quelques secondes, suivez vos paiements et gérez votre comptabilité facilement.',
      ctaText: 'Essayer la facturation',
      features: [
        {
          icon: FileText,
          title: 'Création rapide',
          description: 'Créez des factures professionnelles en quelques clics avec des modèles personnalisables.'
        },
        {
          icon: Zap,
          title: 'Envoi automatique',
          description: 'Envoyez vos factures par email directement depuis l\'application.'
        },
        {
          icon: Clock,
          title: 'Suivi des paiements',
          description: 'Suivez l\'état de vos factures : payées, en attente ou en retard.'
        },
        {
          icon: BarChart,
          title: 'Rapports financiers',
          description: 'Générez des rapports détaillés pour suivre vos revenus et votre activité.'
        },
        {
          icon: Mail,
          title: 'Relances automatiques',
          description: 'Programmez des relances automatiques pour les factures impayées.'
        },
        {
          icon: DollarSign,
          title: 'Multi-devises',
          description: 'Créez des factures dans plusieurs devises pour vos clients internationaux.'
        }
      ],
      benefits: [
        {
          title: 'Gain de temps',
          description: 'Créez vos factures en quelques secondes au lieu de plusieurs minutes.'
        },
        {
          title: 'Professionnalisme',
          description: 'Impressionnez vos clients avec des factures au design soigné et professionnel.'
        },
        {
          title: 'Meilleure trésorerie',
          description: 'Améliorez votre trésorerie avec un suivi précis et des relances automatiques.'
        },
        {
          title: 'Conformité légale',
          description: 'Respectez les obligations légales avec des factures conformes.'
        }
      ],
      useCases: [
        {
          title: 'Freelances',
          description: 'Facturez vos clients rapidement et professionnellement pour chaque mission.'
        },
        {
          title: 'PME',
          description: 'Gérez toute votre facturation client avec un outil simple et efficace.'
        },
        {
          title: 'Agences',
          description: 'Créez des factures pour vos différents projets et clients en un clin d\'œil.'
        },
        {
          title: 'Consultants',
          description: 'Facturez vos prestations de conseil avec des devis et factures professionnels.'
        }
      ]
    },
    en: {
      title: 'Billing',
      metaDescription: 'Create, manage and send professional invoices in just a few clicks. Complete billing solution for entrepreneurs and SMEs.',
      heroTitle: 'Simplified Professional Billing',
      heroDescription: 'Create professional invoices in seconds, track payments and manage your accounting easily.',
      ctaText: 'Try Billing',
      features: [
        {
          icon: FileText,
          title: 'Quick Creation',
          description: 'Create professional invoices in a few clicks with customizable templates.'
        },
        {
          icon: Zap,
          title: 'Automatic Sending',
          description: 'Send your invoices by email directly from the application.'
        },
        {
          icon: Clock,
          title: 'Payment Tracking',
          description: 'Track the status of your invoices: paid, pending or overdue.'
        },
        {
          icon: BarChart,
          title: 'Financial Reports',
          description: 'Generate detailed reports to track your revenue and activity.'
        },
        {
          icon: Mail,
          title: 'Automatic Reminders',
          description: 'Schedule automatic reminders for unpaid invoices.'
        },
        {
          icon: DollarSign,
          title: 'Multi-currency',
          description: 'Create invoices in multiple currencies for your international clients.'
        }
      ],
      benefits: [
        {
          title: 'Time Saving',
          description: 'Create your invoices in seconds instead of several minutes.'
        },
        {
          title: 'Professionalism',
          description: 'Impress your clients with well-designed and professional invoices.'
        },
        {
          title: 'Better Cash Flow',
          description: 'Improve your cash flow with accurate tracking and automatic reminders.'
        },
        {
          title: 'Legal Compliance',
          description: 'Meet legal obligations with compliant invoices.'
        }
      ],
      useCases: [
        {
          title: 'Freelancers',
          description: 'Invoice your clients quickly and professionally for each project.'
        },
        {
          title: 'SMEs',
          description: 'Manage all your customer billing with a simple and efficient tool.'
        },
        {
          title: 'Agencies',
          description: 'Create invoices for your different projects and clients in a snap.'
        },
        {
          title: 'Consultants',
          description: 'Invoice your consulting services with professional quotes and invoices.'
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
      icon={FileText}
      features={data.features}
      benefits={data.benefits}
      useCases={data.useCases}
      appPath="/billing"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default BillingDescription;
