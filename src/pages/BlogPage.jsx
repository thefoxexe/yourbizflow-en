import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Helmet } from "react-helmet";
import { PublicHeader } from "@/pages/LandingPage";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const blogPosts = [
  {
    slug: "5-tips-to-optimize-your-billing",
    title: "5 Tips to Optimize Your Billing and Get Paid Faster",
    description:
      "Invoicing is the crux of the matter for any entrepreneur. Discover 5 simple tips to make your invoicing process more efficient, reduce late payments and improve your cash flow.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800",
    date: "October 3, 2025",
    readTime: "4 min read",
  },
  {
    slug: "why-a-crm-is-essential-for-your-SME",
    title: "Why a CRM is Essential for Your SME (Even If You're Just Starting)",
    description:
      "You think CRMs are reserved for large companies? Think again. A good customer relationship management tool can transform your business, even on a small scale. Here's why.",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800",
    date: "September 28, 2025",
    readTime: "5 min reading",
  },
  {
    slug: "how-to-calculate-the-profitability-of-your-products",
    title:
      "How to Calculate the Profitability of Your Products (and Stop Losing Money)",
    description:
      "Selling a lot is good. Selling while being profitable is better. Learn how to calculate the true profitability of each product to make informed decisions and maximize your profits.",
    image:
      "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?q=80&w=800",
    date: "September 25, 2025",
    readTime: "6 min reading",
  },
  {
    slug: "automate-repetitive-tasks-to-save-time",
    title: "Automate Repetitive Tasks to Save Time and Peace",
    description:
      "Administrative tasks are overwhelming you? Learn how automation can free up valuable hours each week to focus on what really matters.",
    image:
      "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=800",
    date: "September 22, 2025",
    readTime: "5 min reading",
  },
  {
    slug: "create-quotes-that-convert-for-sure",
    title: "Creating Quotes That Sure Convert: The Complete Guide",
    description:
      "A quote is not just a simple price document. It's a powerful sales tool. Learn how to create clear, professional and persuasive quotes that turn prospects into customers.",
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800",
    date: "September 18, 2025",
    readTime: "6 min reading",
  },
  {
    slug: "the-importance-of-time-tracking-for-freelancers",
    title:
      "The Importance of Time Tracking for Freelancers (and How to Do It Right)",
    description:
      "Do you charge by the hour or by the project? Time tracking is your best ally for assessing your profitability, justifying your prices and optimizing your productivity. We'll explain everything to you.",
    image:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800",
    date: "September 15, 2025",
    readTime: "5 min reading",
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
        <title>YourBizFlow Blog | Advice for Entrepreneurs and SMEs</title>
        <meta
          name="description"
          content="Advice, tricks and strategies for entrepreneurs and SMEs. Learn how to optimize your business management with YourBizFlow."
        />
        <meta
          name="keywords"
          content="blog, YourBizFlow, entrepreneurial advice, SME management, invoicing, CRM, profitability"
        />
        <meta
          property="og:title"
          content="YourBizFlow Blog | Advice for Entrepreneurs and SMEs"
        />
        <meta
          property="og:description"
          content="Advice, tricks and strategies for entrepreneurs and SMEs. Learn how to optimize your business management with YourBizFlow."
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/yourbizflow_blog_og.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="YourBizFlow Blog | Advice for Entrepreneurs and SMEs"
        />
        <meta
          name="twitter:description"
          content="Advice, tricks and strategies for entrepreneurs and SMEs. Learn how to optimize your business management with YourBizFlow."
        />
        <meta
          name="twitter:image"
          content="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/yourbizflow_blog_twitter.png"
        />
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
              The YourBizFlow Blog
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
              Advice, tricks and strategies for entrepreneurs and SMEs who want
              to simplify their management and accelerate their growth.
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
                      src={post.image}
                    />
                  </div>
                </Link>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-sm text-muted-foreground mb-2">
                    <span>{post.date}</span> &bull; <span>{post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-3 flex-grow">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {post.description}
                  </p>
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
