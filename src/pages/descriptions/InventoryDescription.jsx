import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { Package, Barcode, AlertTriangle, TrendingUp, RefreshCw, FileBarChart } from 'lucide-react';

const InventoryDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Gestion de Stock',
      metaDescription: 'Gérez votre inventaire efficacement avec un suivi en temps réel, alertes de stock bas et rapports détaillés.',
      heroTitle: 'Gestion de Stock Intelligente',
      heroDescription: 'Suivez votre inventaire en temps réel, évitez les ruptures de stock et optimisez vos commandes.',
      ctaText: 'Essayer la gestion de stock',
      features: [
        {
          icon: Package,
          title: 'Suivi en temps réel',
          description: 'Visualisez votre stock en temps réel pour chaque produit.'
        },
        {
          icon: Barcode,
          title: 'Code-barres',
          description: 'Scannez les codes-barres pour des entrées/sorties rapides.'
        },
        {
          icon: AlertTriangle,
          title: 'Alertes de stock',
          description: 'Recevez des alertes automatiques pour les stocks bas ou en rupture.'
        },
        {
          icon: RefreshCw,
          title: 'Réapprovisionnement',
          description: 'Planifiez et gérez vos commandes de réapprovisionnement.'
        },
        {
          icon: TrendingUp,
          title: 'Prévisions',
          description: 'Anticipez vos besoins en stock grâce aux données historiques.'
        },
        {
          icon: FileBarChart,
          title: 'Rapports détaillés',
          description: 'Générez des rapports sur les mouvements de stock et la valorisation.'
        }
      ],
      benefits: [
        {
          title: 'Zéro rupture',
          description: 'Ne perdez plus de ventes à cause de produits en rupture de stock.'
        },
        {
          title: 'Optimisation',
          description: 'Réduisez le capital immobilisé en stock tout en maintenant la disponibilité.'
        },
        {
          title: 'Gain de temps',
          description: 'Automatisez le suivi et les commandes pour vous concentrer sur l\'essentiel.'
        },
        {
          title: 'Visibilité',
          description: 'Ayez une vue claire de votre inventaire à tout moment.'
        }
      ],
      useCases: [
        {
          title: 'E-commerce',
          description: 'Synchronisez votre stock avec votre boutique en ligne en temps réel.'
        },
        {
          title: 'Commerce de détail',
          description: 'Gérez le stock de vos magasins physiques efficacement.'
        },
        {
          title: 'Restaurants',
          description: 'Suivez vos matières premières et évitez le gaspillage.'
        },
        {
          title: 'Grossistes',
          description: 'Gérez de gros volumes de produits et d\'emplacements de stockage.'
        }
      ]
    },
    en: {
      title: 'Inventory Management',
      metaDescription: 'Manage your inventory effectively with real-time tracking, low stock alerts and detailed reports.',
      heroTitle: 'Smart Inventory Management',
      heroDescription: 'Track your inventory in real-time, avoid stockouts and optimize your orders.',
      ctaText: 'Try Inventory Management',
      features: [
        {
          icon: Package,
          title: 'Real-time Tracking',
          description: 'View your stock in real-time for each product.'
        },
        {
          icon: Barcode,
          title: 'Barcode',
          description: 'Scan barcodes for quick in/out entries.'
        },
        {
          icon: AlertTriangle,
          title: 'Stock Alerts',
          description: 'Receive automatic alerts for low or out-of-stock items.'
        },
        {
          icon: RefreshCw,
          title: 'Replenishment',
          description: 'Plan and manage your replenishment orders.'
        },
        {
          icon: TrendingUp,
          title: 'Forecasting',
          description: 'Anticipate your stock needs with historical data.'
        },
        {
          icon: FileBarChart,
          title: 'Detailed Reports',
          description: 'Generate reports on stock movements and valuation.'
        }
      ],
      benefits: [
        {
          title: 'Zero Stockouts',
          description: 'Never lose sales due to out-of-stock products.'
        },
        {
          title: 'Optimization',
          description: 'Reduce capital tied up in inventory while maintaining availability.'
        },
        {
          title: 'Time Saving',
          description: 'Automate tracking and ordering to focus on what matters.'
        },
        {
          title: 'Visibility',
          description: 'Have a clear view of your inventory at all times.'
        }
      ],
      useCases: [
        {
          title: 'E-commerce',
          description: 'Sync your stock with your online store in real-time.'
        },
        {
          title: 'Retail',
          description: 'Manage the inventory of your physical stores efficiently.'
        },
        {
          title: 'Restaurants',
          description: 'Track your raw materials and avoid waste.'
        },
        {
          title: 'Wholesalers',
          description: 'Manage large volumes of products and storage locations.'
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
      icon={Package}
      features={data.features}
      benefits={data.benefits}
      useCases={data.useCases}
      appPath="/inventory"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default InventoryDescription;
