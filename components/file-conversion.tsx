"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { JobApplication } from "@/lib/types"
import { downloadAsPdf, downloadAsImage } from "@/lib/file-utils"
import { FileText, Image, Download, Check } from "lucide-react"

interface FileConversionProps {
  jobApplication: JobApplication
}

export default function FileConversion({ jobApplication }: FileConversionProps) {
  const [activeTab, setActiveTab] = useState("resume")
  const [downloadStatus, setDownloadStatus] = useState<{
    resume: { pdf: boolean; image: boolean }
    coverLetter: { pdf: boolean; image: boolean }
  }>({
    resume: { pdf: false, image: false },
    coverLetter: { pdf: false, image: false },
  })

  const handleDownload = async (type: "resume" | "coverLetter", format: "pdf" | "image") => {
    try {
      const content = type === "resume" ? jobApplication.optimizedResume : jobApplication.coverLetter
      const fileName =
        type === "resume"
          ? `${jobApplication.companyName.replace(/\s+/g, "_")}_Resume`
          : `${jobApplication.companyName.replace(/\s+/g, "_")}_Cover_Letter`

      if (format === "pdf") {
        await downloadAsPdf(content, fileName)
      } else {
        await downloadAsImage(content, fileName)
      }

      setDownloadStatus((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [format]: true,
        },
      }))

      // Reset the status after 2 seconds
      setTimeout(() => {
        setDownloadStatus((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            [format]: false,
          },
        }))
      }, 2000)
    } catch (error) {
      console.error(`Error downloading ${type} as ${format}:`, error)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="coverLetter">Cover Letter</TabsTrigger>
          </TabsList>

          <TabsContent value="resume" className="space-y-4">
            <div className="border rounded-md p-4 bg-muted/30">
              <pre className="whitespace-pre-wrap text-sm">{jobApplication.optimizedResume}</pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => handleDownload("resume", "pdf")} className="flex-1" variant="outline">
                {downloadStatus.resume.pdf ? <Check className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                Download as PDF
              </Button>

              <Button onClick={() => handleDownload("resume", "image")} className="flex-1" variant="outline">
                {downloadStatus.resume.image ? <Check className="mr-2 h-4 w-4" /> : <Image className="mr-2 h-4 w-4" />}
                Download as Image
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="coverLetter" className="space-y-4">
            <div className="border rounded-md p-4 bg-muted/30">
              <pre className="whitespace-pre-wrap text-sm">{jobApplication.coverLetter}</pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => handleDownload("coverLetter", "pdf")} className="flex-1" variant="outline">
                {downloadStatus.coverLetter.pdf ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Download as PDF
              </Button>

              <Button onClick={() => handleDownload("coverLetter", "image")} className="flex-1" variant="outline">
                {downloadStatus.coverLetter.image ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Image className="mr-2 h-4 w-4" />
                )}
                Download as Image
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center">
          <Button onClick={() => window.location.reload()} variant="default" className="w-full max-w-xs">
            <Download className="mr-2 h-4 w-4" />
            Start New Application
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

