import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { Clock, Play, BarChart2, Calendar, DollarSign, FileText } from 'lucide-react';

const TimeTrackingDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Suivi du Temps',
      metaDescription: 'Suivez le temps passé sur vos projets et tâches. Chronométrage précis, rapports détaillés et facturation au temps passé.',
      heroTitle: 'Suivi du Temps Précis et Simple',
      heroDescription: 'Chronométrez votre temps, analysez votre productivité et facturez vos clients au temps passé.',
      ctaText: 'Essayer le suivi du temps',
      features: [
        {
          icon: Play,
          title: 'Chronomètre',
          description: 'Démarrez et arrêtez le chronomètre en un clic pour suivre votre temps précisément.'
        },
        {
          icon: Clock,
          title: 'Entrées manuelles',
          description: 'Ajoutez du temps manuellement pour les tâches passées.'
        },
        {
          icon: BarChart2,
          title: 'Rapports détaillés',
          description: 'Visualisez le temps passé par projet, client ou type de tâche.'
        },
        {
          icon: Calendar,
          title: 'Feuilles de temps',
          description: 'Générez des feuilles de temps hebdomadaires ou mensuelles.'
        },
        {
          icon: DollarSign,
          title: 'Facturation',
          description: 'Convertissez le temps passé en montants facturables automatiquement.'
        },
        {
          icon: FileText,
          title: 'Export',
          description: 'Exportez vos données pour la facturation ou la comptabilité.'
        }
      ],
      benefits: [
        {
          title: 'Facturation précise',
          description: 'Facturez vos clients avec précision en fonction du temps réellement passé.'
        },
        {
          title: 'Meilleure productivité',
          description: 'Identifiez où passe votre temps et optimisez votre efficacité.'
        },
        {
          title: 'Transparence',
          description: 'Montrez à vos clients exactement combien de temps vous avez consacré à leur projet.'
        },
        {
          title: 'Analyse',
          description: 'Comprenez la rentabilité de vos projets et services.'
        }
      ],
      useCases: [
        {
          title: 'Freelances',
          description: 'Facturez vos clients au temps passé avec un suivi précis de chaque mission.'
        },
        {
          title: 'Agences',
          description: 'Suivez le temps de toute votre équipe sur différents projets clients.'
        },
        {
          title: 'Avocats',
          description: 'Suivez le temps consacré à chaque dossier pour une facturation précise.'
        },
        {
          title: 'Consultants',
          description: 'Documentez le temps passé sur chaque mission de conseil.'
        }
      ]
    },
    en: {
      title: 'Time Tracking',
      metaDescription: 'Track time spent on your projects and tasks. Accurate time tracking, detailed reports and time-based billing.',
      heroTitle: 'Accurate and Simple Time Tracking',
      heroDescription: 'Track your time, analyze your productivity and bill your clients for time spent.',
      ctaText: 'Try Time Tracking',
      features: [
        {
          icon: Play,
          title: 'Timer',
          description: 'Start and stop the timer with one click to track your time accurately.'
        },
        {
          icon: Clock,
          title: 'Manual Entries',
          description: 'Add time manually for past tasks.'
        },
        {
          icon: BarChart2,
          title: 'Detailed Reports',
          description: 'Visualize time spent by project, client or task type.'
        },
        {
          icon: Calendar,
          title: 'Timesheets',
          description: 'Generate weekly or monthly timesheets.'
        },
        {
          icon: DollarSign,
          title: 'Billing',
          description: 'Convert time spent to billable amounts automatically.'
        },
        {
          icon: FileText,
          title: 'Export',
          description: 'Export your data for billing or accounting.'
        }
      ],
      benefits: [
        {
          title: 'Accurate Billing',
          description: 'Bill your clients accurately based on actual time spent.'
        },
        {
          title: 'Better Productivity',
          description: 'Identify where your time goes and optimize your efficiency.'
        },
        {
          title: 'Transparency',
          description: 'Show your clients exactly how much time you spent on their project.'
        },
        {
          title: 'Analysis',
          description: 'Understand the profitability of your projects and services.'
        }
      ],
      useCases: [
        {
          title: 'Freelancers',
          description: 'Bill your clients for time spent with accurate tracking of each project.'
        },
        {
          title: 'Agencies',
          description: 'Track your entire team\'s time across different client projects.'
        },
        {
          title: 'Lawyers',
          description: 'Track time spent on each case for accurate billing.'
        },
        {
          title: 'Consultants',
          description: 'Document time spent on each consulting assignment.'
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
      icon={Clock}
      features={data.features}
      benefits={data.benefits}
      useCases={data.useCases}
      appPath="/time-tracking"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default TimeTrackingDescription;
