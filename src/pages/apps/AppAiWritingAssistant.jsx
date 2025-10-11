import React from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  Bot,
  Mail,
  Users,
  ArrowRight,
  CheckCircle,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { PublicHeader, navLinks } from "../LandingPage";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { cn } from "@/lib/utils";

const AppAiWritingAssistant = () => {
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

  const pageUrl = "https://yourbizflow.com/apps/ai-writing-assistant";
  const title = "AI Writing Assistant | YourBizFlow";
  const description =
    "Discover YourBizFlow's AI Writing Assistant. Generate professional content in one click: emails, LinkedIn posts, product descriptions, and more.";
  const imageUrl =
    "https://images.unsplash.com/photo-1677696795198-5ac0e21060ed?q=80&w=1200";

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AI Writing Assistant - YourBizFlow",
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
    <div className="w-full text-white bg-[#030303]">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content="AI writing assistant, content generator, automatic writing, content marketing, YourBizFlow"
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
      <PublicHeader navLinks={navLinks} onNavClick={handleNavClick} />
      <main className="pt-24">
        <section className="container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block bg-violet-500/10 text-violet-400 p-3 rounded-xl mb-4">
              <Bot className="w-10-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
              AI Writing Assistant
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-8">
              Never be at a loss for words again. Generate professional-quality
              content in seconds, from prospecting emails to engaging LinkedIn
              posts.
            </p>
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90"
              >
                Try the AI ​​Assistant <ArrowRight class="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <div
              className="relative w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-violet-500/10"
              style={{ paddingTop: "56.25%" }}
            >
              <iframe
                src="https://www.youtube.com/embed/TFV0xNzv9e8?si=ma3DUWUSL-Te7LYF"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              ></iframe>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg blur-xl opacity-20"></div>
                <div className="relative bg-card p-4 rounded-lg shadow-lg">
                  <img
                    alt="Screenshot of the AI ​​Writing Assistant interface"
                    className="rounded-md shadow-2xl"
                    src="https://images.unsplash.com/photo-1677696795198-5ac0e21060ed?q=80&w=800"
                  />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">Your creative partner</h2>
              <p className="text-white/70">
                AI Writing Assistant is integrated into YourBizFlow to help you
                where you need it most. Save valuable time and ensure every
                communication is impactful and professional.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <span>
                    <strong className="text-white">
                      Multi-content generation:
                    </strong>{" "}
                    Emails, posts for social networks, product descriptions,
                    short messages... AI adapts to your needs.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <span>
                    <strong className="text-white">
                      Customizable tone and style:
                    </strong>{" "}
                    Choose the tone (formal, friendly, persuasive...) and length
                    for a result perfectly suited to your audience.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <span>
                    <strong className="text-white">
                      Suggestions and rewriting:
                    </strong>{" "}
                    Get multiple variations for each request and refine the
                    generated text until it's perfect.
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-white/5">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-10">Main use cases</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-lg">
                <Mail className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Professional Emails
                </h3>
                <p className="text-white/60">
                  Generate prospecting, follow-up or follow-up emails that
                  capture attention and get responses.
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg">
                <Users className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">LinkedIn Posts</h3>
                <p className="text-white/60">
                  Create engaging posts to build your personal brand or promote
                  your business on LinkedIn.
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg">
                <BrainCircuit className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Product descriptions
                </h3>
                <p className="text-white/60">
                  Write compelling, SEO-optimized product descriptions that
                  convert visitors into customers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MinimalFooter onPrivacyClick={() => {}} onTermsClick={() => {}} />
    </div>
  );
};

export default AppAiWritingAssistant;
