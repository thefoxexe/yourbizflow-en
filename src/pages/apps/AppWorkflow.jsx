import React from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/pages/LandingPage";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import {
  ArrowRight,
  Workflow as WorkflowIcon,
  Zap,
  Link2,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AppWorkflow = () => {
  const color = "text-violet-400";
  const bgColor = "bg-violet-500/10";
  const ringColor = "ring-violet-500/30";
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
      icon: Zap,
      title: "Triggers & Actions",
      description:
        "Create event-based scenarios: 'When a quote is accepted, then create a task'.",
    },
    {
      icon: Link2,
      title: "Login between Modules",
      description:
        "Make your modules communicate with each other for unrivaled workflow.",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description:
        "Be alerted to important actions without being drowned in unnecessary notifications.",
    },
  ];

  const pageUrl = "https://yourbizflow.com/apps/workflow";
  const title = "Automation & Workflows | YourBizFlow";
  const description =
    "Automate your repetitive tasks and create intelligent workflows. Save time and focus on your growth with YourBizFlow.";
  const imageUrl =
    "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=1200";

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Automation & Workflows - YourBizFlow",
    applicationCategory: "ProductivityApplication",
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
          content="automation, workflow, productivity, task automation, SME, YourBizFlow"
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
            <WorkflowIcon className={cn("w-24 h-24", color)} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
          >
            Put Your Business on Autopilot
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-8"
          >
            Create automation scenarios to make YourBizFlow work for you, even
            when you sleep. Free yourself from repetitive tasks and focus on
            strategy.
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
                Discover automation <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </section>

        <section className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                Key Features
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
              Why choose Automation?
            </h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              This is the superpower of productive companies. By automating the
              small tasks that take up your time, you free up hours each week to
              focus on innovation, customer relationships and growth.
            </p>
          </div>
        </section>
      </main>
      <MinimalFooter onPrivacyClick={() => {}} onTermsClick={() => {}} />
    </div>
  );
};

export default AppWorkflow;
