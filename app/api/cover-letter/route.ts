import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // Validate request body
    if (!req.body) {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 })
    }

    const { optimizedResume, jobDescription, companyName, resumeData } = await req.json()

    // Validate required fields
    if (!optimizedResume || !jobDescription || !companyName) {
      return NextResponse.json(
        { error: "Optimized resume, job description, and company name are required" },
        { status: 400 },
      )
    }

    // Check if API key exists
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      console.error("GOOGLE_API_KEY is not set in environment variables")
      return NextResponse.json({ text: "Error: API key not configured" }, { status: 500 })
    }

    // Initialize the Google AI client
    const genAI = new GoogleGenerativeAI(apiKey)

    // Initialize the model with safety settings
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    // Get current date for the cover letter
    const today = new Date()
    const formattedDate = today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    // Build a more detailed prompt that includes personal details if available
    let prompt = `
      You are an expert cover letter writer.
      
      RESUME:
      ${optimizedResume}
      
      JOB DESCRIPTION:
      ${jobDescription}
      
      COMPANY NAME:
      ${companyName}
      
      TODAY'S DATE:
      ${formattedDate}
    `

    // Add structured resume data if available
    if (resumeData) {
      prompt += `

PERSONAL DETAILS:
- Name: ${resumeData.personalDetails.name}
- Email: ${resumeData.personalDetails.email}
- Phone: ${resumeData.personalDetails.phone}
- Location: ${resumeData.personalDetails.location}
- Current/Most Recent Position: ${resumeData.experience[0]?.position || "Not specified"}

RELEVANT EXPERIENCE HIGHLIGHTS:
${resumeData.experience
  .slice(0, 3)
  .map(
    (exp) => `
- ${exp.position} at ${exp.company} (${exp.duration}):
  ${exp.description
    .slice(0, 3)
    .map((desc) => `* ${desc}`)
    .join("\n")}
`,
  )
  .join("\n")}

KEY SKILLS RELEVANT TO THIS POSITION:
${resumeData.skills.join(", ")}

EDUCATION:
${resumeData.education.map((edu) => `- ${edu.degree} from ${edu.institution} (${edu.duration})`).join("\n")}
`
    }

    prompt += `

Write a highly personalized, professional cover letter for this job application that:
1. Addresses the specific company and position from the job description
2. Opens with a compelling introduction that mentions the company by name
3. Highlights the applicant's most relevant skills and experience for this specific role
4. Shows enthusiasm for the role and company with specific reasons
5. Demonstrates understanding of the job requirements and how the applicant meets them
6. References 2-3 specific achievements from the resume that are most relevant to this position
7. Includes a strong closing paragraph with a call to action
8. Uses the applicant's name and personal details appropriately
9. Explains specifically why the applicant is a good fit for the company culture and role
10. Is approximately 300-400 words with proper professional letter formatting

IMPORTANT FORMATTING REQUIREMENTS:
1. Use today's date (${formattedDate}) at the top of the letter, not a placeholder
2. If the hiring manager's name is not known, use "Hiring Manager" instead
3. Do not include a comma after the company name if there is no address
4. Format the letter with proper spacing, date, greeting, and signature
5. Do not include ANY placeholders like [Your Name] or [Position] - use the actual information from the resume data
6. If any information is missing, make a reasonable assumption rather than using a placeholder

Return only the complete, ready-to-use cover letter text with proper formatting.
`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return NextResponse.json({ text })
    } catch (generationError) {
      console.error("Error generating content:", generationError)
      return NextResponse.json({
        text: "Error generating cover letter. Please try again.",
      })
    }
  } catch (error) {
    console.error("Error in cover-letter route:", error)
    return NextResponse.json({
      text: "Error generating cover letter. Please try again.",
    })
  }
}

