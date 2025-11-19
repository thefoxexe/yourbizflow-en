import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { Warehouse, Package, TrendingDown, Bell, BarChart, ShoppingBag } from 'lucide-react';

const StockManagementDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Gestion de Stock',
      metaDescription: 'Optimisez votre gestion de stock. Suivez les niveaux, gérez les réapprovisionnements et évitez les ruptures.',
      heroTitle: 'Stock Intelligent',
      heroDescription: 'Gérez efficacement votre inventaire avec des alertes automatiques et des prévisions.',
      ctaText: 'Essayer la gestion de stock',
      features: [
        {
          icon: Warehouse,
          title: 'Suivi en temps réel',
          description: 'Visualisez l\'état de votre stock en direct.'
        },
        {
          icon: Package,
          title: 'Multi-emplacements',
          description: 'Gérez plusieurs entrepôts ou points de vente.'
        },
        {
          icon: TrendingDown,
          title: 'Alertes de stock bas',
          description: 'Soyez averti avant les ruptures de stock.'
        },
        {
          icon: Bell,
          title: 'Réapprovisionnement auto',
          description: 'Commandes automatiques basées sur les seuils.'
        },
        {
          icon: BarChart,
          title: 'Analyse des mouvements',
          description: 'Suivez les entrées, sorties et rotations.'
        },
        {
          icon: ShoppingBag,
          title: 'Gestion des lots',
          description: 'Traçabilité complète par numéro de lot.'
        }
      ],
      benefits: [
        {
          title: 'Zéro rupture',
          description: 'Plus jamais de produits en rupture de stock.'
        },
        {
          title: 'Économies',
          description: 'Réduisez les coûts de stockage et de surstockage.'
        },
        {
          title: 'Efficacité opérationnelle',
          description: 'Optimisez vos processus de gestion.'
        },
        {
          title: 'Satisfaction client',
          description: 'Livrez toujours à temps avec le bon stock.'
        }
      ],
      useCases: [
        {
          title: 'E-commerce',
          description: 'Synchronisez votre stock avec vos ventes en ligne.'
        },
        {
          title: 'Commerce de détail',
          description: 'Gérez votre magasin et vos points de vente.'
        },
        {
          title: 'Grossistes',
          description: 'Suivez de grandes quantités sur plusieurs sites.'
        },
        {
          title: 'Restauration',
          description: 'Gérez vos ingrédients et évitez le gaspillage.'
        }
      ]
    },
    en: {
      title: 'Stock Management',
      metaDescription: 'Optimize your stock management. Track levels, manage replenishments and avoid stockouts.',
      heroTitle: 'Intelligent Stock',
      heroDescription: 'Efficiently manage your inventory with automatic alerts and forecasts.',
      ctaText: 'Try Stock Management',
      features: [
        {
          icon: Warehouse,
          title: 'Real-time Tracking',
          description: 'View your stock status in real-time.'
        },
        {
          icon: Package,
          title: 'Multi-location',
          description: 'Manage multiple warehouses or sales points.'
        },
        {
          icon: TrendingDown,
          title: 'Low Stock Alerts',
          description: 'Get notified before stockouts.'
        },
        {
          icon: Bell,
          title: 'Auto Replenishment',
          description: 'Automatic orders based on thresholds.'
        },
        {
          icon: BarChart,
          title: 'Movement Analysis',
          description: 'Track entries, exits and rotations.'
        },
        {
          icon: ShoppingBag,
          title: 'Batch Management',
          description: 'Complete traceability by batch number.'
        }
      ],
      benefits: [
        {
          title: 'Zero Stockouts',
          description: 'Never run out of products again.'
        },
        {
          title: 'Cost Savings',
          description: 'Reduce storage and overstocking costs.'
        },
        {
          title: 'Operational Efficiency',
          description: 'Optimize your management processes.'
        },
        {
          title: 'Customer Satisfaction',
          description: 'Always deliver on time with right stock.'
        }
      ],
      useCases: [
        {
          title: 'E-commerce',
          description: 'Sync your stock with your online sales.'
        },
        {
          title: 'Retail',
          description: 'Manage your store and sales points.'
        },
        {
          title: 'Wholesalers',
          description: 'Track large quantities across multiple sites.'
        },
        {
          title: 'Food Service',
          description: 'Manage ingredients and avoid waste.'
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
      icon={Warehouse}
      features={data.features}
      benefits={data.benefits}
      useCases={data.useCases}
      appPath="/stock-management"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default StockManagementDescription;
