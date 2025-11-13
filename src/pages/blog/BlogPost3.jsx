import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Helmet } from 'react-helmet';
import { PublicHeader } from '@/pages/LandingPage';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const BlogPost3 = () => {
  const navigate = useNavigate();

  const handleNavClick = (e, href) => {
    e.preventDefault();
    navigate(href);
  };
  
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Comment Calculer la Rentabilité de Vos Produits (et Arrêter de Perdre de l'Argent)",
    "description": "Apprenez à calculer la rentabilité réelle de chaque produit en prenant en compte tous les coûts pour prendre des décisions éclairées et maximiser vos profits.",
    "image": "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?q=80&w=1200",
    "author": {
      "@type": "Organization",
      "name": "YourBizFlow"
    },
    "publisher": {
      "@type": "Organization",
      "name": "YourBizFlow",
      "logo": {
        "@type": "ImageObject",
        "url": "https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/6b69cc214c03819301dd8cb8579b78dc.png"
      }
    },
    "datePublished": "2025-09-25",
    "dateModified": "2025-09-25"
  };
  const pageUrl = "https://yourbizflow.com/blog/comment-calculer-la-rentabilite-de-vos-produits";

  return (
    <div className="w-full min-h-screen text-white bg-[#030303] flex flex-col">
      <Helmet>
        <title>Calculer la Rentabilité de Vos Produits | YourBizFlow Blog</title>
        <meta name="description" content="Apprenez à calculer la rentabilité réelle de chaque produit en prenant en compte tous les coûts. Prenez des décisions éclairées et maximisez vos profits avec YourBizFlow." />
        <meta name="keywords" content="rentabilité produit, calcul marge, coût de revient, e-commerce, YourBizFlow" />
        <meta property="og:title" content="Calculer la Rentabilité de Vos Produits | YourBizFlow Blog" />
        <meta property="og:description" content="Apprenez à calculer la rentabilité réelle de chaque produit pour prendre des décisions éclairées et maximiser vos profits." />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={articleSchema.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Calculer la Rentabilité de Vos Produits | YourBizFlow Blog" />
        <meta name="twitter:description" content="Apprenez à calculer la rentabilité réelle de chaque produit pour prendre des décisions éclairées et maximiser vos profits." />
        <meta name="twitter:image" content={articleSchema.image} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <PublicHeader onNavClick={handleNavClick} />

      <main className="flex-grow pt-24">
        <div className="relative h-64 md:h-96 w-full">
          <img
            alt="Calculatrice et graphiques de rentabilité sur un bureau"
            className="w-full h-full object-cover"
           src="https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?q=80&w=1200" />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center px-4"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-white max-w-4xl">
                Comment Calculer la Rentabilité de Vos Produits (et Arrêter de Perdre de l'Argent)
              </h1>
              <p className="text-lg text-white/80 mt-4">25 Septembre 2025 &bull; 6 min de lecture</p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16 max-w-3xl">
          <article className="prose prose-invert lg:prose-xl mx-auto">
            <p>Le chiffre d'affaires est souvent vu comme l'indicateur ultime de succès. Pourtant, il ne dit rien de votre rentabilité. Vous pourriez vendre des milliers de produits et quand même perdre de l'argent. La clé ? Comprendre et calculer la rentabilité de chaque produit que vous vendez.</p>
            
            <h2>1. Le Coût de Revient : Plus que le Prix d'Achat</h2>
            <p>Le coût de revient d'un produit ne se limite pas à son prix d'achat. Pour le calculer précisément, vous devez inclure :</p>
            <ul>
              <li><strong>Le coût d'achat :</strong> Le prix que vous payez à votre fournisseur.</li>
              <li><strong>Les frais de port :</strong> Les coûts pour recevoir le produit.</li>
              <li><strong>Les frais de douane :</strong> Si vous importez des marchandises.</li>
              <li><strong>Les coûts de stockage :</strong> Une partie du loyer de votre entrepôt, par exemple.</li>
            </ul>

            <img alt="Entrepôt de e-commerce avec des étagères de produits" className="rounded-lg my-8" src="https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=800" />

            <h2>2. Les Coûts Variables Liés à la Vente</h2>
            <p>Chaque vente engendre des coûts. Ne les oubliez pas :</p>
            <ul>
              <li><strong>Les frais de transaction :</strong> La commission de votre plateforme de paiement (Stripe, PayPal...).</li>
              <li><strong>Les frais de plateforme :</strong> La commission de la marketplace où vous vendez (Amazon, Etsy...).</li>
              <li><strong>Les coûts d'emballage :</strong> Cartons, ruban adhésif, protections...</li>
              <li><strong>Les coûts d'expédition :</strong> Ce que vous payez pour envoyer le colis au client.</li>
            </ul>

            <h2>3. Le Coût d'Acquisition Client (CAC)</h2>
            <p>C'est le coût le plus souvent oublié. Si vous dépensez 100€ en publicité pour réaliser 10 ventes, votre CAC par produit est de 10€. Vous devez l'intégrer dans votre calcul de rentabilité pour avoir une vision juste.</p>

            <div className="my-12 p-8 bg-card/50 border border-primary/30 rounded-xl text-center">
              <h3 className="text-2xl font-bold text-white">Calculez votre rentabilité en un clic.</h3>
              <p className="text-white/80 mt-2 mb-6">Le module "Gestion des Produits" de YourBizFlow vous permet de renseigner tous vos coûts et de voir instantanément votre marge brute et votre bénéfice net par produit.</p>
              <Link to="/signup">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Analyser mes produits avec YourBizFlow <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <h2>La Formule Magique</h2>
            <p>La formule de base pour le bénéfice net par produit est simple :</p>
            <p className="text-center font-mono bg-secondary p-4 rounded-md"><code>Bénéfice Net = Prix de Vente - Coût de Revient - Coûts de Vente - Coût d'Acquisition</code></p>
            <p>Et pour la marge nette :</p>
            <p className="text-center font-mono bg-secondary p-4 rounded-md"><code>Marge Nette (%) = (Bénéfice Net / Prix de Vente) * 100</code></p>

            <h2>Pourquoi c'est crucial ?</h2>
            <p>En calculant cela pour chaque produit, vous pourrez :</p>
            <ul>
              <li>Identifier vos produits les plus (et les moins) rentables.</li>
              <li>Ajuster vos prix de vente en connaissance de cause.</li>
              <li>Optimiser vos dépenses publicitaires sur les produits à forte marge.</li>
              <li>Décider d'arrêter de vendre les produits qui vous font perdre de l'argent.</li>
            </ul>
            <p>Arrêtez de naviguer à vue. Prenez le contrôle de votre rentabilité et prenez des décisions basées sur des données fiables. Des outils comme YourBizFlow sont conçus pour vous simplifier la vie et vous donner cette visibilité essentielle.</p>
          </article>
        </div>
      </main>

      <MinimalFooter onPrivacyClick={() => {}} onTermsClick={() => {}} />
    </div>
  );
};

export default BlogPost3;