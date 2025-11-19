import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { Users, Calendar, FileText, TrendingUp, Award, Clock } from 'lucide-react';

const HRDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Ressources Humaines',
      metaDescription: 'Gérez vos employés, congés, évaluations et recrutements. Solution RH complète pour PME et startups.',
      heroTitle: 'Gestion RH Simplifiée',
      heroDescription: 'Centralisez la gestion de vos ressources humaines : employés, congés, absences et évaluations.',
      ctaText: 'Essayer les RH',
      features: [
        {
          icon: Users,
          title: 'Base employés',
          description: 'Centralisez toutes les informations de vos employés dans une base unique.'
        },
        {
          icon: Calendar,
          title: 'Gestion des congés',
          description: 'Gérez les demandes de congés, absences et planning des équipes.'
        },
        {
          icon: FileText,
          title: 'Documents RH',
          description: 'Stockez et gérez tous les documents RH de manière sécurisée.'
        },
        {
          icon: TrendingUp,
          title: 'Évaluations',
          description: 'Suivez les performances et menez des évaluations régulières.'
        },
        {
          icon: Award,
          title: 'Recrutement',
          description: 'Gérez vos processus de recrutement et le pipeline de candidats.'
        },
        {
          icon: Clock,
          title: 'Temps de travail',
          description: 'Suivez les heures travaillées et générez des rapports.'
        }
      ],
      benefits: [
        {
          title: 'Organisation',
          description: 'Toutes les informations RH centralisées et accessibles en un clic.'
        },
        {
          title: 'Conformité',
          description: 'Respectez les obligations légales avec des dossiers complets et organisés.'
        },
        {
          title: 'Gain de temps',
          description: 'Automatisez les tâches administratives RH récurrentes.'
        },
        {
          title: 'Meilleure gestion',
          description: 'Prenez de meilleures décisions RH grâce aux données et rapports.'
        }
      ],
      useCases: [
        {
          title: 'PME',
          description: 'Gérez tous les aspects RH de votre entreprise sans RH dédié.'
        },
        {
          title: 'Startups',
          description: 'Structurez votre gestion RH dès le départ pour croître sereinement.'
        },
        {
          title: 'Équipes RH',
          description: 'Simplifiez votre quotidien avec des outils RH modernes et efficaces.'
        },
        {
          title: 'Managers',
          description: 'Suivez les performances et le bien-être de votre équipe.'
        }
      ]
    },
    en: {
      title: 'Human Resources',
      metaDescription: 'Manage your employees, leave, evaluations and recruitment. Complete HR solution for SMEs and startups.',
      heroTitle: 'Simplified HR Management',
      heroDescription: 'Centralize the management of your human resources: employees, leave, absences and evaluations.',
      ctaText: 'Try HR',
      features: [
        {
          icon: Users,
          title: 'Employee Database',
          description: 'Centralize all your employee information in a single database.'
        },
        {
          icon: Calendar,
          title: 'Leave Management',
          description: 'Manage leave requests, absences and team schedules.'
        },
        {
          icon: FileText,
          title: 'HR Documents',
          description: 'Store and manage all HR documents securely.'
        },
        {
          icon: TrendingUp,
          title: 'Evaluations',
          description: 'Track performance and conduct regular evaluations.'
        },
        {
          icon: Award,
          title: 'Recruitment',
          description: 'Manage your recruitment processes and candidate pipeline.'
        },
        {
          icon: Clock,
          title: 'Work Time',
          description: 'Track hours worked and generate reports.'
        }
      ],
      benefits: [
        {
          title: 'Organization',
          description: 'All HR information centralized and accessible with one click.'
        },
        {
          title: 'Compliance',
          description: 'Meet legal obligations with complete and organized records.'
        },
        {
          title: 'Time Saving',
          description: 'Automate recurring HR administrative tasks.'
        },
        {
          title: 'Better Management',
          description: 'Make better HR decisions with data and reports.'
        }
      ],
      useCases: [
        {
          title: 'SMEs',
          description: 'Manage all HR aspects of your business without a dedicated HR person.'
        },
        {
          title: 'Startups',
          description: 'Structure your HR management from the start to grow smoothly.'
        },
        {
          title: 'HR Teams',
          description: 'Simplify your daily work with modern and efficient HR tools.'
        },
        {
          title: 'Managers',
          description: 'Track the performance and well-being of your team.'
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
      appPath="/hr"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default HRDescription;
