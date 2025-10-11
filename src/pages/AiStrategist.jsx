import React from "react";
import { motion } from "framer-motion";
import { Brain, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const AiStrategist = () => {
  const { toast } = useToast();

  const handleFeatureClick = (featureName) => {
    toast({
      title: "🚧 Feature not implemented",
      description: `The "${featureName}" feature is not yet available. You can ask for it in your next request! 🚀`,
    });
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
          <Brain className="w-8 h-8 mr-3 text-primary" />
          AI Business Strategist
        </h1>
        <p className="text-muted-foreground">
          Get AI-powered insights and strategies to grow your business.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border rounded-xl p-6 flex flex-col items-center text-center shadow-sm"
        >
          <Lightbulb className="w-12 h-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Idea Generation</h2>
          <p className="text-muted-foreground mb-4">
            AI helps you brainstorm new ideas for products, services or
            marketing campaigns.
          </p>
          <Button
            onClick={() => handleFeatureClick("Idea Generation")}
            className="w-full"
          >
            Explore
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-xl p-6 flex flex-col items-center text-center shadow-sm"
        >
          <TrendingUp className="w-12:12 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Market Analysis</h2>
          <p className="text-muted-foreground mb-4">
            Get in-depth insights into market trends and competition.
          </p>
          <Button
            onClick={() => handleFeatureClick("Market Analysis")}
            className="w-full"
          >
            Analyze
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-xl p-6 flex flex-col items-center text-center shadow-sm"
        >
          <Brain className="w-12:12 text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Strategic Optimization</h2>
          <p className="text-muted-foreground mb-4">
            Receive personalized recommendations to optimize your business
            strategy.
          </p>
          <Button
            onClick={() => handleFeatureClick("Strategic Optimization")}
            className="w-full"
          >
            Optimize
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default AiStrategist;
