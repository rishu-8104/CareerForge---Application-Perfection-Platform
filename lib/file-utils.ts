import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import type { ResumeData } from "./types"

// Make the cleanupResumeText function even more aggressive
export function cleanupResumeText(text: string): string {
  // More aggressive cleanup of asterisks
  // 1. Remove pairs of asterisks around words (e.g., **Summary** -> Summary)
  let cleanedText = text.replace(/\*\*([^*]+)\*\*/g, "$1")

  // 2. Remove asterisks at the beginning of lines
  cleanedText = cleanedText.replace(/^\s*\*+\s*/gm, "")

  // 3. Remove any remaining asterisks anywhere in the text
  cleanedText = cleanedText.replace(/\*/g, "")

  // 4. Double-check for any remaining asterisks (just to be sure)
  if (cleanedText.includes("*")) {
    cleanedText = cleanedText.replace(/\*/g, "")
  }

  return cleanedText
}

export async function extractTextFromPdf(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // If it's already a text file from pasted content, just return the content
      if (file.name === "pasted-resume.txt") {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            const text = event.target.result.toString()
            resolve(text)
          } else {
            reject(new Error("Failed to read file content"))
          }
        }
        reader.onerror = (event) => {
          reject(new Error("Failed to read the file"))
        }
        reader.readAsText(file)
        return
      }

      // Create a FileReader to read the actual file content
      const reader = new FileReader()

      reader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            throw new Error("Failed to read file content")
          }

          const fileContent = event.target.result

          // For PDF files, we need to extract text
          if (file.type === "application/pdf") {
            try {
              // Send the PDF content to our API for text extraction
              const response = await fetch("/api/extract-text", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  fileName: file.name,
                  fileType: file.type,
                  fileContent:
                    fileContent instanceof ArrayBuffer ? Array.from(new Uint8Array(fileContent)) : fileContent,
                }),
              })

              if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`API error (${response.status}): ${errorText}`)
              }

              const data = await response.json()

              if (data.error) {
                throw new Error(`API returned error: ${data.error}`)
              }

              // Clean up formatting artifacts like asterisks around section headings
              const cleanedText = cleanupResumeText(data.text)
              resolve(cleanedText)
            } catch (error) {
              console.error("Error extracting text from PDF:", error)
              reject(error instanceof Error ? error : new Error(String(error)))
            }
          } else {
            // For text files, we can use the content directly
            const text =
              typeof fileContent === "string"
                ? fileContent
                : new TextDecoder().decode(
                    fileContent instanceof ArrayBuffer
                      ? new Uint8Array(fileContent)
                      : new Uint8Array(Object.values(fileContent)),
                  )

            // Clean up formatting artifacts like asterisks around section headings
            const cleanedText = cleanupResumeText(text)
            resolve(cleanedText)
          }
        } catch (error) {
          console.error("Error in FileReader onload handler:", error)
          reject(error instanceof Error ? error : new Error(String(error)))
        }
      }

      reader.onerror = (event) => {
        console.error("FileReader error:", event)
        reject(new Error("Failed to read the file: " + (event.target?.error?.message || "Unknown error")))
      }

      // Read the file based on its type
      if (file.type === "text/plain") {
        reader.readAsText(file)
      } else {
        reader.readAsArrayBuffer(file)
      }
    } catch (error) {
      console.error("Error in extractTextFromPdf:", error)
      reject(error instanceof Error ? error : new Error(String(error)))
    }
  })
}

