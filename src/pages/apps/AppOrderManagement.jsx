import React from "react";
import { ShoppingCart, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { PublicHeader } from "@/pages/LandingPage";
import { Helmet } from "react-helmet";
import { MinimalFooter } from "@/components/ui/minimal-footer";

const AppOrderManagement = () => {
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

  const pageUrl = "https://yourbizflow.com/apps/order-management";
  const title = "Order Management | YourBizFlow";
  const description =
    "Effectively manage your order lifecycle, from preparation to delivery, with YourBizFlow's order management module.";
  const imageUrl =
    "https://images.unsplash.com/photo-1571677246347-5040036b95cc?q=80&w=1200";

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Order Management - YourBizFlow",
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
    <div className="flex flex-col min-h-screen bg-[#030303] text-white">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content="order management, order management, logistics, e-commerce, YourBizFlow"
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
      <main className="flex-grow pt-24">
        <section className="container mx-auto px-6 py-12 text-center">
          <ShoppingCart className="w-24 h-24 mx-auto text-blue-300" />
          <h1 className="text-5xl font-bold mt-6 mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            Order Management
          </h1>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Manage the entire processing cycle of your customer orders with
            incredible efficiency, from preparation to delivery.
          </p>
        </section>

        <section className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Centralize and automate your order flow
              </h2>
              <ul className="space-y-4 text-white/80">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    Create orders manually or transform your accepted quotes in
                    one click.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    Follow each step with visual statuses: In preparation, To be
                    shipped, Shipped, Delivered, Canceled.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    Automatically synchronize your stock: products are
                    decremented as soon as an order is shipped or delivered.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    In case of cancellation or deletion, the stock is
                    automatically restored. No more inventory errors!
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <img
                alt="Screenshot of Order Management Dashboard"
                className="rounded-lg shadow-2xl"
                src="https://images.unsplash.com/photo-1571677246347-5040036b95cc?q=80&w=1200"
              />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to optimize your logistics?
          </h2>
          <p className="text-lg text-white/60 mb-8">
            Join YourBizFlow and turn your order management into a competitive
            advantage.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-white text-black hover:bg-white/90"
            >
              Get started for free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </section>
      </main>
      <MinimalFooter />
    </div>
  );
};

export default AppOrderManagement;
