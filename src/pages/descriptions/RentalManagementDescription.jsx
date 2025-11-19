import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { Car, Calendar, FileText, CreditCard, Users, Shield } from 'lucide-react';

const RentalManagementDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Gestion de Location',
      metaDescription: 'Gérez vos locations facilement. Réservations, contrats, paiements et maintenance en un seul endroit.',
      heroTitle: 'Location Simplifiée',
      heroDescription: 'La solution complète pour gérer tous vos biens en location efficacement.',
      ctaText: 'Essayer la gestion de location',
      features: [
        {
          icon: Car,
          title: 'Gestion des biens',
          description: 'Catalogue complet de vos biens disponibles.'
        },
        {
          icon: Calendar,
          title: 'Calendrier de réservation',
          description: 'Visualisez disponibilités et réservations.'
        },
        {
          icon: FileText,
          title: 'Contrats automatiques',
          description: 'Générez et signez des contrats en ligne.'
        },
        {
          icon: CreditCard,
          title: 'Paiements intégrés',
          description: 'Encaissez dépôts, loyers et cautions.'
        },
        {
          icon: Users,
          title: 'Gestion locataires',
          description: 'Base de données complète de vos clients.'
        },
        {
          icon: Shield,
          title: 'Assurances & garanties',
          description: 'Suivez les couvertures et dépôts de garantie.'
        }
      ],
      benefits: [
        {
          title: 'Gain de temps',
          description: 'Automatisez la gestion administrative de vos locations.'
        },
        {
          title: 'Plus de revenus',
          description: 'Optimisez le taux d\'occupation de vos biens.'
        },
        {
          title: 'Sécurité juridique',
          description: 'Contrats conformes et traçabilité complète.'
        },
        {
          title: 'Satisfaction client',
          description: 'Expérience de location fluide et professionnelle.'
        }
      ],
      useCases: [
        {
          title: 'Location immobilière',
          description: 'Gérez appartements, maisons et locaux commerciaux.'
        },
        {
          title: 'Location de véhicules',
          description: 'Voitures, vélos, scooters et flottes.'
        },
        {
          title: 'Location d\'équipements',
          description: 'Matériel professionnel, outils et machines.'
        },
        {
          title: 'Location courte durée',
          description: 'Airbnb, saisonniers et vacances.'
        }
      ]
    },
    en: {
      title: 'Rental Management',
      metaDescription: 'Manage your rentals easily. Bookings, contracts, payments and maintenance in one place.',
      heroTitle: 'Simplified Rental',
      heroDescription: 'The complete solution to efficiently manage all your rental properties.',
      ctaText: 'Try Rental Management',
      features: [
        {
          icon: Car,
          title: 'Asset Management',
          description: 'Complete catalog of your available assets.'
        },
        {
          icon: Calendar,
          title: 'Booking Calendar',
          description: 'View availability and reservations.'
        },
        {
          icon: FileText,
          title: 'Automatic Contracts',
          description: 'Generate and sign contracts online.'
        },
        {
          icon: CreditCard,
          title: 'Integrated Payments',
          description: 'Collect deposits, rents and security deposits.'
        },
        {
          icon: Users,
          title: 'Tenant Management',
          description: 'Complete database of your customers.'
        },
        {
          icon: Shield,
          title: 'Insurance & Guarantees',
          description: 'Track coverage and security deposits.'
        }
      ],
      benefits: [
        {
          title: 'Time Saved',
          description: 'Automate administrative rental management.'
        },
        {
          title: 'More Revenue',
          description: 'Optimize occupancy rate of your assets.'
        },
        {
          title: 'Legal Security',
          description: 'Compliant contracts and complete traceability.'
        },
        {
          title: 'Customer Satisfaction',
          description: 'Smooth and professional rental experience.'
        }
      ],
      useCases: [
        {
          title: 'Real Estate Rental',
          description: 'Manage apartments, houses and commercial premises.'
        },
        {
          title: 'Vehicle Rental',
          description: 'Cars, bikes, scooters and fleets.'
        },
        {
          title: 'Equipment Rental',
          description: 'Professional equipment, tools and machinery.'
        },
        {
          title: 'Short-term Rental',
          description: 'Airbnb, seasonal and vacation rentals.'
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
      icon={Car}
      features={data.features}
      benefits={data.benefits}
      useCases={data.useCases}
      appPath="/rental-management"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default RentalManagementDescription;
