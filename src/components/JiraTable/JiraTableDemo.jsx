import React, { useState, useEffect } from 'react';
import { JiraProjectTable } from './JiraProjectTable';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  RocketLaunchIcon, 
  CursorArrowRaysIcon,
  HandRaisedIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

export const JiraTableDemo = () => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [showFeatures, setShowFeatures] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const features = [
    {
      icon: <CursorArrowRaysIcon className="h-8 w-8" />,
      title: "Interactive Editing",
      description: "Click any cell to edit content inline with real-time updates"
    },
    {
      icon: <HandRaisedIcon className="h-8 w-8" />,
      title: "Drag & Drop",
      description: "Reorder projects and subtasks with smooth animations"
    },
    {
      icon: <ArrowPathIcon className="h-8 w-8" />,
      title: "Expandable Rows",
      description: "Click to expand/collapse project subtasks dynamically"
    },
    {
      icon: <SparklesIcon className="h-8 w-8" />,
      title: "Smart Filters",
      description: "Advanced search and filtering with instant results"
    }
  ];

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentFeature((prev) => (prev + 1) % features.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, features.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFeatures(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Interactive Header Section */}
      <motion.div 
        className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 relative overflow-hidden"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-8 right-8 w-3 h-3 bg-purple-400 rounded-full"
            animate={{ 
              scale: [1, 2, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute bottom-4 left-1/4 w-1 h-1 bg-indigo-400 rounded-full"
            animate={{ 
              scale: [1, 3, 1],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center py-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <RocketLaunchIcon className="h-8 w-8 text-blue-600" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Jira-like Project Management Table
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Advanced project tracking with drag-and-drop, inline editing, and expandable subtasks
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <motion.span 
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>Live Demo</span>
              </div>
              
              {/* Interactive Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  title={isAutoPlaying ? "Pause animations" : "Play animations"}
                >
                  {isAutoPlaying ? (
                    <PauseIcon className="h-4 w-4 text-gray-600" />
                  ) : (
                    <PlayIcon className="h-4 w-4 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={() => setIsAnimating(!isAnimating)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Toggle animations"
                >
                  <SparklesIcon className={`h-4 w-4 ${isAnimating ? 'text-blue-600' : 'text-gray-600'}`} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Interactive Features Showcase */}
      <AnimatePresence>
        {showFeatures && (
          <motion.div
            className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentFeature}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3"
                    >
                      <div className="text-white">
                        {features[currentFeature].icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">
                          {features[currentFeature].title}
                        </h3>
                        <p className="text-xs text-blue-100">
                          {features[currentFeature].description}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                <div className="flex gap-1">
                  {features.map((_, index) => (
                    <motion.button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentFeature ? 'bg-white' : 'bg-white/30'
                      }`}
                      onClick={() => setCurrentFeature(index)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Single scrollable container */}
      <motion.div 
        className="flex-1 min-h-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <JiraProjectTable />
      </motion.div>

      {/* Interactive Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 right-8 w-16 h-16 bg-blue-100 rounded-full opacity-20"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-8 w-12 h-12 bg-purple-100 rounded-full opacity-20"
          animate={{ 
            y: [0, 15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-8 h-8 bg-indigo-100 rounded-full opacity-20"
          animate={{ 
            x: [0, 10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>
    </div>
  );
};

