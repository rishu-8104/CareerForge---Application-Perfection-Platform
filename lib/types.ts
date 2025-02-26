export interface JobApplication {
  jobDescription: string
  companyName: string
  resumeFile: File | null
  resumeText: string
  resumeData?: ResumeData
  analysis: ResumeAnalysis | null
  optimizedResume: string
  coverLetter: string
}

export interface ResumeAnalysis {
  score: number
  keywordMatch: number
  missingKeywords: string[]
  suggestions: string[]
  strengths: string[]
}

export interface ResumeData {
  personalDetails: {
    name: string
    email: string
    phone: string
    location: string
    linkedIn?: string
    portfolio?: string
    github?: string
  }
  experience: {
    company: string
    position: string
    duration: string
    description: string[]
  }[]
  education: {
    institution: string
    degree: string
    duration: string
  }[]
  skills: string[]
  certifications?: string[]
  rawText: string
}

