"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { JobApplication } from "@/lib/types"
import { generateCoverLetter } from "@/lib/ai-utils"
import { Loader2 } from "lucide-react"

interface CoverLetterGenerationProps {
  jobApplication: JobApplication
  updateJobApplication: (data: Partial<JobApplication>) => void
  onNext: () => void
}

export default function CoverLetterGeneration({
  jobApplication,
  updateJobApplication,
  onNext,
}: CoverLetterGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const [editedCoverLetter, setEditedCoverLetter] = useState("")

  useEffect(() => {
    const generateLetter = async () => {
      if (!jobApplication.coverLetter && jobApplication.optimizedResume) {
        try {
          setIsGenerating(true)
          setError("")

          const coverLetter = await generateCoverLetter(
            jobApplication.optimizedResume,
            jobApplication.jobDescription,
            jobApplication.companyName,
            jobApplication.resumeData,
          )

          updateJobApplication({ coverLetter })
          setEditedCoverLetter(coverLetter)
          setIsGenerating(false)
        } catch (err) {
          console.error("Error generating cover letter:", err)
          setError("Failed to generate the cover letter. Please try again.")
          setIsGenerating(false)
        }
      } else if (jobApplication.coverLetter) {
        setEditedCoverLetter(jobApplication.coverLetter)
      }
    }

    generateLetter()
  }, [
    jobApplication.optimizedResume,
    jobApplication.jobDescription,
    jobApplication.companyName,
    jobApplication.coverLetter,
    jobApplication.resumeData,
    updateJobApplication,
  ])

  const handleSaveChanges = () => {
    updateJobApplication({ coverLetter: editedCoverLetter })
    onNext()
  }

  const handleRegenerate = async () => {
    try {
      setIsGenerating(true)
      setError("")

      const coverLetter = await generateCoverLetter(
        jobApplication.optimizedResume,
        jobApplication.jobDescription,
        jobApplication.companyName,
        jobApplication.resumeData,
      )

      setEditedCoverLetter(coverLetter)
      updateJobApplication({ coverLetter })
      setIsGenerating(false)
    } catch (err) {
      console.error("Error regenerating cover letter:", err)
      setError("Failed to regenerate the cover letter.")
      setIsGenerating(false)
    }
  }

  if (isGenerating) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center">Generating your personalized cover letter...</p>
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
        <div>
          <h3 className="font-medium mb-2">Cover Letter</h3>
          {jobApplication.resumeData && (
            <div className="mb-4 p-3 bg-muted/30 rounded-md">
              <p className="text-sm font-medium">Personalizing for:</p>
              <p className="text-xs text-muted-foreground">
                {jobApplication.resumeData.personalDetails.name} |
                {jobApplication.resumeData.experience[0]?.position || "Professional"} |
                {jobApplication.resumeData.experience[0]?.company || ""}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Applying to: {jobApplication.companyName}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-4">
            Your personalized cover letter has been generated with today's date and complete details. You can make
            additional edits below.
          </p>

          <Textarea
            value={editedCoverLetter}
            onChange={(e) => setEditedCoverLetter(e.target.value)}
            className="min-h-[400px]"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleRegenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              "Regenerate"
            )}
          </Button>
          <Button onClick={handleSaveChanges}>Next: Download Files</Button>
        </div>
      </CardContent>
    </Card>
  )
}

