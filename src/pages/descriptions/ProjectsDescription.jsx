import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { FolderKanban, Clock, Users, CheckSquare, Calendar, BarChart3 } from 'lucide-react';

const ProjectsDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Gestion de Projets',
      metaDescription: 'Gérez vos projets de A à Z avec un outil simple et efficace. Planification, suivi des tâches et collaboration en équipe.',
      heroTitle: 'Gestion de Projets Efficace',
      heroDescription: 'Planifiez, suivez et livrez vos projets à temps avec un outil de gestion simple et puissant.',
      ctaText: 'Essayer la gestion de projets',
      features: [
        {
          icon: FolderKanban,
          title: 'Vue Kanban',
          description: 'Visualisez l\'avancement de vos projets avec des tableaux Kanban intuitifs.'
        },
        {
          icon: CheckSquare,
          title: 'Gestion des tâches',
          description: 'Créez, assignez et suivez toutes les tâches de vos projets.'
        },
        {
          icon: Users,
          title: 'Collaboration',
          description: 'Travaillez en équipe avec des espaces partagés et des commentaires.'
        },
        {
          icon: Calendar,
          title: 'Planning',
          description: 'Planifiez vos échéances et suivez les jalons importants.'
        },
        {
          icon: Clock,
          title: 'Suivi du temps',
          description: 'Suivez le temps passé sur chaque tâche et projet.'
        },
        {
          icon: BarChart3,
          title: 'Rapports',
          description: 'Générez des rapports sur l\'avancement et la performance de vos projets.'
        }
      ],
      benefits: [
        {
          title: 'Livraison à temps',
          description: 'Respectez vos délais grâce à une planification et un suivi rigoureux.'
        },
        {
          title: 'Meilleure collaboration',
          description: 'Toute l\'équipe travaille ensemble sur une plateforme centralisée.'
        },
        {
          title: 'Visibilité complète',
          description: 'Voyez en temps réel où en sont tous vos projets.'
        },
        {
          title: 'Productivité accrue',
          description: 'Éliminez les réunions inutiles et centralisez toute l\'information.'
        }
      ],
      useCases: [
        {
          title: 'Agences digitales',
          description: 'Gérez plusieurs projets clients simultanément avec des équipes différentes.'
        },
        {
          title: 'Startups',
          description: 'Organisez le développement de vos produits avec des sprints et des milestones.'
        },
        {
          title: 'PME',
          description: 'Coordonnez les projets internes de tous vos départements.'
        },
        {
          title: 'Consultants',
          description: 'Suivez l\'avancement de vos missions et projets clients.'
        }
      ]
    },
    en: {
      title: 'Project Management',
      metaDescription: 'Manage your projects from A to Z with a simple and effective tool. Planning, task tracking and team collaboration.',
      heroTitle: 'Effective Project Management',
      heroDescription: 'Plan, track and deliver your projects on time with a simple and powerful management tool.',
      ctaText: 'Try Project Management',
      features: [
        {
          icon: FolderKanban,
          title: 'Kanban View',
          description: 'Visualize your project progress with intuitive Kanban boards.'
        },
        {
          icon: CheckSquare,
          title: 'Task Management',
          description: 'Create, assign and track all tasks in your projects.'
        },
        {
          icon: Users,
          title: 'Collaboration',
          description: 'Work as a team with shared spaces and comments.'
        },
        {
          icon: Calendar,
          title: 'Planning',
          description: 'Plan your deadlines and track important milestones.'
        },
        {
          icon: Clock,
          title: 'Time Tracking',
          description: 'Track time spent on each task and project.'
        },
        {
          icon: BarChart3,
          title: 'Reports',
          description: 'Generate reports on the progress and performance of your projects.'
        }
      ],
      benefits: [
        {
          title: 'On-Time Delivery',
          description: 'Meet your deadlines with rigorous planning and tracking.'
        },
        {
          title: 'Better Collaboration',
          description: 'The whole team works together on a centralized platform.'
        },
        {
          title: 'Full Visibility',
          description: 'See in real-time where all your projects stand.'
        },
        {
          title: 'Increased Productivity',
          description: 'Eliminate unnecessary meetings and centralize all information.'
        }
      ],
      useCases: [
        {
          title: 'Digital Agencies',
          description: 'Manage multiple client projects simultaneously with different teams.'
        },
        {
          title: 'Startups',
          description: 'Organize your product development with sprints and milestones.'
        },
        {
          title: 'SMEs',
          description: 'Coordinate internal projects across all your departments.'
        },
        {
          title: 'Consultants',
          description: 'Track the progress of your missions and client projects.'
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
      icon={FolderKanban}
      features={data.features}
      benefits={data.benefits}
      useCases={data.useCases}
      appPath="/projects"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default ProjectsDescription;
