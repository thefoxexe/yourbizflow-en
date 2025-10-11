
import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Helmet } from 'react-helmet';
import { PublicHeader } from '@/pages/LandingPage';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    slug: '5-astuces-pour-optimiser-votre-facturation',
    title: '5 Astuces pour Optimiser Votre Facturation et Être Payé Plus Vite',
    description: 'La facturation est le nerf de la guerre pour tout entrepreneur. Découvrez 5 astuces simples pour rendre votre processus de facturation plus efficace, réduire les retards de paiement et améliorer votre trésorerie.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800',
    date: '3 Octobre 2025',
    readTime: '4 min de lecture',
  },
  {
    slug: 'pourquoi-un-crm-est-essentiel-pour-votre-pme',
    title: 'Pourquoi un CRM est Essentiel pour Votre PME (Même si Vous Débutez)',
    description: 'Vous pensez que les CRM sont réservés aux grandes entreprises ? Détrompez-vous. Un bon outil de gestion de la relation client peut transformer votre business, même à petite échelle. Voici pourquoi.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800',
    date: '28 Septembre 2025',
    readTime: '5 min de lecture',
  },
  {
    slug: 'comment-calculer-la-rentabilite-de-vos-produits',
    title: 'Comment Calculer la Rentabilité de Vos Produits (et Arrêter de Perdre de l\'Argent)',
    description: 'Vendre beaucoup, c\'est bien. Vendre en étant rentable, c\'est mieux. Apprenez à calculer la rentabilité réelle de chaque produit pour prendre des décisions éclairées et maximiser vos profits.',
    image: 'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?q=80&w=800',
    date: '25 Septembre 2025',
    readTime: '6 min de lecture',
  },
  {
    slug: 'automatiser-les-taches-repetitives-pour-gagner-du-temps',
    title: 'Automatiser les Tâches Répétitives pour Gagner du Temps et de la Sérénité',
    description: 'Les tâches administratives vous submergent ? Découvrez comment l\'automatisation peut libérer des heures précieuses chaque semaine pour vous concentrer sur ce qui compte vraiment.',
    image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=800',
    date: '22 Septembre 2025',
    readTime: '5 min de lecture',
  },
  {
    slug: 'creer-des-devis-qui-convertissent-a-coup-sur',
    title: 'Créer des Devis qui Convertissent à Coup Sûr : Le Guide Complet',
    description: 'Un devis n\'est pas qu\'un simple document de prix. C\'est un outil de vente puissant. Apprenez à créer des devis clairs, professionnels et persuasifs qui transforment les prospects en clients.',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800',
    date: '18 Septembre 2025',
    readTime: '6 min de lecture',
  },
  {
    slug: 'l-importance-du-suivi-de-temps-pour-les-freelances',
    title: 'L\'Importance du Suivi de Temps pour les Freelances (et Comment Bien le Faire)',
    description: 'Vous facturez à l\'heure ou au projet ? Le suivi de temps est votre meilleur allié pour évaluer votre rentabilité, justifier vos tarifs et optimiser votre productivité. On vous explique tout.',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800',
    date: '15 Septembre 2025',
    readTime: '5 min de lecture',
  },
];

const BlogPage = () => {
  const navigate = useNavigate();

  const handleNavClick = (e, href) => {
    e.preventDefault();
    navigate(href);
  };
  
  const pageUrl = "https://yourbizflow.com/blog";

  return (
    <div className="w-full min-h-screen text-white bg-[#030303] flex flex-col">
      <Helmet>
        <title>Blog YourBizFlow | Conseils pour Entrepreneurs et PME</title>
        <meta name="description" content="Conseils, astuces et stratégies pour les entrepreneurs et les PME. Découvrez comment optimiser votre gestion d'entreprise avec YourBizFlow." />
        <meta name="keywords" content="blog, YourBizFlow, conseils entrepreneurs, gestion PME, facturation, CRM, rentabilité" />
        <meta property="og:title" content="Blog YourBizFlow | Conseils pour Entrepreneurs et PME" />
        <meta property="og:description" content="Conseils, astuces et stratégies pour les entrepreneurs et les PME. Découvrez comment optimiser votre gestion d'entreprise avec YourBizFlow." />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/yourbizflow_blog_og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog YourBizFlow | Conseils pour Entrepreneurs et PME" />
        <meta name="twitter:description" content="Conseils, astuces et stratégies pour les entrepreneurs et les PME. Découvrez comment optimiser votre gestion d'entreprise avec YourBizFlow." />
        <meta name="twitter:image" content="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/yourbizflow_blog_twitter.png" />
      </Helmet>

      <PublicHeader onNavClick={handleNavClick} />

      <main className="flex-grow">
        <div className="container mx-auto px-6 py-32 sm:py-40">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
              Le Blog YourBizFlow
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
              Conseils, astuces et stratégies pour les entrepreneurs et les PME qui veulent simplifier leur gestion et accélérer leur croissance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card/50 border border-white/10 rounded-xl overflow-hidden flex flex-col group"
              >
                <Link to={`/blog/${post.slug}`} className="block">
                  <div className="overflow-hidden">
                    <img
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                     src={post.image} />
                  </div>
                </Link>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-sm text-muted-foreground mb-2">
                    <span>{post.date}</span> &bull; <span>{post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-3 flex-grow">
                    <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground mb-4 text-sm">{post.description}</p>
                  <Link to={`/blog/${post.slug}`} className="mt-auto">
                    <Button variant="outline" className="w-full">
                      Lire l'article <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <MinimalFooter onPrivacyClick={() => {}} onTermsClick={() => {}} />
    </div>
  );
};

export default BlogPage;
