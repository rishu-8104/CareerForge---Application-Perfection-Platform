"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { JobApplication } from "@/lib/types"
import { analyzeResume } from "@/lib/ai-utils"
import { XCircle, CheckCircle, AlertTriangle, Award, ChevronRight, BarChart2 } from "lucide-react"
import { motion } from "framer-motion"

interface ResumeAnalysisProps {
  jobApplication: JobApplication
  updateJobApplication: (data: Partial<JobApplication>) => void
  onNext: () => void
}

export default function ResumeAnalysis({ jobApplication, updateJobApplication, onNext }: ResumeAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const performAnalysis = async () => {
      if (!jobApplication.analysis && jobApplication.resumeText && jobApplication.jobDescription) {
        try {
          setIsAnalyzing(true)
          setError("")

          const analysis = await analyzeResume(jobApplication.resumeText, jobApplication.jobDescription)

          updateJobApplication({ analysis })
          setIsAnalyzing(false)
        } catch (err) {
          console.error("Error analyzing resume:", err)
          setError("Failed to analyze the resume. Please try again.")
          setIsAnalyzing(false)
        }
      }
    }

    performAnalysis()
  }, [jobApplication.resumeText, jobApplication.jobDescription, jobApplication.analysis, updateJobApplication])

  if (isAnalyzing) {
    return (
      <Card className="overflow-hidden shadow-card">
        <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center space-y-8 bg-white">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-secondary/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-secondary animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart2 className="h-10 w-10 text-secondary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold text-secondary-gradient">Analyzing Your Resume</h3>
            <p className="text-muted-foreground">Our AI is comparing your resume to the job description</p>
          </div>
          <div className="w-full max-w-md h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "70%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-secondary-gradient"
            />
          </div>
          <p className="text-sm text-muted-foreground">This may take a moment</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="overflow-hidden shadow-card">
        <CardContent className="pt-10 pb-10 bg-white">
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Analysis Failed</h3>
              <p className="text-destructive">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="secondary" size="lg" className="rounded-full">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!jobApplication.analysis) {
    return null
  }

  const { score, keywordMatch, missingKeywords, suggestions, strengths } = jobApplication.analysis

  const getScoreColor = (value: number) => {
    if (value >= 80) return "progress-bar-score-excellent"
    if (value >= 60) return "progress-bar-score-good"
    if (value >= 40) return "progress-bar-score-poor"
    return "progress-bar-score-bad"
  }

  const getScoreText = (value: number) => {
    if (value >= 80) return "text-score-excellent font-bold"
    if (value >= 60) return "text-score-good font-bold"
    if (value >= 40) return "text-score-poor font-bold"
    return "text-score-bad font-bold"
  }

  const getScoreBg = (value: number) => {
    if (value >= 80) return "bg-strength-major-light border border-strength-major/30"
    if (value >= 60) return "bg-strength-minor-light border border-strength-minor/30"
    if (value >= 40) return "bg-suggestion-helpful-light border border-suggestion-helpful/30"
    return "bg-suggestion-critical-light border border-suggestion-critical/30"
  }

  const getSuggestionType = (index: number, total: number) => {
    // Categorize suggestions by importance (first ones are more critical)
    if (index < total * 0.3)
      return {
        bg: "bg-suggestion-critical-light",
        text: "text-suggestion-critical",
        border: "border-suggestion-critical",
        label: "Critical",
      }
    if (index < total * 0.7)
      return {
        bg: "bg-suggestion-important-light",
        text: "text-suggestion-important",
        border: "border-suggestion-important",
        label: "Important",
      }
    return {
      bg: "bg-suggestion-helpful-light",
      text: "text-suggestion-helpful",
      border: "border-suggestion-helpful",
      label: "Helpful",
    }
  }

  const getStrengthType = (index: number, total: number) => {
    // Categorize strengths (first ones are major strengths)
    if (index < total * 0.5)
      return {
        bg: "bg-strength-major-light",
        text: "text-strength-major",
        border: "border-strength-major",
        label: "Major Strength",
      }
    return {
      bg: "bg-strength-minor-light",
      text: "text-strength-minor",
      border: "border-strength-minor",
      label: "Good Strength",
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <Card className="overflow-hidden shadow-card">
      <CardContent className="pt-8 pb-8 bg-white">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          {jobApplication.resumeData && (
            <motion.div variants={item} className="p-5 bg-secondary-light rounded-xl border border-secondary-color">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-secondary">
                    {jobApplication.resumeData.personalDetails.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {jobApplication.resumeData.personalDetails.email} •{" "}
                    {jobApplication.resumeData.personalDetails.phone}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-secondary-light rounded-full text-xs font-medium text-secondary">
                    {jobApplication.resumeData.experience.length} Positions
                  </div>
                  <div className="px-3 py-1 bg-keyword-match-light rounded-full text-xs font-medium text-keyword-match">
                    {jobApplication.resumeData.skills.length} Skills
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-secondary-color/20">
                <p className="text-sm">
                  <span className="font-medium">Most recent:</span>{" "}
                  {jobApplication.resumeData.experience[0]?.position || ""} at{" "}
                  {jobApplication.resumeData.experience[0]?.company || ""}
                </p>
                {jobApplication.resumeData.personalDetails.github && (
                  <p className="text-sm mt-1">
                    <span className="font-medium">GitHub:</span> {jobApplication.resumeData.personalDetails.github}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          <motion.div variants={item} className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-secondary-light rounded-lg">
                  <BarChart2 className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold">ATS Compatibility Score</h3>
              </div>
              <div className={`text-2xl font-bold ${getScoreText(score)} px-3 py-1 rounded-full ${getScoreBg(score)}`}>
                {score}%
              </div>
            </div>
            <Progress value={score} className="h-3 rounded-lg" indicatorClassName={getScoreColor(score)} />
            <p className="text-sm text-muted-foreground">
              {score >= 80
                ? "Excellent! Your resume is highly compatible with ATS systems."
                : score >= 60
                  ? "Good compatibility, but there's room for improvement."
                  : score >= 40
                    ? "Your resume needs improvements for better ATS compatibility."
                    : "Your resume needs significant improvements for ATS compatibility."}
            </p>
          </motion.div>

          <motion.div variants={item} className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-keyword-match-light rounded-lg">
                  <CheckCircle className="h-5 w-5 text-keyword-match" />
                </div>
                <h3 className="text-lg font-semibold">Keyword Match</h3>
              </div>
              <div
                className={`text-2xl font-bold ${getScoreText(keywordMatch)} px-3 py-1 rounded-full ${getScoreBg(keywordMatch)}`}
              >
                {keywordMatch}%
              </div>
            </div>
            <Progress
              value={keywordMatch}
              className="h-3 rounded-lg"
              indicatorClassName={getScoreColor(keywordMatch)}
            />
            <p className="text-sm text-muted-foreground">
              {keywordMatch >= 80
                ? "Excellent keyword matching with the job description!"
                : keywordMatch >= 60
                  ? "Good keyword matching, but consider adding more relevant terms."
                  : keywordMatch >= 40
                    ? "Your resume needs more keywords from the job description."
                    : "Your resume is missing many keywords from the job description."}
            </p>
          </motion.div>

          <motion.div variants={item} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-keyword-missing-light rounded-lg">
                <AlertTriangle className="h-5 w-5 text-keyword-missing" />
              </div>
              <h3 className="text-lg font-semibold">Missing Keywords</h3>
            </div>
            {missingKeywords.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {missingKeywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="bg-keyword-missing-light px-3 py-2 rounded-lg text-sm border border-keyword-missing/20 flex items-center justify-between"
                  >
                    <span className="text-keyword-missing font-medium">{keyword}</span>
                    <span className="w-2 h-2 rounded-full bg-keyword-missing"></span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-strength-major-light p-4 rounded-lg border border-strength-major/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-strength-major" />
                  <p className="text-sm font-medium text-strength-major">No missing keywords detected! 🎉</p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div variants={item} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-suggestion-important-light rounded-lg">
                <AlertTriangle className="h-5 w-5 text-suggestion-important" />
              </div>
              <h3 className="text-lg font-semibold">Suggestions for Improvement</h3>
            </div>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => {
                const suggestionType = getSuggestionType(index, suggestions.length)
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${suggestionType.bg} p-4 rounded-lg border ${suggestionType.border}/20`}
                  >
                    <div className="mt-1 min-w-[24px]">
                      <div
                        className={`w-6 h-6 rounded-full bg-white flex items-center justify-center border ${suggestionType.border}`}
                      >
                        <span className={`text-xs font-bold ${suggestionType.text}`}>{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white ${suggestionType.text}`}>
                          {suggestionType.label}
                        </span>
                      </div>
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div variants={item} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-strength-major-light rounded-lg">
                <Award className="h-5 w-5 text-strength-major" />
              </div>
              <h3 className="text-lg font-semibold">Resume Strengths</h3>
            </div>
            <div className="space-y-3">
              {strengths.map((strength, index) => {
                const strengthType = getStrengthType(index, strengths.length)
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${strengthType.bg} p-4 rounded-lg border ${strengthType.border}/20`}
                  >
                    <div className="mt-1 min-w-[24px]">
                      <CheckCircle className={`h-5 w-5 ${strengthType.text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white ${strengthType.text}`}>
                          {strengthType.label}
                        </span>
                      </div>
                      <p className="text-sm">{strength}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div variants={item} className="flex justify-end pt-4">
            <Button onClick={onNext} variant="accent" size="xl" className="rounded-full group">
              <span>Next: Optimize Resume</span>
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  )
}

