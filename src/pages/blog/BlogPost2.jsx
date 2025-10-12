import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Helmet } from "react-helmet";
import { PublicHeader } from "@/pages/LandingPage";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const BlogPost2 = () => {
  const navigate = useNavigate();

  const handleNavClick = (e, href) => {
    e.preventDefault();
    navigate(href);
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline:
      "Why a CRM is Essential for Your SME (Even If You're Just Starting)",
    description:
      "Find out why a customer relationship management (CRM) tool is an essential asset for SMEs, even in the start-up phase.",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200",
    author: {
      "@type": "Organization",
      name: "YourBizFlow",
    },
    publisher: {
      "@type": "Organization",
      name: "YourBizFlow",
      logo: {
        "@type": "ImageObject",
        url: "https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/6b69cc214c03819301dd8cb8579b78dc.png",
      },
    },
    datePublished: "2025-09-28",
    dateModified: "2025-09-28",
  };
  const pageUrl =
    "https://yourbizflow.com/blog/pourquoi-un-crm-est-essentiel-pour-votre-pme";

  return (
    <div className="w-full min-h-screen text-white bg-[#030303] flex flex-col">
      <Helmet>
        <title>Why a CRM is Essential for Your SME | YourBizFlow Blog</title>
        <meta
          name="description"
          content="Find out why a customer relationship management (CRM) tool is an essential asset for SMEs, even in the start-up phase. Improve your customer support with YourBizFlow."
        />
        <meta
          name="keywords"
          content="CRM, SME, customer management, customer relations, freelance, YourBizFlow"
        />
        <meta
          property="og:title"
          content="Why a CRM is Essential for Your SME | YourBizFlow Blog"
        />
        <meta
          property="og:description"
          content="A good customer relationship management tool can transform your business, even on a small scale. Here's why."
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={articleSchema.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Why a CRM is Essential for Your SME | YourBizFlow Blog"
        />
        <meta
          name="twitter:description"
          content="A good customer relationship management tool can transform your business, even on a small scale. Here's why."
        />
        <meta name="twitter:image" content={articleSchema.image} />
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>

      <PublicHeader onNavClick={handleNavClick} />

      <main className="flex-grow pt-24">
        <div className="relative h-64 md:h-96 w-full">
          <img
            alt="Team in meeting discussing customer strategy"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200"
          />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center px-4"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-white max-w-4xl">
                Why a CRM is Essential for Your SME (Even If You're Just
                Starting)
              </h1>
              <p className="text-lg text-white/80 mt-4">
                September 28, 2025 &bull; 5 min read
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16 max-w-3xl">
          <article className="prose prose-invert lg:prose-xl mx-auto">
            <p>
              Many freelancers and SME managers think that CRM (Customer
              Relationship Management) are expensive gas factories, reserved for
              large companies. This is a mistake that can be costly. A simple,
              well-integrated CRM is one of the best investments you can make,
              from day one.
            </p>

            <h2>1. Centralize all information</h2>
            <p>
              No more post-its, scattered notes and endless Excel spreadsheets.
              A CRM centralizes all information about your prospects and
              customers: contact details, exchange history, quotes sent,
              invoices paid, etc. At a glance, you know everything about your
              contact.
            </p>

            <img
              alt="YourBizFlow CRM dashboard showing customer records"
              className="rounded-lg my-8"
              src="https://images.unsplash.com/photo-1611095973763-414af227f32c?q=80&w=800"
            />

            <h2>2. Never miss an opportunity again</h2>
            <p>
              When did you follow up with this promising prospect? What was the
              subject of your last call with this loyal customer? A CRM allows
              you to schedule reminders and track every interaction. You will
              never forget a follow-up again and you will offer personalized
              follow-up that makes the difference.
            </p>

            <h2>3. Understand your customers better</h2>
            <p>
              By analyzing your CRM data, you can identify your most profitable
              customers, understand their needs and anticipate their future
              demands. It is a powerful tool for refining your offer and your
              marketing actions.
            </p>

            <div className="my-12 p-8 bg-card/50 border border-primary/30 rounded-xl text-center">
              <h3 className="text-2xl font-bold text-white">
                Turn your contacts into loyal customers.
              </h3>
              <p className="text-white/80 mt-2 mb-6">
                The YourBizFlow CRM module is simple, visual and perfectly
                integrated with your quotes and invoices. Never lose track
                again.
              </p>
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Discover the YourBizFlow CRM{" "}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <h2>4. Gain professionalism</h2>
            <p>
              Imagine the impression you give when you remember every detail of
              your last conversation with a client. A CRM gives you the means to
              deliver an exceptional customer experience, thereby strengthening
              your brand image and customer loyalty.
            </p>

            <h2>5. Save time</h2>
            <p>
              By automating monitoring and centralizing information, a CRM saves
              you valuable time. You can reinvest this time where it has the
              most value: developing your product, finding new customers or
              simply taking time for yourself.
            </p>

            <p>
              Far from being an unnecessary expense, a CRM is a real engine of
              growth. With integrated tools like YourBizFlow, it has never been
              easier to implement effective customer management.
            </p>
          </article>
        </div>
      </main>

      <MinimalFooter onPrivacyClick={() => {}} onTermsClick={() => {}} />
    </div>
  );
};

export default BlogPost2;
