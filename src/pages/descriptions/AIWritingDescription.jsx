import React from 'react';
import { useLocation } from 'react-router-dom';
import AppDescriptionTemplate from '@/components/AppDescriptionTemplate';
import { Sparkles, FileText, Languages, Wand2, MessageSquare, BookOpen } from 'lucide-react';

const AIWritingDescription = () => {
  const location = useLocation();
  const isFr = location.pathname.startsWith('/fr');

  const content = {
    fr: {
      title: 'Assistant d\'Écriture IA',
      metaDescription: 'Créez du contenu de qualité avec l\'intelligence artificielle. Rédaction d\'articles, emails, posts sociaux et plus encore.',
      heroTitle: 'Écriture Assistée par IA',
      heroDescription: 'Générez du contenu de qualité professionnelle en quelques secondes grâce à l\'intelligence artificielle.',
      ctaText: 'Essayer l\'assistant IA',
      features: [
        {
          icon: FileText,
          title: 'Génération de contenu',
          description: 'Créez des articles, descriptions produits, emails et plus en quelques clics.'
        },
        {
          icon: Wand2,
          title: 'Amélioration de texte',
          description: 'Reformulez et améliorez vos textes existants pour plus d\'impact.'
        },
        {
          icon: Languages,
          title: 'Traduction',
          description: 'Traduisez vos contenus dans plusieurs langues instantanément.'
        },
        {
          icon: MessageSquare,
          title: 'Tons variés',
          description: 'Adaptez le ton de vos écrits : professionnel, décontracté, commercial, etc.'
        },
        {
          icon: BookOpen,
          title: 'Résumés',
          description: 'Générez des résumés concis de longs documents.'
        },
        {
          icon: Sparkles,
          title: 'SEO optimisé',
          description: 'Créez du contenu optimisé pour les moteurs de recherche.'
        }
      ],
      benefits: [
        {
          title: 'Gain de temps énorme',
          description: 'Créez en minutes ce qui prendrait des heures à rédiger manuellement.'
        },
        {
          title: 'Qualité constante',
          description: 'Maintenez un niveau de qualité élevé dans tous vos contenus.'
        },
        {
          title: 'Plus de créativité',
          description: 'Surmontez le syndrome de la page blanche avec des suggestions créatives.'
        },
        {
          title: 'Multilingue',
          description: 'Créez du contenu dans plusieurs langues sans effort.'
        }
      ],
      useCases: [
        {
          title: 'Marketing',
          description: 'Créez des campagnes email, posts sociaux et landing pages rapidement.'
        },
        {
          title: 'E-commerce',
          description: 'Générez des descriptions produits optimisées et attractives.'
        },
        {
          title: 'Blogging',
          description: 'Rédigez des articles de blog SEO-friendly en quelques minutes.'
        },
        {
          title: 'Service client',
          description: 'Créez des réponses personnalisées et professionnelles rapidement.'
        }
      ]
    },
    en: {
      title: 'AI Writing Assistant',
      metaDescription: 'Create quality content with artificial intelligence. Write articles, emails, social posts and more.',
      heroTitle: 'AI-Powered Writing',
      heroDescription: 'Generate professional-quality content in seconds using artificial intelligence.',
      ctaText: 'Try AI Assistant',
      features: [
        {
          icon: FileText,
          title: 'Content Generation',
          description: 'Create articles, product descriptions, emails and more in a few clicks.'
        },
        {
          icon: Wand2,
          title: 'Text Enhancement',
          description: 'Rephrase and improve your existing texts for more impact.'
        },
        {
          icon: Languages,
          title: 'Translation',
          description: 'Translate your content into multiple languages instantly.'
        },
        {
          icon: MessageSquare,
          title: 'Various Tones',
          description: 'Adapt the tone of your writing: professional, casual, sales, etc.'
        },
        {
          icon: BookOpen,
          title: 'Summaries',
          description: 'Generate concise summaries of long documents.'
        },
        {
          icon: Sparkles,
          title: 'SEO Optimized',
          description: 'Create content optimized for search engines.'
        }
      ],
      benefits: [
        {
          title: 'Huge Time Savings',
          description: 'Create in minutes what would take hours to write manually.'
        },
        {
          title: 'Consistent Quality',
          description: 'Maintain a high level of quality in all your content.'
        },
        {
          title: 'More Creativity',
          description: 'Overcome writer\'s block with creative suggestions.'
        },
        {
          title: 'Multilingual',
          description: 'Create content in multiple languages effortlessly.'
        }
      ],
      useCases: [
        {
          title: 'Marketing',
          description: 'Create email campaigns, social posts and landing pages quickly.'
        },
        {
          title: 'E-commerce',
          description: 'Generate optimized and attractive product descriptions.'
        },
        {
          title: 'Blogging',
          description: 'Write SEO-friendly blog articles in minutes.'
        },
        {
          title: 'Customer Service',
          description: 'Create personalized and professional responses quickly.'
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
      icon={Sparkles}
      features={data.features}
      benefits={data.benefits}
      useCases={data.useCases}
      appPath="/ai-writing-assistant"
      ctaText={data.ctaText}
      heroTitle={data.heroTitle}
      heroDescription={data.heroDescription}
    />
  );
};

export default AIWritingDescription;
