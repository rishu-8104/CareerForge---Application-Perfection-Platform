"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, FileInput, Loader2, CheckCircle } from "lucide-react"
import type { JobApplication } from "@/lib/types"
import { cleanupResumeText, parseResumeWithAI } from "@/lib/file-utils"
import { motion } from "framer-motion"

interface ResumePasteProps {
  jobApplication: JobApplication
  updateJobApplication: (data: Partial<JobApplication>) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  processingStep: string | null
  setProcessingStep: (step: string | null) => void
  setError: (error: string) => void
  resumeInputMethod: string
}

export default function ResumePaste({
  jobApplication,
  updateJobApplication,
  isLoading,
  setIsLoading,
  processingStep,
  setProcessingStep,
  setError,
  resumeInputMethod,
}: ResumePasteProps) {
  const [pastedResumeText, setPastedResumeText] = useState("")

  const handlePastedResumeSubmit = async () => {
    if (!pastedResumeText.trim()) {
      setError("Please paste your resume text")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Step 1: Clean up the pasted text to remove formatting artifacts
      setProcessingStep("Cleaning up resume text...")
      const cleanedText = cleanupResumeText(pastedResumeText)

      // Create a virtual file for consistency with the rest of the application
      const resumeFile = new File([cleanedText], "pasted-resume.txt", { type: "text/plain" })

      // Step 2: Parse the resume text using AI
      setProcessingStep("Analyzing resume structure...")
      const resumeData = await parseResumeWithAI(cleanedText)

      updateJobApplication({
        resumeFile,
        resumeText: cleanedText,
        resumeData,
      })

      setIsLoading(false)
      setProcessingStep(null)
    } catch (err) {
      setError(`Failed to process the resume text: ${err instanceof Error ? err.message : "Unknown error"}`)
      setIsLoading(false)
      setProcessingStep(null)
    }
  }

  return (
    <div className="space-y-4">
      <motion.div whileTap={{ scale: 0.995 }} whileFocus={{ scale: 1.01 }} className="relative">
        <Textarea
          placeholder="Paste your resume text here..."
          className="min-h-[300px] font-mono text-sm"
          value={pastedResumeText}
          onChange={(e) => setPastedResumeText(e.target.value)}
          disabled={isLoading && resumeInputMethod === "paste"}
        />
        {pastedResumeText && (
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

      {isLoading && resumeInputMethod === "paste" ? (
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">{processingStep || "Processing resume..."}</p>
        </div>
      ) : jobApplication.resumeFile && jobApplication.resumeFile.name === "pasted-resume.txt" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="p-3 bg-muted/30 rounded text-left"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-medium"
          >
            Resume processed successfully
          </motion.p>
          {jobApplication.resumeData && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.3,
                  },
                },
              }}
            >
              <motion.p
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="text-xs text-muted-foreground mt-2"
              >
                Name: {jobApplication.resumeData.personalDetails.name || "Not detected"}
              </motion.p>
              <motion.p
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="text-xs text-muted-foreground"
              >
                Experience: {jobApplication.resumeData.experience.length} positions
              </motion.p>
              <motion.p
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="text-xs text-muted-foreground"
              >
                Skills: {jobApplication.resumeData.skills.length} skills identified
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            type="button"
            onClick={handlePastedResumeSubmit}
            disabled={!pastedResumeText.trim() || isLoading}
            className="w-full"
          >
            <motion.div
              className="flex items-center"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <FileInput className="h-4 w-4 mr-2" />
              Process Resume Text
            </motion.div>
          </Button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="p-2 bg-amber-50 border border-amber-200 rounded-md"
      >
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ x: 3 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <p className="text-xs text-amber-700 font-medium">Tip</p>
        </motion.div>
        <p className="text-xs text-amber-700 mt-1">
          When pasting your resume, any formatting artifacts like asterisks (**) will be automatically removed.
        </p>
      </motion.div>
    </div>
  )
}

