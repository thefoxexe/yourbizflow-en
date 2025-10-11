import React from 'react';
import { motion } from 'framer-motion';

const ModuleCard = ({ name, description, icon: Icon, status, usage }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h4 className="text-white font-medium">{name}</h4>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
          Actif
        </span>
        <p className="text-gray-400 text-xs mt-1">Usage: {usage}</p>
      </div>
    </motion.div>
  );
};

export default ModuleCard;