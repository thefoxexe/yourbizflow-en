import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Helmet } from "react-helmet";
import { PublicHeader } from "@/pages/LandingPage";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const BlogPost3 = () => {
  const navigate = useNavigate();

  const handleNavClick = (e, href) => {
    e.preventDefault();
    navigate(href);
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline:
      "How to Calculate the Profitability of Your Products (and Stop Losing Money)",
    description:
      "Learn how to calculate the true profitability of each product by taking into account all costs to make informed decisions and maximize your profits.",
    image:
      "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?q=80&w=1200",
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
    datePublished: "2025-09-25",
    dateModified: "2025-09-25",
  };
  const pageUrl =
    "https://yourbizflow.com/blog/comment-calculer-la-rentabilite-de-vos-produits";

  return (
    <div className="w-full min-h-screen text-white bg-[#030303] flex flex-col">
      <Helmet>
        <title>
          Calculate the Profitability of Your Products | YourBizFlow Blog
        </title>
        <meta
          name="description"
          content="Learn how to calculate the true profitability of each product taking into account all costs. Make informed decisions and maximize your profits with YourBizFlow."
        />
        <meta
          name="keywords"
          content="product profitability, margin calculation, cost price, e-commerce, YourBizFlow"
        />
        <meta
          property="og:title"
          content="Calculate the Profitability of Your Products | YourBizFlow Blog"
        />
        <meta
          property="og:description"
          content="Learn how to calculate the true profitability of each product to make informed decisions and maximize your profits."
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={articleSchema.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Calculate the Profitability of Your Products | YourBizFlow Blog"
        />
        <meta
          name="twitter:description"
          content="Learn how to calculate the true profitability of each product to make informed decisions and maximize your profits."
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
            alt="Profitability calculator and graphs on a desktop"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?q=80&w=1200"
          />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center px-4"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-white max-w-4xl">
                How to Calculate the Profitability of Your Products (and Stop
                Losing Money)
              </h1>
              <p className="text-lg text-white/80 mt-4">
                September 25, 2025 &bull; 6 min read
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16 max-w-3xl">
          <article className="prose prose-invert lg:prose-xl mx-auto">
            <p>
              Turnover is often seen as the ultimate indicator of success.
              However, it says nothing about your profitability. You could sell
              thousands of products and still lose money. The key? Understand
              and calculate the profitability of each product you sell.
            </p>

            <h2>1. The Cost of Production: More than the Purchase Price</h2>
            <p>
              The cost price of a product is not limited to its purchase price.
              To calculate it precisely, you must include:
            </p>
            <ul>
              <li>
                <strong>Purchase cost:</strong> The price you pay to your
                supplier.
              </li>
              <li>
                <strong>Shipping costs:</strong> The costs of receiving the
                product.
              </li>
              <li>
                <strong>Customs fees:</strong> If you import goods.
              </li>
              <li>
                <strong>Storage costs:</strong> Part of the rent for your
                warehouse, for example.
              </li>
            </ul>

            <img
              alt="E-commerce warehouse with product shelves"
              className="rounded-lg my-8"
              src="https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=800"
            />

            <h2>2. Variable Costs Linked to Sales</h2>
            <p>Each sale generates costs. Don't forget them:</p>
            <ul>
              <li>
                <strong>Transaction fees:</strong> The commission of your
                payment platform (Stripe, PayPal, etc.).
              </li>
              <li>
                <strong>Platform fees:</strong> The commission from the
                marketplace where you sell (Amazon, Etsy, etc.).
              </li>
              <li>
                <strong>Packaging costs:</strong> Cardboards, adhesive tape,
                protections...
              </li>
              <li>
                <strong>Shipping costs:</strong> What you pay to send the
                package to the customer.
              </li>
            </ul>

            <h2>3. Customer Acquisition Cost (CAC)</h2>
            <p>
              This is the cost most often forgotten. If you spend €100 on
              advertising to make 10 sales, your CAC per product is €10. You
              must integrate it into your profitability calculation to have a
              fair view.
            </p>

            <div className="my-12 p-8 bg-card/50 border border-primary/30 rounded-xl text-center">
              <h3 className="text-2xl font-bold text-white">
                Calculate your profitability in one click.
              </h3>
              <p className="text-white/80 mt-2 mb-6">
                The YourBizFlow “Product Management” module allows you to enter
                all your costs and instantly see your gross margin and net
                profit per product.
              </p>
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Analyze my products with YourBizFlow{" "}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <h2>The Magic Formula</h2>
            <p>The basic formula for net profit per product is simple:</p>
            <p className="text-center font-mono bg-secondary p-4 rounded-md">
              <code>
                Net Profit = Selling Price - Cost Cost - Selling Costs -
                Acquisition Cost
              </code>
            </p>
            <p>And for the net margin:</p>
            <p className="text-center font-mono bg-secondary p-4 rounded-md">
              <code>Net Margin (%) = (Net Profit / Selling Price) * 100</code>
            </p>

            <h2>Why is this crucial?</h2>
            <p>By calculating this for each product, you will be able to:</p>
            <ul>
              <li>Identify your most (and least) profitable products.</li>
              <li>Adjust your sales prices knowingly.</li>
              <li>Optimize your advertising spend on high-margin products.</li>
              <li>
                Decide to stop selling products that are losing you money.
              </li>
            </ul>
            <p>
              Stop browsing by sight. Take control of your profitability and
              make decisions based on reliable data. Tools like YourBizFlow are
              designed to make your life easier and give you that essential
              visibility.
            </p>
          </article>
        </div>
      </main>

      <MinimalFooter onPrivacyClick={() => {}} onTermsClick={() => {}} />
    </div>
  );
};

export default BlogPost3;
