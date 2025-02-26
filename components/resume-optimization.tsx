"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { JobApplication } from "@/lib/types"
import { optimizeResume } from "@/lib/ai-utils"
import { cleanupResumeText } from "@/lib/file-utils"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface ResumeOptimizationProps {
  jobApplication: JobApplication
  updateJobApplication: (data: Partial<JobApplication>) => void
  onNext: () => void
}

export default function ResumeOptimization({ jobApplication, updateJobApplication, onNext }: ResumeOptimizationProps) {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [error, setError] = useState("")
  const [editedResume, setEditedResume] = useState("")

  useEffect(() => {
    const performOptimization = async () => {
      if (!jobApplication.optimizedResume && jobApplication.analysis) {
        try {
          setIsOptimizing(true)
          setError("")

          const optimizedResume = await optimizeResume(
            jobApplication.resumeText,
            jobApplication.jobDescription,
            jobApplication.analysis,
            jobApplication.resumeData,
          )

          // Clean up any asterisks that might still be in the optimized resume
          const cleanedOptimizedResume = cleanupResumeText(optimizedResume)

          updateJobApplication({ optimizedResume: cleanedOptimizedResume })
          setEditedResume(cleanedOptimizedResume)
          setIsOptimizing(false)
        } catch (err) {
          setError("Failed to optimize the resume. Please try again.")
          setIsOptimizing(false)
        }
      } else if (jobApplication.optimizedResume) {
        // Also clean up any asterisks in existing optimized resume
        const cleanedOptimizedResume = cleanupResumeText(jobApplication.optimizedResume)
        setEditedResume(cleanedOptimizedResume)

        // Update the application state if we cleaned up any asterisks
        if (cleanedOptimizedResume !== jobApplication.optimizedResume) {
          updateJobApplication({ optimizedResume: cleanedOptimizedResume })
        }
      }
    }

    performOptimization()
  }, [
    jobApplication.resumeText,
    jobApplication.jobDescription,
    jobApplication.analysis,
    jobApplication.optimizedResume,
    jobApplication.resumeData,
    updateJobApplication,
  ])

  const handleSaveChanges = () => {
    // Clean up any asterisks before saving
    const cleanedResume = cleanupResumeText(editedResume)
    updateJobApplication({ optimizedResume: cleanedResume })
    onNext()
  }

  const handleResetToOriginal = () => {
    // Clean up any asterisks in the original resume
    const cleanedOriginalResume = cleanupResumeText(jobApplication.resumeText)
    setEditedResume(cleanedOriginalResume)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Clean up asterisks as the user types
    const newText = e.target.value
    setEditedResume(newText)
  }

  if (isOptimizing) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center">Optimizing your resume for this job application...</p>
          <p className="text-center text-sm text-muted-foreground">This may take a moment</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="mb-6 p-5 bg-secondary-light rounded-xl border border-secondary-color/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-semibold text-secondary">ATS Optimization Score</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your resume has been optimized to improve ATS compatibility
              </p>
            </div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
              className="flex items-center gap-3"
            >
              {jobApplication.analysis && (
                <div className="flex items-center gap-2">
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full flex items-center justify-center bg-white shadow-sm">
                      <span
                        className={`text-2xl font-bold ${
                          jobApplication.analysis.score >= 80
                            ? "text-score-excellent"
                            : jobApplication.analysis.score >= 60
                              ? "text-score-good"
                              : jobApplication.analysis.score >= 40
                                ? "text-score-poor"
                                : "text-score-bad"
                        }`}
                      >
                        {jobApplication.analysis.score}%
                      </span>
                    </div>
                    <svg className="absolute inset-0 h-16 w-16 -rotate-90" viewBox="0 0 100 100">
                      <circle className="stroke-muted" strokeWidth="8" fill="transparent" r="42" cx="50" cy="50" />
                      <circle
                        className={`${
                          jobApplication.analysis.score >= 80
                            ? "stroke-score-excellent"
                            : jobApplication.analysis.score >= 60
                              ? "stroke-score-good"
                              : jobApplication.analysis.score >= 40
                                ? "stroke-score-poor"
                                : "stroke-score-bad"
                        }`}
                        strokeWidth="8"
                        strokeDasharray={`${jobApplication.analysis.score * 2.64}, 1000`}
                        strokeLinecap="round"
                        fill="transparent"
                        r="42"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Keyword Match</span>
                    <span
                      className={`text-lg font-bold ${
                        jobApplication.analysis.keywordMatch >= 80
                          ? "text-score-excellent"
                          : jobApplication.analysis.keywordMatch >= 60
                            ? "text-score-good"
                            : jobApplication.analysis.keywordMatch >= 40
                              ? "text-score-poor"
                              : "text-score-bad"
                      }`}
                    >
                      {jobApplication.analysis.keywordMatch}%
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Optimized Resume</h3>
          {jobApplication.resumeData && (
            <div className="mb-4 p-3 bg-muted/30 rounded-md">
              <p className="text-sm font-medium">Extracted Personal Details:</p>
              <p className="text-xs text-muted-foreground">
                Name: {jobApplication.resumeData.personalDetails.name} | Email:{" "}
                {jobApplication.resumeData.personalDetails.email} | Location:{" "}
                {jobApplication.resumeData.personalDetails.location}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Skills: {jobApplication.resumeData.skills.slice(0, 5).join(", ")}
                {jobApplication.resumeData.skills.length > 5 ? "..." : ""}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-4">
            Your resume has been optimized for this job application. You can make additional edits below.
          </p>

          <Textarea value={editedResume} onChange={handleTextChange} className="min-h-[400px] font-mono text-sm" />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleResetToOriginal}>
            Reset to Original
          </Button>
          <Button onClick={handleSaveChanges}>Next: Generate Cover Letter</Button>
        </div>
      </CardContent>
    </Card>
  )
}

