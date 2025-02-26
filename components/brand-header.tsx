"use client"

import { motion } from "framer-motion"
import { Hammer, Sparkles, Star, Zap, Rocket, ArrowRight } from "lucide-react"

export default function BrandHeader() {
  return (
    <div className="relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <motion.div
          className="absolute top-10 left-[10%] w-24 h-24 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute top-20 right-[15%] w-32 h-32 rounded-full bg-secondary/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-10 left-[20%] w-40 h-40 rounded-full bg-accent/10 blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 2,
          }}
        />
      </div>

      {/* Header Content */}
      <div className="relative py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-center">
            {/* Logo and Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="relative">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                  className="bg-white p-4 rounded-2xl shadow-lg"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Hammer className="h-12 w-12 text-primary" />
                  </motion.div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.2 }}
                  className="absolute -top-2 -right-2 bg-accent text-white p-1 rounded-full"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Star className="h-4 w-4" />
                  </motion.div>
                </motion.div>
              </div>

              <div>
                <motion.h1
                  className="text-5xl font-bold tracking-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <motion.span
                    className="text-primary-gradient"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    Career
                  </motion.span>
                  <motion.span
                    className="text-accent-gradient"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    Forge
                  </motion.span>
                </motion.h1>
                <motion.p
                  className="text-muted-foreground text-lg mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Application Perfection Platform
                </motion.p>
              </div>
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-3 mb-8"
            >
              <motion.div
                className="h-px w-12 bg-gradient-to-r from-primary to-transparent"
                initial={{ width: 0 }}
                animate={{ width: "3rem" }}
                transition={{ duration: 0.8, delay: 0.7 }}
              ></motion.div>
              <motion.p
                className="text-xl font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                Transforming Applications into Opportunities
              </motion.p>
              <motion.div
                className="h-px w-12 bg-gradient-to-l from-primary to-transparent"
                initial={{ width: 0 }}
                animate={{ width: "3rem" }}
                transition={{ duration: 0.8, delay: 0.7 }}
              ></motion.div>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              <motion.div
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(0, 82, 204, 0.2)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <motion.div
                  animate={{ rotate: [0, 15, 0, -15, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                >
                  <Zap className="h-4 w-4 text-primary" />
                </motion.div>
                <span className="text-sm font-medium">AI-Powered Analysis</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(0, 194, 168, 0.2)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
                >
                  <Sparkles className="h-4 w-4 text-secondary" />
                </motion.div>
                <span className="text-sm font-medium">Resume Optimization</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(255, 107, 53, 0.2)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <motion.div
                  animate={{
                    y: [0, -3, 0],
                  }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
                >
                  <Rocket className="h-4 w-4 text-accent" />
                </motion.div>
                <span className="text-sm font-medium">Cover Letter Generation</span>
              </motion.div>
            </motion.div>

            {/* Animated Down Arrow */}
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              transition={{
                opacity: { duration: 0.5, delay: 1.2 },
                y: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" },
              }}
              className="mt-4"
            >
              <ArrowRight className="h-6 w-6 text-primary transform rotate-90" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

