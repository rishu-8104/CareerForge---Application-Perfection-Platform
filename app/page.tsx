"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JobDetailsForm from "@/components/job-details-form"
import ResumeAnalysis from "@/components/resume-analysis"
import ResumeOptimization from "@/components/resume-optimization"
import CoverLetterGeneration from "@/components/cover-letter-generation"
import FileConversion from "@/components/file-conversion"
import BrandHeader from "@/components/brand-header"
import type { JobApplication } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { Briefcase, FileText, Sparkles, FileCheck, Download } from "lucide-react"

export default function Home() {
  const [jobApplication, setJobApplication] = useState<JobApplication>({
    jobDescription: "",
    companyName: "",
    resumeFile: null,
    resumeText: "",
    analysis: null,
    optimizedResume: "",
    coverLetter: "",
  })

  const [activeTab, setActiveTab] = useState("job-details")

  const updateJobApplication = (data: Partial<JobApplication>) => {
    setJobApplication((prev) => ({ ...prev, ...data }))
  }

  const handleNextStep = (nextTab: string) => {
    setActiveTab(nextTab)
  }

  const tabIcons = {
    "job-details": <Briefcase className="h-4 w-4" />,
    "resume-analysis": <Sparkles className="h-4 w-4" />,
    "resume-optimization": <FileText className="h-4 w-4" />,
    "cover-letter": <FileCheck className="h-4 w-4" />,
    "file-conversion": <Download className="h-4 w-4" />,
  }

  const tabColors = {
    "job-details": "data-[state=active]:bg-primary-gradient",
    "resume-analysis": "data-[state=active]:bg-secondary-gradient",
    "resume-optimization": "data-[state=active]:bg-accent-gradient",
    "cover-letter": "data-[state=active]:bg-primary-gradient",
    "file-conversion": "data-[state=active]:bg-secondary-gradient",
  }

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  }

  return (
    <main className="min-h-screen bg-background">
      <BrandHeader />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto py-12 px-4"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-5xl mx-auto">
          <div className="mb-8 relative">
            <div className="absolute h-1 bg-muted w-full bottom-0 left-0 rounded-full"></div>
            <TabsList className="w-full p-0 bg-transparent h-auto flex space-x-2">
              {["job-details", "resume-analysis", "resume-optimization", "cover-letter", "file-conversion"].map(
                (tab, index) => (
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex-1"
                  >
                    <TabsTrigger
                      value={tab}
                      disabled={
                        (tab === "resume-analysis" && !jobApplication.resumeFile) ||
                        (tab === "resume-optimization" && !jobApplication.analysis) ||
                        (tab === "cover-letter" && !jobApplication.optimizedResume) ||
                        (tab === "file-conversion" && !jobApplication.coverLetter)
                      }
                      className={`w-full flex items-center justify-center gap-2 py-4 border-b-2 border-transparent 
                      ${tabColors[tab as keyof typeof tabColors]} 
                      data-[state=active]:border-b-4
                      data-[state=active]:text-white
                      data-[state=active]:font-bold
                      data-[state=inactive]:text-foreground
                      data-[state=inactive]:font-semibold
                      rounded-none bg-transparent transition-all`}
                    >
                      <div className="flex items-center gap-2">
                        <motion.div whileHover={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                          {tabIcons[tab as keyof typeof tabIcons]}
                        </motion.div>
                        <span className="font-medium text-foreground">
                          {tab === "job-details" && "Job Details"}
                          {tab === "resume-analysis" && "Analysis"}
                          {tab === "resume-optimization" && "Optimization"}
                          {tab === "cover-letter" && "Cover Letter"}
                          {tab === "file-conversion" && "Download"}
                        </span>
                      </div>
                      <motion.div
                        className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-white text-xs font-bold text-primary shadow-md border border-primary/30"
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        {index + 1}
                      </motion.div>
                    </TabsTrigger>
                  </motion.div>
                ),
              )}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial="hidden" animate="visible" exit="exit" variants={tabVariants}>
              {activeTab === "job-details" && (
                <TabsContent value="job-details" className="mt-6">
                  <JobDetailsForm
                    jobApplication={jobApplication}
                    updateJobApplication={updateJobApplication}
                    onNext={() => handleNextStep("resume-analysis")}
                  />
                </TabsContent>
              )}

              {activeTab === "resume-analysis" && (
                <TabsContent value="resume-analysis" className="mt-6">
                  <ResumeAnalysis
                    jobApplication={jobApplication}
                    updateJobApplication={updateJobApplication}
                    onNext={() => handleNextStep("resume-optimization")}
                  />
                </TabsContent>
              )}

              {activeTab === "resume-optimization" && (
                <TabsContent value="resume-optimization" className="mt-6">
                  <ResumeOptimization
                    jobApplication={jobApplication}
                    updateJobApplication={updateJobApplication}
                    onNext={() => handleNextStep("cover-letter")}
                  />
                </TabsContent>
              )}

              {activeTab === "cover-letter" && (
                <TabsContent value="cover-letter" className="mt-6">
                  <CoverLetterGeneration
                    jobApplication={jobApplication}
                    updateJobApplication={updateJobApplication}
                    onNext={() => handleNextStep("file-conversion")}
                  />
                </TabsContent>
              )}

              {activeTab === "file-conversion" && (
                <TabsContent value="file-conversion" className="mt-6">
                  <FileConversion jobApplication={jobApplication} />
                </TabsContent>
              )}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>

      <footer className="py-12 border-t border-border/30 mt-10 bg-white/50">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-white font-medium shadow-soft"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            © {new Date().getFullYear()} CareerForge
          </motion.div>
          <motion.p
            className="mt-3 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Transforming applications into opportunities
          </motion.p>
          <motion.div
            className="flex justify-center gap-4 mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.a
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ scale: 1.1, color: "#0052CC" }}
            >
              Privacy Policy
            </motion.a>
            <motion.a
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ scale: 1.1, color: "#0052CC" }}
            >
              Terms of Service
            </motion.a>
            <motion.a
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ scale: 1.1, color: "#0052CC" }}
            >
              Contact Us
            </motion.a>
          </motion.div>
        </div>
      </footer>
    </main>
  )
}

