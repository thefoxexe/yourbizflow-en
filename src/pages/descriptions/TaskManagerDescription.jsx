import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { CheckSquare, Calendar, Users, Bell, Tag, Filter } from 'lucide-react';

const TaskManagerDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Gestionnaire de Tâches',
      metaDescription: 'Organisez votre travail avec un gestionnaire de tâches simple et efficace. Priorisez, assignez et suivez toutes vos tâches.',
      heroTitle: 'Gestion de Tâches Efficace',
      heroDescription: 'Organisez votre travail, priorisez vos tâches et atteignez vos objectifs plus rapidement.',
      ctaText: 'Essayer le gestionnaire de tâches',
      features: [
        {
          icon: CheckSquare,
          title: 'Listes de tâches',
          description: 'Créez des listes de tâches organisées par projet ou contexte.'
        },
        {
          icon: Calendar,
          title: 'Échéances',
          description: 'Définissez des dates d\'échéance et ne manquez plus aucune deadline.'
        },
        {
          icon: Users,
          title: 'Attribution',
          description: 'Assignez des tâches aux membres de votre équipe.'
        },
        {
          icon: Tag,
          title: 'Priorités',
          description: 'Définissez des niveaux de priorité pour vous concentrer sur l\'essentiel.'
        },
        {
          icon: Bell,
          title: 'Rappels',
          description: 'Recevez des notifications pour les tâches importantes.'
        },
        {
          icon: Filter,
          title: 'Filtres',
          description: 'Filtrez vos tâches par statut, priorité, assigné ou date.'
        }
      ],
      benefits: [
        {
          title: 'Productivité accrue',
          description: 'Accomplissez plus en organisant mieux votre travail.'
        },
        {
          title: 'Rien n\'est oublié',
          description: 'Gardez une trace de toutes vos tâches et responsabilités.'
        },
        {
          title: 'Meilleure collaboration',
          description: 'Coordonnez le travail de votre équipe efficacement.'
        },
        {
          title: 'Vision claire',
          description: 'Voyez d\'un coup d\'œil ce qui doit être fait et par qui.'
        }
      ],
      useCases: [
        {
          title: 'Entrepreneurs',
          description: 'Gérez toutes les tâches de votre entreprise sans rien oublier.'
        },
        {
          title: 'Équipes',
          description: 'Coordonnez le travail de votre équipe avec des tâches assignées.'
        },
        {
          title: 'Chefs de projet',
          description: 'Suivez l\'avancement de tous les livrables de vos projets.'
        },
        {
          title: 'Assistants',
          description: 'Organisez les tâches et rappels pour votre équipe ou vos clients.'
        }
      ]
    },
    en: {
      title: 'Task Manager',
      metaDescription: 'Organize your work with a simple and efficient task manager. Prioritize, assign and track all your tasks.',
      heroTitle: 'Efficient Task Management',
      heroDescription: 'Organize your work, prioritize your tasks and achieve your goals faster.',
      ctaText: 'Try Task Manager',
      features: [
        {
          icon: CheckSquare,
          title: 'Task Lists',
          description: 'Create task lists organized by project or context.'
        },
        {
          icon: Calendar,
          title: 'Due Dates',
          description: 'Set due dates and never miss a deadline again.'
        },
        {
          icon: Users,
          title: 'Assignment',
          description: 'Assign tasks to your team members.'
        },
        {
          icon: Tag,
          title: 'Priorities',
          description: 'Set priority levels to focus on what matters.'
        },
        {
          icon: Bell,
          title: 'Reminders',
          description: 'Receive notifications for important tasks.'
        },
        {
          icon: Filter,
          title: 'Filters',
          description: 'Filter your tasks by status, priority, assignee or date.'
        }
      ],
      benefits: [
        {
          title: 'Increased Productivity',
          description: 'Accomplish more by organizing your work better.'
        },
        {
          title: 'Nothing Forgotten',
          description: 'Keep track of all your tasks and responsibilities.'
        },
        {
          title: 'Better Collaboration',
          description: 'Coordinate your team\'s work effectively.'
        },
        {
          title: 'Clear Vision',
          description: 'See at a glance what needs to be done and by whom.'
        }
      ],
      useCases: [
        {
          title: 'Entrepreneurs',
          description: 'Manage all your business tasks without forgetting anything.'
        },
        {
          title: 'Teams',
          description: 'Coordinate your team\'s work with assigned tasks.'
        },
        {
          title: 'Project Managers',
          description: 'Track the progress of all your project deliverables.'
        },
        {
          title: 'Assistants',
          description: 'Organize tasks and reminders for your team or clients.'
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
      icon={CheckSquare}
      features={data.features}
      benefits={data.benefits}
      useCases={data.useCases}
      appPath="/task-manager"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default TaskManagerDescription;
