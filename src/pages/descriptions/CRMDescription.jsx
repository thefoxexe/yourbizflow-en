import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { Users, Search, TrendingUp, Bell, FileSpreadsheet, Tag } from 'lucide-react';

const CRMDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'CRM - Gestion de la Relation Client',
      metaDescription: 'Gérez vos contacts, prospects et clients efficacement. CRM simple et puissant pour développer votre activité commerciale.',
      heroTitle: 'CRM Simple et Puissant',
      heroDescription: 'Centralisez tous vos contacts, suivez vos interactions et développez votre activité commerciale.',
      ctaText: 'Essayer le CRM',
      features: [
        {
          icon: Users,
          title: 'Gestion des contacts',
          description: 'Centralisez tous vos contacts clients et prospects dans une base unique.'
        },
        {
          icon: Search,
          title: 'Recherche avancée',
          description: 'Trouvez rapidement n\'importe quel contact avec des filtres puissants.'
        },
        {
          icon: TrendingUp,
          title: 'Suivi des opportunités',
          description: 'Suivez vos opportunités de vente et votre pipeline commercial.'
        },
        {
          icon: Bell,
          title: 'Rappels automatiques',
          description: 'Recevez des rappels pour ne jamais oublier un suivi client.'
        },
        {
          icon: FileSpreadsheet,
          title: 'Import/Export',
          description: 'Importez vos contacts depuis Excel ou CSV en quelques clics.'
        },
        {
          icon: Tag,
          title: 'Segmentation',
          description: 'Organisez vos contacts par catégories, tags et statuts personnalisés.'
        }
      ],
      benefits: [
        {
          title: 'Plus de ventes',
          description: 'Ne perdez plus aucune opportunité commerciale grâce au suivi systématique.'
        },
        {
          title: 'Meilleure relation client',
          description: 'Personnalisez vos interactions avec un historique complet de chaque client.'
        },
        {
          title: 'Gain de temps',
          description: 'Retrouvez instantanément toutes les informations dont vous avez besoin.'
        },
        {
          title: 'Vision d\'ensemble',
          description: 'Visualisez votre activité commerciale et vos performances en un coup d\'œil.'
        }
      ],
      useCases: [
        {
          title: 'Équipes commerciales',
          description: 'Gérez votre pipeline de ventes et suivez vos prospects jusqu\'à la conversion.'
        },
        {
          title: 'Services clients',
          description: 'Accédez rapidement à l\'historique complet de chaque client pour un service optimal.'
        },
        {
          title: 'Freelances',
          description: 'Gardez le contact avec vos clients et prospects pour développer votre activité.'
        },
        {
          title: 'PME',
          description: 'Centralisez la gestion de vos relations clients pour toute votre entreprise.'
        }
      ]
    },
    en: {
      title: 'CRM - Customer Relationship Management',
      metaDescription: 'Manage your contacts, prospects and customers effectively. Simple and powerful CRM to grow your business.',
      heroTitle: 'Simple and Powerful CRM',
      heroDescription: 'Centralize all your contacts, track your interactions and grow your business.',
      ctaText: 'Try CRM',
      features: [
        {
          icon: Users,
          title: 'Contact Management',
          description: 'Centralize all your customer and prospect contacts in a single database.'
        },
        {
          icon: Search,
          title: 'Advanced Search',
          description: 'Quickly find any contact with powerful filters.'
        },
        {
          icon: TrendingUp,
          title: 'Opportunity Tracking',
          description: 'Track your sales opportunities and commercial pipeline.'
        },
        {
          icon: Bell,
          title: 'Automatic Reminders',
          description: 'Receive reminders to never forget a customer follow-up.'
        },
        {
          icon: FileSpreadsheet,
          title: 'Import/Export',
          description: 'Import your contacts from Excel or CSV in just a few clicks.'
        },
        {
          icon: Tag,
          title: 'Segmentation',
          description: 'Organize your contacts by categories, tags and custom statuses.'
        }
      ],
      benefits: [
        {
          title: 'More Sales',
          description: 'Never lose a business opportunity with systematic tracking.'
        },
        {
          title: 'Better Customer Relations',
          description: 'Personalize your interactions with a complete history of each customer.'
        },
        {
          title: 'Time Saving',
          description: 'Instantly find all the information you need.'
        },
        {
          title: 'Overview',
          description: 'Visualize your business activity and performance at a glance.'
        }
      ],
      useCases: [
        {
          title: 'Sales Teams',
          description: 'Manage your sales pipeline and track prospects to conversion.'
        },
        {
          title: 'Customer Service',
          description: 'Quickly access the complete history of each customer for optimal service.'
        },
        {
          title: 'Freelancers',
          description: 'Stay in touch with your clients and prospects to grow your business.'
        },
        {
          title: 'SMEs',
          description: 'Centralize customer relationship management for your entire company.'
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
      icon={Users}
      features={data.features}
      benefits={data.benefits}
      useCases={data.useCases}
      appPath="/crm"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default CRMDescription;
