import React from "react";
import { motion } from "framer-motion";
import { Star, Download, Lock, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const MarketplaceCard = ({ module, onInstall, delay = 0 }) => {
  const getStatusIcon = () => {
    switch (module.status) {
      case "active":
        return <Check className="w-4 h-4" />;
      case "locked":
        return <Lock className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (module.status) {
      case "active":
        return "Activated";
      case "locked":
        return "Upgrade";
      default:
        return "Install";
    }
  };

  const getButtonVariant = () => {
    switch (module.status) {
      case "active":
        return "outline";
      case "locked":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-black/20 backdrop-blur-xl border rounded-xl p-6 flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300 ${
        module.status === "locked" ? "border-gray-500/20" : "border-white/10"
      }`}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3
                className={`text-lg font-bold ${
                  module.status === "locked" ? "text-gray-400" : "text-white"
                }`}
              >
                {module.name}
              </h3>
              {module.price === "Premium" && (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                  <Crown className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-yellow-300">
                    {module.requiredPlan}
                  </span>
                </div>
              )}
            </div>
            <p
              className={`text-sm mb-3 ${
                module.status === "locked" ? "text-gray-500" : "text-gray-300"
              }`}
            >
              {module.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span
              className={`text-sm ${
                module.status === "locked" ? "text-gray-500" : "text-gray-300"
              }`}
            >
              {module.rating}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4 text-gray-400" />
            <span
              className={`text-sm ${
                module.status === "locked" ? "text-gray-500" : "text-gray-300"
              }`}
            >
              {module.downloads}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h4
            className={`text-sm font-medium mb-2 ${
              module.status === "locked" ? "text-gray-500" : "text-gray-300"
            }`}
          >
            Features:
          </h4>
          <ul className="space-y-1">
            {module.features.map((feature, index) => (
              <li
                key={index}
                className={`text-xs flex items-center gap-2 ${
                  module.status === "locked" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button
        onClick={onInstall}
        variant={getButtonVariant()}
        className={`w-full mt-4 ${
          module.status === "active"
            ? "bg-green-500/20 border-green-500/30 text-green-400 cursor-not-allowed"
            : module.status === "locked"
            ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
        }`}
      >
        {getStatusIcon()}
        <span className="ml-2">{getStatusText()}</span>
      </Button>
    </motion.div>
  );
};

export default MarketplaceCard;
