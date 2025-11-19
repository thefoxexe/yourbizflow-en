import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { Workflow, Zap, Link2, Clock, BarChart, Code } from 'lucide-react';

const WorkflowDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Automatisation de Workflows',
      metaDescription: 'Automatisez vos processus métier avec des workflows personnalisables. Connectez vos apps et économisez des heures chaque semaine.',
      heroTitle: 'Automatisation Intelligente',
      heroDescription: 'Créez des workflows automatisés pour éliminer les tâches répétitives et gagner un temps précieux.',
      ctaText: 'Essayer l\'automatisation',
      features: [
        {
          icon: Workflow,
          title: 'Workflows visuels',
          description: 'Créez des workflows complexes avec un éditeur visuel simple et intuitif.'
        },
        {
          icon: Zap,
          title: 'Déclencheurs',
          description: 'Démarrez des workflows automatiquement selon des conditions définies.'
        },
        {
          icon: Link2,
          title: 'Intégrations',
          description: 'Connectez vos applications favorites pour automatiser les transferts de données.'
        },
        {
          icon: Clock,
          title: 'Planification',
          description: 'Programmez l\'exécution de workflows à des horaires précis.'
        },
        {
          icon: Code,
          title: 'Actions personnalisées',
          description: 'Créez des actions sur mesure pour vos besoins spécifiques.'
        },
        {
          icon: BarChart,
          title: 'Monitoring',
          description: 'Suivez l\'exécution de vos workflows et identifiez les erreurs.'
        }
      ],
      benefits: [
        {
          title: 'Gain de temps massif',
          description: 'Économisez des heures chaque semaine en automatisant les tâches répétitives.'
        },
        {
          title: 'Zéro erreur',
          description: 'Éliminez les erreurs humaines avec des processus automatisés fiables.'
        },
        {
          title: 'Productivité',
          description: 'Concentrez-vous sur les tâches à forte valeur ajoutée.'
        },
        {
          title: 'Évolutivité',
          description: 'Scalez votre activité sans augmenter proportionnellement les ressources.'
        }
      ],
      useCases: [
        {
          title: 'E-commerce',
          description: 'Automatisez la gestion des commandes, de l\'inventaire aux notifications clients.'
        },
        {
          title: 'Marketing',
          description: 'Créez des campagnes automatisées selon le comportement des utilisateurs.'
        },
        {
          title: 'Service client',
          description: 'Automatisez le tri et la répartition des tickets de support.'
        },
        {
          title: 'Finance',
          description: 'Automatisez la facturation récurrente et les relances de paiement.'
        }
      ]
    },
    en: {
      title: 'Workflow Automation',
      metaDescription: 'Automate your business processes with customizable workflows. Connect your apps and save hours every week.',
      heroTitle: 'Intelligent Automation',
      heroDescription: 'Create automated workflows to eliminate repetitive tasks and save precious time.',
      ctaText: 'Try Automation',
      features: [
        {
          icon: Workflow,
          title: 'Visual Workflows',
          description: 'Create complex workflows with a simple and intuitive visual editor.'
        },
        {
          icon: Zap,
          title: 'Triggers',
          description: 'Start workflows automatically based on defined conditions.'
        },
        {
          icon: Link2,
          title: 'Integrations',
          description: 'Connect your favorite apps to automate data transfers.'
        },
        {
          icon: Clock,
          title: 'Scheduling',
          description: 'Schedule workflow execution at specific times.'
        },
        {
          icon: Code,
          title: 'Custom Actions',
          description: 'Create custom actions for your specific needs.'
        },
        {
          icon: BarChart,
          title: 'Monitoring',
          description: 'Track workflow execution and identify errors.'
        }
      ],
      benefits: [
        {
          title: 'Massive Time Savings',
          description: 'Save hours every week by automating repetitive tasks.'
        },
        {
          title: 'Zero Errors',
          description: 'Eliminate human errors with reliable automated processes.'
        },
        {
          title: 'Productivity',
          description: 'Focus on high-value tasks.'
        },
        {
          title: 'Scalability',
          description: 'Scale your business without proportionally increasing resources.'
        }
      ],
      useCases: [
        {
          title: 'E-commerce',
          description: 'Automate order management, from inventory to customer notifications.'
        },
        {
          title: 'Marketing',
          description: 'Create automated campaigns based on user behavior.'
        },
        {
          title: 'Customer Service',
          description: 'Automate sorting and distribution of support tickets.'
        },
        {
          title: 'Finance',
          description: 'Automate recurring billing and payment reminders.'
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
      icon={Workflow}
      features={data.features}
      benefits={data.benefits}
      useCases={data.useCases}
      appPath="/workflow-automation"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default WorkflowDescription;