export async function parseResumeWithAI(resumeText: string): Promise<ResumeData> {
  // Additional cleanup before sending to AI
  resumeText = cleanupResumeText(resumeText)

  try {
    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error("Resume text is empty")
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch("/api/parse-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resumeText }),
      signal: controller.signal,
    }).catch((err) => {
      console.error("Fetch error:", err)
      throw new Error(`Fetch failed: ${err.message || "Unknown fetch error"}`)
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Could not read error response")
      console.error("API error response:", errorText)
      throw new Error(`API error (${response.status}): ${errorText}`)
    }

    const data = await response.json().catch((err) => {
      console.error("JSON parse error:", err)
      throw new Error(`Failed to parse JSON response: ${err.message}`)
    })

    if (data.error) {
      throw new Error(`API returned error: ${data.error}`)
    }

    // Validate the response structure
    if (!data.personalDetails) {
      console.error("Invalid data structure - missing personalDetails:", data)
      throw new Error("Invalid response structure: missing personalDetails")
    }

    return {
      personalDetails: {
        name: data.personalDetails.name || extractNameFallback(resumeText),
        email: data.personalDetails.email || extractEmailFallback(resumeText),
        phone: data.personalDetails.phone || extractPhoneFallback(resumeText),
        location: data.personalDetails.location || "",
        linkedIn: data.personalDetails.linkedIn || "",
        portfolio: data.personalDetails.portfolio || "",
        github: data.personalDetails.github || "",
      },
      experience: Array.isArray(data.experience) ? data.experience : [],
      education: Array.isArray(data.education) ? data.education : [],
      skills: Array.isArray(data.skills) ? data.skills : [],
      certifications: Array.isArray(data.certifications) ? data.certifications : [],
      rawText: resumeText,
    }
  } catch (error) {
    // Improved error logging
    console.error("Error parsing resume with AI:", error)

    // Return a fallback structure if parsing fails
    return {
      personalDetails: {
        name: extractNameFallback(resumeText),
        email: extractEmailFallback(resumeText),
        phone: extractPhoneFallback(resumeText),
        location: "",
        linkedIn: "",
        portfolio: "",
        github: "",
      },
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      rawText: resumeText,
    }
  }
}

// Fallback extraction functions for basic information if AI parsing fails
function extractNameFallback(text: string): string {
  // Simple heuristic: first line is often the name
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line)
  return lines[0] || "Unknown"
}

function extractEmailFallback(text: string): string {
  // Simple regex to find an email address
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  const match = text.match(emailRegex)
  return match ? match[0] : ""
}

function extractPhoneFallback(text: string): string {
  // Ultra-simplified phone regex that completely avoids parentheses
  const phoneRegex = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/
  const match = text.match(phoneRegex)
  return match ? match[0] : ""
}

export async function downloadAsPdf(content: string, fileName: string): Promise<void> {
  // Create a temporary div to render the content
  const tempDiv = document.createElement("div")
  tempDiv.style.padding = "20px"
  tempDiv.style.width = "8.5in"
  tempDiv.style.whiteSpace = "pre-wrap"
  tempDiv.style.fontFamily = "Arial, sans-serif"
  tempDiv.innerHTML = content.replace(/\n/g, "<br>")

  // Append to body but hide it
  tempDiv.style.position = "absolute"
  tempDiv.style.left = "-9999px"
  document.body.appendChild(tempDiv)

  try {
    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: "letter",
    })

    // Split content into pages if needed
    const pageHeight = pdf.internal.pageSize.getHeight()
    const pageWidth = pdf.internal.pageSize.getWidth()

    // Add content to PDF
    pdf.setFontSize(12)

    const splitText = pdf.splitTextToSize(content, pageWidth - 1)
    let currentY = 0.5

    splitText.forEach((line: string) => {
      if (currentY > pageHeight - 0.5) {
        pdf.addPage()
        currentY = 0.5
      }
      pdf.text(line, 0.5, currentY)
      currentY += 0.2
    })

    // Save PDF
    pdf.save(`${fileName}.pdf`)
  } finally {
    // Clean up
    document.body.removeChild(tempDiv)
  }
}

export async function downloadAsImage(content: string, fileName: string): Promise<void> {
  // Create a temporary div to render the content
  const tempDiv = document.createElement("div")
  tempDiv.style.padding = "20px"
  tempDiv.style.width = "800px"
  tempDiv.style.backgroundColor = "white"
  tempDiv.style.color = "black"
  tempDiv.style.whiteSpace = "pre-wrap"
  tempDiv.style.fontFamily = "Arial, sans-serif"
  tempDiv.innerHTML = content.replace(/\n/g, "<br>")

  // Append to body but hide it
  tempDiv.style.position = "absolute"
  tempDiv.style.left = "-9999px"
  document.body.appendChild(tempDiv)

  try {
    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: "white",
      scale: 2, // Higher resolution
    })

    // Convert to image and download
    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = image
    link.download = `${fileName}.png`
    link.click()
  } finally {
    // Clean up
    document.body.removeChild(tempDiv)
  }
}

