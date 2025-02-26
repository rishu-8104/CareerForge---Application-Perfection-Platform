"use client"

import { useDropzone } from "react-dropzone"
import { Upload, CheckCircle, FileUp } from "lucide-react"
import type { JobApplication } from "@/lib/types"
import { extractTextFromPdf, parseResumeWithAI } from "@/lib/file-utils"
import { motion } from "framer-motion"

interface ResumeUploadProps {
  jobApplication: JobApplication
  updateJobApplication: (data: Partial<JobApplication>) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  processingStep: string | null
  setProcessingStep: (step: string | null) => void
  setError: (error: string) => void
  resumeInputMethod: string
}

export default function ResumeUpload({
  jobApplication,
  updateJobApplication,
  isLoading,
  setIsLoading,
  processingStep,
  setProcessingStep,
  setError,
  resumeInputMethod,
}: ResumeUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      try {
        const file = acceptedFiles[0]
        if (!file) return

        setIsLoading(true)
        setError("")

        try {
          // Step 1: Extract text from the resume file using OCR
          setProcessingStep("Extracting text from resume using OCR...")
          const resumeText = await extractTextFromPdf(file)

          if (!resumeText || resumeText.trim().length === 0) {
            throw new Error("Failed to extract text from the resume file")
          }

          // Step 2: Parse the resume text using AI
          setProcessingStep("Analyzing resume structure...")
          const resumeData = await parseResumeWithAI(resumeText)

          updateJobApplication({
            resumeFile: file,
            resumeText,
            resumeData,
          })

          setIsLoading(false)
          setProcessingStep(null)
        } catch (err) {
          setError(`Failed to process the resume file: ${err instanceof Error ? err.message : "Unknown error"}`)
          setIsLoading(false)
          setProcessingStep(null)
        }
      } catch (err) {
        setError("Failed to process the file. Please try again.")
        setIsLoading(false)
        setProcessingStep(null)
      }
    },
  })

  const dropzoneVariants = {
    inactive: {
      scale: 1,
      boxShadow: "0px 0px 0px rgba(0, 82, 204, 0)",
      borderColor: "rgba(225, 228, 232, 1)",
    },
    active: {
      scale: 1.02,
      boxShadow: "0px 5px 15px rgba(0, 82, 204, 0.2)",
      borderColor: "rgba(0, 82, 204, 0.8)",
    },
  }

  return (
    <motion.div
      {...getRootProps()}
      variants={dropzoneVariants}
      initial="inactive"
      animate={isDragActive ? "active" : "inactive"}
      whileHover="active"
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        isDragActive
          ? "border-primary bg-primary-light"
          : "border-border hover:border-primary hover:bg-primary-light/50"
      }`}
    >
      <input {...getInputProps()} />
      {isLoading && resumeInputMethod === "upload" ? (
        <div className="flex flex-col items-center justify-center gap-5 py-8">
          <div className="relative w-20 h-20">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-primary/30"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            ></motion.div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            ></motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
                <FileUp className="h-8 w-8 text-primary" />
              </motion.div>
            </div>
          </div>
          <div className="text-center">
            <motion.h3
              className="text-xl font-semibold text-primary mb-2"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              {processingStep || "Processing resume..."}
            </motion.h3>
            <p className="text-sm text-foreground/70">This may take a moment</p>
          </div>
          <div className="w-full max-w-xs bg-muted h-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "60%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full progress-bar-primary"
            />
          </div>
        </div>
      ) : jobApplication.resumeFile &&
        jobApplication.resumeFile.name !== "pasted-resume.txt" &&
        jobApplication.resumeFile.name !== "manual-resume.txt" ? (
        <motion.div
          className="py-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <motion.div
            className="flex items-center justify-center gap-3 mb-4"
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="p-3 bg-strength-major-light rounded-xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 0, 0, 0, 10, -10, 10, -10, 0],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
            >
              <CheckCircle className="h-8 w-8 text-strength-major" />
            </motion.div>
            <div className="text-left">
              <h3 className="font-semibold text-lg text-primary">Resume Uploaded</h3>
              <p className="text-sm text-foreground/70">{jobApplication.resumeFile.name}</p>
            </div>
          </motion.div>

          {jobApplication.resumeData && (
            <motion.div
              className="mt-6 p-5 bg-primary-light rounded-xl border border-primary-color/20 text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.h4
                className="font-semibold text-base mb-3 text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Extracted Details:
              </motion.h4>
              <motion.div
                className="grid gap-2"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                <motion.div
                  className="flex items-center gap-2"
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <motion.div className="w-3 h-3 rounded-full bg-primary" whileHover={{ scale: 1.5 }}></motion.div>
                  <p className="text-sm">
                    <span className="font-medium">Name:</span>{" "}
                    {jobApplication.resumeData.personalDetails.name || "Not detected"}
                  </p>
                </motion.div>
                <motion.div
                  className="flex items-center gap-2"
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <motion.div className="w-3 h-3 rounded-full bg-secondary" whileHover={{ scale: 1.5 }}></motion.div>
                  <p className="text-sm">
                    <span className="font-medium">Contact:</span>{" "}
                    {jobApplication.resumeData.personalDetails.email || "Not detected"}
                  </p>
                </motion.div>
                {jobApplication.resumeData.personalDetails.github && (
                  <motion.div
                    className="flex items-center gap-2"
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <motion.div className="w-3 h-3 rounded-full bg-accent" whileHover={{ scale: 1.5 }}></motion.div>
                    <p className="text-sm">
                      <span className="font-medium">GitHub:</span> {jobApplication.resumeData.personalDetails.github}
                    </p>
                  </motion.div>
                )}
                <motion.div
                  className="flex items-center gap-2"
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <motion.div
                    className="w-3 h-3 rounded-full bg-strength-major"
                    whileHover={{ scale: 1.5 }}
                  ></motion.div>
                  <p className="text-sm">
                    <span className="font-medium">Experience:</span> {jobApplication.resumeData.experience.length}{" "}
                    positions
                  </p>
                </motion.div>
                <motion.div
                  className="flex items-center gap-2"
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <motion.div
                    className="w-3 h-3 rounded-full bg-keyword-match"
                    whileHover={{ scale: 1.5 }}
                  ></motion.div>
                  <p className="text-sm">
                    <span className="font-medium">Skills:</span> {jobApplication.resumeData.skills.length} skills
                    identified
                  </p>
                </motion.div>
                {jobApplication.resumeData.certifications && jobApplication.resumeData.certifications.length > 0 && (
                  <motion.div
                    className="flex items-center gap-2"
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <motion.div className="w-3 h-3 rounded-full bg-secondary" whileHover={{ scale: 1.5 }}></motion.div>
                    <p className="text-sm">
                      <span className="font-medium">Certifications:</span>{" "}
                      {jobApplication.resumeData.certifications.length} found
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <div className="py-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-primary-light p-8 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 0, 0, 0, 10, -10, 10, -10, 0],
              }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
            >
              <Upload className="h-12 w-12 text-primary" />
            </motion.div>
          </motion.div>
          <motion.h3
            className="text-xl font-semibold mb-3 text-primary-gradient"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Drag & drop your resume here
          </motion.h3>
          <motion.p
            className="text-base text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            or click to select a file
          </motion.p>
          <motion.p
            className="text-sm font-medium text-foreground/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Supported formats: PDF, DOC, DOCX, TXT
          </motion.p>
          {!jobApplication.resumeFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 py-2 px-4 bg-muted rounded-md inline-block border border-border shadow-sm"
            >
              <p className="text-sm font-semibold text-foreground">No file chosen</p>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}

