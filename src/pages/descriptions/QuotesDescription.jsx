import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { FileText, Send, CheckCircle, Calculator, Clock, Palette } from 'lucide-react';

const QuotesDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Devis',
      metaDescription: 'Créez des devis professionnels en quelques minutes. Modèles personnalisables, suivi des acceptations et conversion en factures.',
      heroTitle: 'Devis Professionnels en Quelques Clics',
      heroDescription: 'Créez, envoyez et suivez vos devis facilement. Convertissez-les en factures d\'un simple clic.',
      ctaText: 'Essayer les devis',
      features: [
        {
          icon: FileText,
          title: 'Création rapide',
          description: 'Créez des devis professionnels en quelques minutes avec des modèles prêts à l\'emploi.'
        },
        {
          icon: Palette,
          title: 'Personnalisation',
          description: 'Personnalisez vos devis avec votre logo, couleurs et conditions.'
        },
        {
          icon: Calculator,
          title: 'Calcul automatique',
          description: 'Les totaux, TVA et remises sont calculés automatiquement.'
        },
        {
          icon: Send,
          title: 'Envoi par email',
          description: 'Envoyez vos devis directement par email depuis l\'application.'
        },
        {
          icon: Clock,
          title: 'Suivi des statuts',
          description: 'Suivez l\'état de vos devis : en attente, acceptés, refusés ou expirés.'
        },
        {
          icon: CheckCircle,
          title: 'Conversion en facture',
          description: 'Convertissez un devis accepté en facture d\'un simple clic.'
        }
      ],
      benefits: [
        {
          title: 'Professionnalisme',
          description: 'Impressionnez vos prospects avec des devis soignés et détaillés.'
        },
        {
          title: 'Rapidité',
          description: 'Répondez aux demandes de devis en quelques minutes au lieu d\'heures.'
        },
        {
          title: 'Taux de conversion',
          description: 'Augmentez votre taux de conversion avec des devis clairs et attractifs.'
        },
        {
          title: 'Organisation',
          description: 'Gardez une trace de tous vos devis et leur statut en un seul endroit.'
        }
      ],
      useCases: [
        {
          title: 'Freelances',
          description: 'Proposez vos services avec des devis détaillés et professionnels.'
        },
        {
          title: 'Artisans',
          description: 'Chiffrez vos travaux rapidement avec des devis personnalisés.'
        },
        {
          title: 'Agences',
          description: 'Créez des propositions commerciales pour vos différents services.'
        },
        {
          title: 'Consultants',
          description: 'Présentez vos prestations de conseil avec des devis détaillés.'
        }
      ]
    },
    en: {
      title: 'Quotes',
      metaDescription: 'Create professional quotes in minutes. Customizable templates, acceptance tracking and conversion to invoices.',
      heroTitle: 'Professional Quotes in a Few Clicks',
      heroDescription: 'Create, send and track your quotes easily. Convert them to invoices with a single click.',
      ctaText: 'Try Quotes',
      features: [
        {
          icon: FileText,
          title: 'Quick Creation',
          description: 'Create professional quotes in minutes with ready-to-use templates.'
        },
        {
          icon: Palette,
          title: 'Customization',
          description: 'Customize your quotes with your logo, colors and terms.'
        },
        {
          icon: Calculator,
          title: 'Automatic Calculation',
          description: 'Totals, VAT and discounts are calculated automatically.'
        },
        {
          icon: Send,
          title: 'Email Sending',
          description: 'Send your quotes directly by email from the application.'
        },
        {
          icon: Clock,
          title: 'Status Tracking',
          description: 'Track the status of your quotes: pending, accepted, rejected or expired.'
        },
        {
          icon: CheckCircle,
          title: 'Convert to Invoice',
          description: 'Convert an accepted quote to an invoice with a single click.'
        }
      ],
      benefits: [
        {
          title: 'Professionalism',
          description: 'Impress your prospects with polished and detailed quotes.'
        },
        {
          title: 'Speed',
          description: 'Respond to quote requests in minutes instead of hours.'
        },
        {
          title: 'Conversion Rate',
          description: 'Increase your conversion rate with clear and attractive quotes.'
        },
        {
          title: 'Organization',
          description: 'Keep track of all your quotes and their status in one place.'
        }
      ],
      useCases: [
        {
          title: 'Freelancers',
          description: 'Propose your services with detailed and professional quotes.'
        },
        {
          title: 'Contractors',
          description: 'Estimate your work quickly with customized quotes.'
        },
        {
          title: 'Agencies',
          description: 'Create commercial proposals for your various services.'
        },
        {
          title: 'Consultants',
          description: 'Present your consulting services with detailed quotes.'
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
      appPath="/quotes"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default QuotesDescription;
