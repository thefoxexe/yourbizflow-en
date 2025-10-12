import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Helmet } from "react-helmet";
import { PublicHeader } from "@/pages/LandingPage";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const BlogPost6 = () => {
  const navigate = useNavigate();

  const handleNavClick = (e, href) => {
    e.preventDefault();
    navigate(href);
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline:
      "The Importance of Time Tracking for Freelancers (and How to Do It Right)",
    description:
      "Find out why time tracking is crucial for freelancers, whether you charge by the hour or by the project. Improve your profitability and productivity.",
    image:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200",
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
    datePublished: "2025-09-15",
    dateModified: "2025-09-15",
  };
  const pageUrl =
    "https://yourbizflow.com/blog/l-importance-du-suivi-de-temps-pour-les-freelances";

  return (
    <div className="w-full min-h-screen text-white bg-[#030303] flex flex-col">
      <Helmet>
        <title>
          The Importance of Time Tracking for Freelancers | YourBizFlow Blog
        </title>
        <meta
          name="description"
          content="Find out why time tracking is crucial for freelancers, whether you charge by the hour or by the project. Improve your profitability and productivity."
        />
        <meta
          name="keywords"
          content="time tracking, time tracking, freelance, profitability, productivity, YourBizFlow"
        />
        <meta
          property="og:title"
          content="The Importance of Time Tracking for Freelancers | YourBizFlow Blog"
        />
        <meta
          property="og:description"
          content="Find out why time tracking is crucial for freelancers, whether you charge by the hour or by the project."
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={articleSchema.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="The Importance of Time Tracking for Freelancers | YourBizFlow Blog"
        />
        <meta
          name="twitter:description"
          content="Find out why time tracking is crucial for freelancers, whether you charge by the hour or by the project."
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
            alt="Stopwatch and laptop on modern freelance desk"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200"
          />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center px-4"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-white max-w-4xl">
                The Importance of Time Tracking for Freelancers (and How to Do
                It Right)
              </h1>
              <p className="text-lg text-white/80 mt-4">
                September 15, 2025 &bull; 5 min read
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16 max-w-3xl">
          <article className="prose prose-invert lg:prose-xl mx-auto">
            <p>
              For many freelancers, time tracking seems to be a constraint,
              especially for those who bill per project. However, it is one of
              the most powerful tools for understanding and optimizing your
              activity. Whether you're paid hourly or not, knowing where your
              time is spent is fundamental.
            </p>

            <h2>1. Evaluate the Real Profitability of Your Projects</h2>
            <p>
              You sold a project for €2000. Good deal? Impossible to say without
              knowing how much time you spent on it. If you spent 100 hours
              there, your actual hourly rate is only €20. Time tracking allows
              you to calculate the profitability of each project and adjust your
              rates for future ones.
            </p>

            <h2>2. Create More Accurate Quotes</h2>
            <p>
              How to estimate the time needed for a future project? Based on
              data from your past projects. Rigorous time tracking gives you a
              reliable database to estimate your future quotes with formidable
              precision, thus avoiding undervaluing your work.
            </p>

            <img
              alt="Graph from YourBizFlow showing the breakdown of time spent on different projects"
              className="rounded-lg my-8"
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800"
            />

            <h2>3. Justify your Invoices and Gain Transparency</h2>
            <p>
              Even if you charge on a flat rate basis, being able to provide a
              detailed report of the time spent on each major task (design,
              development, revisions, etc.) is a guarantee of professionalism
              and transparency. This builds trust with your client and justifies
              the value of your work.
            </p>

            <div className="my-12 p-8 bg-card/50 border border-primary/30 rounded-xl text-center">
              <h3 className="text-2xl font-bold text-white">
                Know exactly where your time is going.
              </h3>
              <p className="text-white/80 mt-2 mb-6">
                The YourBizFlow Time Tracking module allows you to start a timer
                for each task and generate detailed reports for your invoices.
              </p>
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Optimize my time with YourBizFlow{" "}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <h2>4. Identify Time-consuming Tasks</h2>
            <p>
              By analyzing your time tracking data, you might realize that you
              spend 30% of your time on non-billable administrative tasks. This
              awareness is the first step to optimizing, delegating or
              automating these tasks and thus increasing your billable time.
            </p>

            <h2>How to track your time?</h2>
            <ul>
              <li>
                <strong>Be disciplined:</strong> Start a timer for every task,
                even the shortest ones.
              </li>
              <li>
                <strong>Be specific:</strong> Associate each time entry with a
                specific project and task.
              </li>
              <li>
                <strong>Use an integrated tool:</strong> A tool like
                YourBizFlow, which links time tracking to your projects and
                invoicing, will save you considerable time compared to separate
                applications.
              </li>
            </ul>
            <p>
              Time tracking is not there to fool you, but to enlighten you. It's
              a minimal investment in discipline for a huge return on investment
              in profitability and productivity.
            </p>
          </article>
        </div>
      </main>

      <MinimalFooter onPrivacyClick={() => {}} onTermsClick={() => {}} />
    </div>
  );
};

export default BlogPost6;
