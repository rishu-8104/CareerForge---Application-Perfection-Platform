import type { ResumeAnalysis, ResumeData } from "./types"
import { cleanupResumeText } from "./file-utils"

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<ResumeAnalysis> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000) // 60 second timeout

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resumeText,
        jobDescription,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.error("Response not OK:", response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Validate the response structure
    if (!isValidAnalysis(data)) {
      console.error("Invalid analysis structure:", data)
      throw new Error("Invalid analysis response structure")
    }

    return data
  } catch (error) {
    console.error("Error analyzing resume:", error)

    // Return fallback data
    return {
      score: 65,
      keywordMatch: 60,
      missingKeywords: ["Error analyzing keywords"],
      suggestions: [
        "Could not generate suggestions due to an error. Please try again.",
        "If the error persists, please check your input and try again later.",
      ],
      strengths: ["Resume appears to be well-formatted"],
    }
  }
}

// Type guard to validate the analysis response
function isValidAnalysis(data: any): data is ResumeAnalysis {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.score === "number" &&
    typeof data.keywordMatch === "number" &&
    Array.isArray(data.missingKeywords) &&
    Array.isArray(data.suggestions) &&
    Array.isArray(data.strengths)
  )
}

export async function optimizeResume(
  resumeText: string,
  jobDescription: string,
  analysis: ResumeAnalysis,
  resumeData?: ResumeData,
): Promise<string> {
  try {
    // Clean up any asterisks in the input text before sending to API
    const cleanedResumeText = cleanupResumeText(resumeText)

    const response = await fetch("/api/optimize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resumeText: cleanedResumeText,
        jobDescription,
        analysis,
        resumeData,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to optimize resume")
    }

    const data = await response.json()

    // Clean up any asterisks in the response text
    const cleanedOptimizedText = cleanupResumeText(data.text)

    return cleanedOptimizedText
  } catch (error) {
    console.error("Error optimizing resume:", error)
    return cleanupResumeText(resumeText) // Return cleaned original text if optimization fails
  }
}

export async function generateCoverLetter(
  optimizedResume: string,
  jobDescription: string,
  companyName: string,
  resumeData?: ResumeData,
): Promise<string> {
  try {
    // Clean up any asterisks in the input text before sending to API
    const cleanedOptimizedResume = cleanupResumeText(optimizedResume)

    const response = await fetch("/api/cover-letter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        optimizedResume: cleanedOptimizedResume,
        jobDescription,
        companyName,
        resumeData,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate cover letter")
    }

    const data = await response.json()

    // Clean up any asterisks in the response text
    const cleanedCoverLetter = cleanupResumeText(data.text)

    // Verify that the cover letter doesn't contain placeholders
    const placeholderRegex = /\[(Your|Hiring|Position|Company|Date|Address|Name)\]/i
    if (placeholderRegex.test(cleanedCoverLetter)) {
      // Replace common placeholders with actual data or reasonable defaults
      const fixedText = cleanedCoverLetter
        .replace(/\[Your Name\]/gi, resumeData?.personalDetails.name || "Applicant")
        .replace(
          /\[Your Date\]/gi,
          new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        )
        .replace(/\[Hiring Manager( Name)?\]/gi, "Hiring Manager")
        .replace(/\[Position\]/gi, "the position")
        .replace(/\[Company Name\]/gi, companyName)
        .replace(/\[Address\]/gi, "")

      return fixedText
    }

    return cleanedCoverLetter
  } catch (error) {
    console.error("Error generating cover letter:", error)

    // If there's an error, generate a basic cover letter with the available information
    const today = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    const applicantName = resumeData?.personalDetails.name || "Applicant"
    const applicantEmail = resumeData?.personalDetails.email || "applicant@example.com"
    const applicantPhone = resumeData?.personalDetails.phone || ""

    return `${today}

Hiring Manager
${companyName}

Dear Hiring Manager,

I am writing to express my interest in the position at ${companyName}. Due to a technical error, the full cover letter could not be generated. Please consider my attached resume for your review.

Sincerely,

${applicantName}
${applicantEmail}
${applicantPhone}
`
  }
}

