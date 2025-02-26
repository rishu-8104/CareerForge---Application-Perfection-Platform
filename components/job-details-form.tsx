"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { JobApplication } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Briefcase, FileText, Upload, Building, FileSearch, ChevronRight, CheckCircle } from "lucide-react"
import ResumeUpload from "@/components/resume-upload"
import ResumePaste from "@/components/resume-paste"
import ResumeCreate from "@/components/resume-create"
import { motion } from "framer-motion"

interface JobDetailsFormProps {
  jobApplication: JobApplication
  updateJobApplication: (data: Partial<JobApplication>) => void
  onNext: () => void
}

export default function JobDetailsForm({ jobApplication, updateJobApplication, onNext }: JobDetailsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resumeInputMethod, setResumeInputMethod] = useState<"upload" | "paste" | "manual">("upload")
  const [processingStep, setProcessingStep] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!jobApplication.jobDescription.trim()) {
      setError("Please enter a job description")
      return
    }

    if (!jobApplication.companyName.trim()) {
      setError("Please enter a company name")
      return
    }

    if (!jobApplication.resumeFile) {
      setError("Please provide your resume information")
      return
    }

    onNext()
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={cardVariants}>
      <Card className="overflow-hidden shadow-card">
        <motion.div variants={itemVariants} transition={{ duration: 0.4 }}>
          <CardHeader className="bg-primary-light border-b border-primary-color/30">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-3 bg-white rounded-xl shadow-soft"
                whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Building className="h-6 w-6 text-primary" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl text-primary font-bold">Job Application Details</CardTitle>
                <CardDescription className="text-base mt-1 text-foreground/80">
                  Enter the job details and upload your resume to get started
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </motion.div>
        <CardContent className="pt-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div variants={itemVariants} transition={{ duration: 0.4 }} className="space-y-3">
              <Label htmlFor="companyName" className="text-base font-medium flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                Company Name
              </Label>
              <motion.div whileTap={{ scale: 0.995 }} whileFocus={{ scale: 1.01 }} className="relative">
                <Input
                  id="companyName"
                  value={jobApplication.companyName}
                  onChange={(e) => updateJobApplication({ companyName: e.target.value })}
                  placeholder="Enter the company name"
                  className="border-primary/20 focus-visible:ring-primary h-12 text-base"
                />
                {jobApplication.companyName && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
                  >
                    <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                      <CheckCircle className="h-5 w-5" />
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-3">
              <Label htmlFor="jobDescription" className="text-base font-medium flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-primary" />
                Job Description
              </Label>
              <motion.div whileTap={{ scale: 0.995 }} className="relative">
                <Textarea
                  id="jobDescription"
                  value={jobApplication.jobDescription}
                  onChange={(e) => updateJobApplication({ jobDescription: e.target.value })}
                  placeholder="Paste the full job description here"
                  className="min-h-[200px] border-primary/20 focus-visible:ring-primary text-base"
                />
                {jobApplication.jobDescription && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-3 top-3 text-primary"
                  >
                    <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                      <CheckCircle className="h-5 w-5" />
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} transition={{ duration: 0.4, delay: 0.2 }} className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Resume
              </Label>

              <Tabs
                value={resumeInputMethod}
                onValueChange={(v) => setResumeInputMethod(v as "upload" | "paste" | "manual")}
              >
                <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-lg border border-border">
                  <TabsTrigger
                    value="upload"
                    className="flex items-center gap-2 data-[state=active]:bg-primary-gradient data-[state=active]:text-white font-semibold data-[state=inactive]:text-foreground data-[state=inactive]:font-medium"
                  >
                    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Upload className="h-4 w-4" />
                    </motion.div>
                    Upload Resume
                  </TabsTrigger>
                  <TabsTrigger
                    value="paste"
                    className="flex items-center gap-2 data-[state=active]:bg-secondary-gradient data-[state=active]:text-white font-semibold data-[state=inactive]:text-foreground data-[state=inactive]:font-medium"
                  >
                    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                      <FileText className="h-4 w-4" />
                    </motion.div>
                    Paste Resume
                  </TabsTrigger>
                  <TabsTrigger
                    value="manual"
                    className="flex items-center gap-2 data-[state=active]:bg-accent-gradient data-[state=active]:text-white font-semibold data-[state=inactive]:text-foreground data-[state=inactive]:font-medium"
                  >
                    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Briefcase className="h-4 w-4" />
                    </motion.div>
                    Create Resume
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-6 animate-scale-in">
                  <ResumeUpload
                    jobApplication={jobApplication}
                    updateJobApplication={updateJobApplication}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    processingStep={processingStep}
                    setProcessingStep={setProcessingStep}
                    setError={setError}
                    resumeInputMethod={resumeInputMethod}
                  />
                </TabsContent>

                <TabsContent value="paste" className="mt-6 animate-scale-in">
                  <ResumePaste
                    jobApplication={jobApplication}
                    updateJobApplication={updateJobApplication}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    processingStep={processingStep}
                    setProcessingStep={setProcessingStep}
                    setError={setError}
                    resumeInputMethod={resumeInputMethod}
                  />
                </TabsContent>

                <TabsContent value="manual" className="mt-6 animate-scale-in">
                  <ResumeCreate
                    jobApplication={jobApplication}
                    updateJobApplication={updateJobApplication}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setError={setError}
                    resumeInputMethod={resumeInputMethod}
                  />
                </TabsContent>
              </Tabs>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="p-4 mt-2 bg-destructive/10 border border-destructive/20 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 0, 0, 0, 0, 0, 10, -10, 10, -10, 0],
                      }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
                    >
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm font-medium text-destructive"
                    >
                      {error}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex justify-end pt-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button type="submit" disabled={isLoading} variant="accent" size="xl" className="rounded-full group">
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    <span className="flex items-center">
                      Next: Analyze Resume
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </motion.div>
                    </span>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

