import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { Repeat, CreditCard, Calendar, Bell, TrendingUp, Shield } from 'lucide-react';

const RecurringPaymentsDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Paiements Récurrents',
      metaDescription: 'Automatisez vos paiements récurrents. Gérez abonnements, factures mensuelles et revenus prévisibles.',
      heroTitle: 'Automatisez vos Revenus',
      heroDescription: 'Mettez en place des paiements récurrents pour garantir un flux de trésorerie stable.',
      ctaText: 'Essayer les paiements récurrents',
      features: [
        {
          icon: Repeat,
          title: 'Facturation automatique',
          description: 'Factures générées et envoyées automatiquement.'
        },
        {
          icon: CreditCard,
          title: 'Paiements automatisés',
          description: 'Encaissements automatiques par carte ou prélèvement.'
        },
        {
          icon: Calendar,
          title: 'Planification flexible',
          description: 'Fréquences personnalisables (mensuel, annuel, etc.).'
        },
        {
          icon: Bell,
          title: 'Rappels clients',
          description: 'Notifications automatiques avant échéance.'
        },
        {
          icon: TrendingUp,
          title: 'Suivi MRR',
          description: 'Analysez vos revenus récurrents mensuels.'
        },
        {
          icon: Shield,
          title: 'Gestion des échecs',
          description: 'Réessais automatiques en cas d\'échec de paiement.'
        }
      ],
      benefits: [
        {
          title: 'Revenus prévisibles',
          description: 'Garantissez un flux de trésorerie constant.'
        },
        {
          title: 'Temps économisé',
          description: 'Éliminez la facturation manuelle mensuelle.'
        },
        {
          title: 'Moins d\'impayés',
          description: 'Réduisez les oublis et retards de paiement.'
        },
        {
          title: 'Satisfaction client',
          description: 'Expérience sans friction pour vos clients.'
        }
      ],
      useCases: [
        {
          title: 'SaaS',
          description: 'Gérez les abonnements de vos utilisateurs.'
        },
        {
          title: 'Services',
          description: 'Facturez vos prestations récurrentes automatiquement.'
        },
        {
          title: 'Associations',
          description: 'Collectez les cotisations de vos membres.'
        },
        {
          title: 'Locations',
          description: 'Automatisez les loyers et charges mensuels.'
        }
      ]
    },
    en: {
      title: 'Recurring Payments',
      metaDescription: 'Automate your recurring payments. Manage subscriptions, monthly invoices and predictable revenue.',
      heroTitle: 'Automate Your Revenue',
      heroDescription: 'Set up recurring payments to ensure stable cash flow.',
      ctaText: 'Try Recurring Payments',
      features: [
        {
          icon: Repeat,
          title: 'Automatic Billing',
          description: 'Invoices generated and sent automatically.'
        },
        {
          icon: CreditCard,
          title: 'Automated Payments',
          description: 'Automatic collection by card or direct debit.'
        },
        {
          icon: Calendar,
          title: 'Flexible Scheduling',
          description: 'Customizable frequencies (monthly, annual, etc.).'
        },
        {
          icon: Bell,
          title: 'Customer Reminders',
          description: 'Automatic notifications before due date.'
        },
        {
          icon: TrendingUp,
          title: 'MRR Tracking',
          description: 'Analyze your monthly recurring revenue.'
        },
        {
          icon: Shield,
          title: 'Failure Management',
          description: 'Automatic retries on payment failure.'
        }
      ],
      benefits: [
        {
          title: 'Predictable Revenue',
          description: 'Guarantee constant cash flow.'
        },
        {
          title: 'Time Saved',
          description: 'Eliminate manual monthly invoicing.'
        },
        {
          title: 'Fewer Unpaid',
          description: 'Reduce forgotten and late payments.'
        },
        {
          title: 'Customer Satisfaction',
          description: 'Frictionless experience for your customers.'
        }
      ],
      useCases: [
        {
          title: 'SaaS',
          description: 'Manage your users\' subscriptions.'
        },
        {
          title: 'Services',
          description: 'Bill your recurring services automatically.'
        },
        {
          title: 'Associations',
          description: 'Collect member dues automatically.'
        },
        {
          title: 'Rentals',
          description: 'Automate monthly rents and charges.'
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
      icon={Repeat}
      features={data.features}
      benefits={data.benefits}
      useCases={data.useCases}
      appPath="/recurring-payments"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default RecurringPaymentsDescription;
