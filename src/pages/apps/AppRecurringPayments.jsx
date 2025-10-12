import React from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/pages/LandingPage";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { ArrowRight, Repeat, BarChart, Shield, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const AppRecurringPayments = () => {
  const color = "text-amber-400";
  const bgColor = "bg-amber-500/10";
  const ringColor = "ring-amber-500/30";
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, href, callback) => {
    e.preventDefault();
    if (callback) callback();

    const isExternal = href.startsWith("/");
    const isAnchor = href.startsWith("#");

    const scrollToAnchor = (hash) => {
      const id = hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const yOffset = -80;
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 0);
    };

    if (isExternal) {
      navigate(href);
    } else if (isAnchor) {
      if (location.pathname !== "/welcome") {
        navigate(`/welcome${href}`);
      } else {
        scrollToAnchor(href);
      }
    }
  };

  const features = [
    {
      icon: Settings,
      title: "Flexible Subscriptions",
      description:
        "Create monthly, annual, or custom plans to perfectly meet your customers' needs.",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description:
        "Integration with Stripe for secure transactions and simplified payment management.",
    },
    {
      icon: BarChart,
      title: "MRR monitoring",
      description:
        "Track your Monthly Recurring Revenue (MRR) and other key metrics to drive your growth.",
    },
  ];

  const pageUrl = "https://yourbizflow.com/apps/recurring-payments";
  const title = "Recurring Payments | YourBizFlow";
  const description =
    "Manage your subscriptions and automatically bill your customers at regular intervals. Stabilize your revenue and simplify your management with YourBizFlow.";
  const imageUrl =
    "https://images.unsplash.com/photo-1639755249856-4071d0afe31a?q=80&w=1200";

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Recurring Payments - YourBizFlow",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: description,
    url: pageUrl,
    image: imageUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    author: {
      "@type": "Organization",
      name: "YourBizFlow",
    },
  };

  return (
    <div className="w-full text-white bg-[#030303] overflow-x-hidden">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content="recurring payment, subscription, automatic billing, MRR, recurring revenue, YourBizFlow"
        />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      <PublicHeader onNavClick={handleNavClick} />
      <main className="pt-24">
        <section className="container mx-auto px-6 py-20 text-center flex flex-col items-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "relative w-48 h-48 flex items-center justify-center rounded-full mb-8",
              bgColor
            )}
          >
            <div
              className={cn("absolute inset-0 rounded-full ring-4", ringColor)}
            ></div>
            <Repeat className={cn("w-24 h-24", color)} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
          >
            Effortless Recurring Payments
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-8"
          >
            Create subscription plans, manage your subscribed customers and
            automate billing. The ideal way to build predictable and stable
            income.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link to="/signup">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-white text-black hover:bg-white/90 shadow-lg shadow-indigo-500/30"
              >
                Launch my subscriptions <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <div
              className="relative w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-amber-500/10"
              style={{ paddingTop: "56.25%" }}
            >
              <iframe
                src="https://www.youtube.com/embed/2wQ6VvZU1vo?si=XU3LwSaTfiDNvJVd"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              ></iframe>
            </div>
          </div>
        </section>

        <section className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                Fonctionnalités Clés
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 text-center"
                >
                  <div className="inline-block p-3 rounded-full bg-white/5 mb-4">
                    <feature.icon className={cn("w-8 h-8", color)} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white/90">
                    {feature.title}
                  </h3>
                  <p className="text-white/60">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Why choose Recurring Payments?
            </h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              Recurring revenue is the holy grail of financial stability. This
              module allows you to set up a solid subscription model, build
              customer loyalty and make your revenue predictable, month after
              month.
            </p>
          </div>
        </section>
      </main>
      <MinimalFooter onPrivacyClick={() => {}} onTermsClick={() => {}} />
    </div>
  );
};

export default AppRecurringPayments;
