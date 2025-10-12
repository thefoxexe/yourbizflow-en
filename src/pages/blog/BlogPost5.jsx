import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Helmet } from "react-helmet";
import { PublicHeader } from "@/pages/LandingPage";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const BlogPost5 = () => {
  const navigate = useNavigate();

  const handleNavClick = (e, href) => {
    e.preventDefault();
    navigate(href);
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "Creating Quotes That Guarantee Convert: The Complete Guide",
    description:
      "Learn how to create clear, professional, and persuasive quotes that turn your prospects into loyal customers. The complete guide to effective quotes.",
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1200",
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
    datePublished: "2025-09-18",
    dateModified: "2025-09-18",
  };
  const pageUrl =
    "https://yourbizflow.com/blog/creer-des-devis-qui-convertissent-a-coup-sur";

  return (
    <div className="w-full min-h-screen text-white bg-[#030303] flex flex-col">
      <Helmet>
        <title>Create Quotes that Convert | YourBizFlow Blog</title>
        <meta
          name="description"
          content="Learn how to create clear, professional, and persuasive quotes that turn prospects into loyal customers. The complete guide to effective quotes."
        />
        <meta
          name="keywords"
          content="quote, commercial proposal, conversion, sale, freelance, YourBizFlow"
        />
        <meta
          property="og:title"
          content="Create Quotes that Convert | YourBizFlow Blog"
        />
        <meta
          property="og:description"
          content="Learn how to create clear, professional, and persuasive quotes that turn your prospects into customers."
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={articleSchema.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Create Quotes that Convert | YourBizFlow Blog"
        />
        <meta
          name="twitter:description"
          content="Learn how to create clear, professional, and persuasive quotes that turn your prospects into customers."
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
            alt="Personne signant un contrat ou un devis avec un stylo"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1200"
          />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center px-4"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-white max-w-4xl">
                Create Quotes That Guarantee Convert: The Complete Guide
              </h1>
              <p className="text-lg text-white/80 mt-4">
                September 18, 2025 &bull; 6 min read
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16 max-w-3xl">
          <article className="prose prose-invert lg:prose-xl mx-auto">
            <p>
              A quote is much more than just a price list. This is your first
              concrete value proposition to a prospect. A well-designed quote
              can make the difference between a won deal and a missed
              opportunity. Here's how to create quotes that not only inform, but
              persuade.
            </p>

            <h2>1. Clarity above all</h2>
            <p>
              Your prospect must instantly understand what you are offering and
              at what price. Use clear titles and detail each position. Group
              the services by logical categories (e.g.: "Phase 1: Design",
              "Phase 2: Development"). Transparency is a guarantee of trust.
            </p>

            <h2>2. Personalize your Proposal</h2>
            <p>
              Don't settle for a generic model. Use the terms that your prospect
              used during your discussions. Add a short introduction that
              summarizes the problem and how your solution addresses it. Show
              that you have listened and understood.
            </p>

            <img
              alt="Example of a personalized and professional quote on a laptop screen"
              className="rounded-lg my-8"
              src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800"
            />

            <h2>3. Emphasize Value, Not Just Price</h2>
            <p>
              Instead of just listing “Website Creation,” write “Creating a
              conversion-optimized website, including responsive design and
              basic SEO.” Each line should remind you of the benefit for the
              customer, not just the task you are going to accomplish.
            </p>

            <h2>4. Propose Options (Strategic Pricing)</h2>
            <p>
              Offering several options (e.g.: “Essential”, “Recommended”,
              “Premium”) is a formidable sales technique. This shifts the
              client's question from "Do I work with them?" to “Which option is
              best for me?”. The "Recommended" option is often the one chosen.
            </p>

            <div className="my-12 p-8 bg-card/50 border border-primary/30 rounded-xl text-center">
              <h3 className="text-2xl font-bold text-white">
                Create professional quotes in 2 minutes.
              </h3>
              <p className="text-white/80 mt-2 mb-6">
                YourBizFlow's quote module allows you to create, customize and
                send quotes that impress your customers and turn into invoices
                in one click.
              </p>
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create my first quote <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <h2>5. Include Next Steps and Conditions</h2>
            <p>
              Don't leave your prospect in the dark. Clearly indicate the next
              steps: "To accept this quote, please sign and return it by [date].
              A 30% deposit will then be required to start the project." Also
              specify your payment and delivery conditions.
            </p>

            <h2>6. Take care of the Presentation</h2>
            <p>
              A quote with your logo, a streamlined layout and professional
              typography has much more impact than a simple table on a Word
              document. Tools like YourBizFlow allow you to generate impeccable
              PDFs that reinforce your brand image.
            </p>

            <p>
              By applying these principles, your quotes will become real
              conversion tools, helping you secure more projects and build
              trusting relationships with your customers from the first contact.
            </p>
          </article>
        </div>
      </main>

      <MinimalFooter onPrivacyClick={() => {}} onTermsClick={() => {}} />
    </div>
  );
};

export default BlogPost5;
