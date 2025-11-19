import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import { MinimalFooter } from '@/components/ui/minimal-footer';

const AppDescriptionTemplate = ({ 
  title, 
  description, 
  metaDescription,
  icon: Icon,
  features,
  benefits,
  useCases,
  appPath,
  ctaText,
  heroTitle,
  heroDescription
}) => {
  const location = useLocation();
  const lang = location.pathname.startsWith('/fr') ? 'fr' : 'en';
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <html lang={lang} />
        <title>{title} | YourBizFlow</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${title} | YourBizFlow`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://yourbizflow.com${window.location.pathname}`} />
      </Helmet>

      <PublicHeader />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-16 py-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {heroTitle}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {heroDescription}
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              {ctaText} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
            {lang === 'fr' ? 'Fonctionnalités principales' : 'Key Features'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16 bg-muted/50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
            {lang === 'fr' ? 'Avantages' : 'Benefits'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
            {lang === 'fr' ? 'Cas d\'utilisation' : 'Use Cases'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 bg-primary/5 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            {lang === 'fr' ? 'Prêt à commencer ?' : 'Ready to get started?'}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {lang === 'fr' 
              ? 'Essayez gratuitement et découvrez comment cette application peut transformer votre activité.'
              : 'Try it for free and discover how this app can transform your business.'}
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              {ctaText} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </section>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default AppDescriptionTemplate;
