import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Helmet } from 'react-helmet';
import { PublicHeader } from '@/pages/LandingPage';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const blogPosts = [
  {
    slug: '5-astuces-pour-optimiser-votre-facturation',
    titleKey: 'page_blog_post1_title',
    descriptionKey: 'page_blog_post1_desc',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800',
    dateKey: 'page_blog_post1_date',
    readTimeKey: 'page_blog_post1_read_time',
  },
  {
    slug: 'pourquoi-un-crm-est-essentiel-pour-votre-pme',
    titleKey: 'page_blog_post2_title',
    descriptionKey: 'page_blog_post2_desc',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800',
    dateKey: 'page_blog_post2_date',
    readTimeKey: 'page_blog_post2_read_time',
  },
  {
    slug: 'comment-calculer-la-rentabilite-de-vos-produits',
    titleKey: 'page_blog_post3_title',
    descriptionKey: 'page_blog_post3_desc',
    image: 'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?q=80&w=800',
    dateKey: 'page_blog_post3_date',
    readTimeKey: 'page_blog_post3_read_time',
  },
  {
    slug: 'automatiser-les-taches-repetitives-pour-gagner-du-temps',
    titleKey: 'page_blog_post4_title',
    descriptionKey: 'page_blog_post4_desc',
    image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=800',
    dateKey: 'page_blog_post4_date',
    readTimeKey: 'page_blog_post4_read_time',
  },
  {
    slug: 'creer-des-devis-qui-convertissent-a-coup-sur',
    titleKey: 'page_blog_post5_title',
    descriptionKey: 'page_blog_post5_desc',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800',
    dateKey: 'page_blog_post5_date',
    readTimeKey: 'page_blog_post5_read_time',
  },
  {
    slug: 'l-importance-du-suivi-de-temps-pour-les-freelances',
    titleKey: 'page_blog_post6_title',
    descriptionKey: 'page_blog_post6_desc',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800',
    dateKey: 'page_blog_post6_date',
    readTimeKey: 'page_blog_post6_read_time',
  },
];

const BlogPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNavClick = (e, href) => {
    e.preventDefault();
    navigate(href);
  };
  
  return (
    <div className="w-full min-h-screen text-white bg-[#030303] flex flex-col">
      <Helmet>
        <title>{t('page_blog_title')} | {t('app_name')}</title>
        <meta name="description" content={t('page_blog_subtitle')} />
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
              {t('page_blog_title')}
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
              {t('page_blog_subtitle')}
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
                      alt={t(post.titleKey)}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                     src={post.image} />
                  </div>
                </Link>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-sm text-muted-foreground mb-2">
                    <span>{t(post.dateKey)}</span> &bull; <span>{t(post.readTimeKey)}</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-3 flex-grow">
                    <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {t(post.titleKey)}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground mb-4 text-sm">{t(post.descriptionKey)}</p>
                  <Link to={`/blog/${post.slug}`} className="mt-auto">
                    <Button variant="outline" className="w-full">
                      {t('read_article')} <ArrowRight className="w-4 h-4 ml-2" />
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