import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // Validate request body
    if (!req.body) {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 })
    }

    const { resumeText, jobDescription, analysis, resumeData } = await req.json()

    // Validate required fields
    if (!resumeText || !jobDescription || !analysis) {
      return NextResponse.json({ error: "Resume text, job description, and analysis are required" }, { status: 400 })
    }

    // Check if API key exists
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ text: "Error: API key not configured" }, { status: 500 })
    }

    // Initialize the Google AI client
    const genAI = new GoogleGenerativeAI(apiKey)

    // Initialize the model with safety settings
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    // Build a more detailed prompt that includes personal details if available
    let prompt = `
    You are an expert resume writer with experience in optimizing resumes for ATS systems.
    
    ORIGINAL RESUME:
    ${resumeText}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    ANALYSIS:
    - ATS Score: ${analysis.score}/100
    - Keyword Match: ${analysis.keywordMatch}%
    - Missing Keywords: ${analysis.missingKeywords.join(", ")}
  `

    // Add structured resume data if available
    if (resumeData) {
      prompt += `

PERSONAL DETAILS:
- Name: ${resumeData.personalDetails.name}
- Email: ${resumeData.personalDetails.email}
- Phone: ${resumeData.personalDetails.phone}
- Location: ${resumeData.personalDetails.location}
${resumeData.personalDetails.linkedIn ? `- LinkedIn: ${resumeData.personalDetails.linkedIn}` : ""}

EXPERIENCE:
${resumeData.experience
  .map(
    (exp) => `
- Position: ${exp.position}
  Company: ${exp.company}
  Duration: ${exp.duration}
  Responsibilities:
  ${exp.description.map((desc) => `  * ${desc}`).join("\n")}
`,
  )
  .join("\n")}

EDUCATION:
${resumeData.education
  .map(
    (edu) => `
- Degree: ${edu.degree}
  Institution: ${edu.institution}
  Duration: ${edu.duration}
`,
  )
  .join("\n")}

SKILLS:
${resumeData.skills.join(", ")}
`
    }

    prompt += `

Please rewrite the resume to optimize it for this specific job description:
1. Incorporate the missing keywords naturally
2. Improve the structure and formatting
3. Highlight relevant experience and skills that match the job requirements
4. Use action verbs and quantifiable achievements
5. Maintain the same general information but optimize the presentation
6. Keep the personal details (name, contact information) intact
7. Ensure the resume is well-structured with clear sections
8. Tailor the experience descriptions to emphasize skills relevant to the job
9. Customize the skills section to prioritize skills mentioned in the job description
10. Maintain the applicant's voice and professional tone

CRITICAL INSTRUCTION: DO NOT use any asterisks (*) or other special formatting characters in your response. 
Return only the plain text optimized resume with no markdown formatting, no asterisks, and no special characters for formatting.
`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      let text = response.text()

      // Clean up any asterisks that might still be in the response
      text = text.replace(/\*/g, "")

      // Double check for any remaining asterisks
      if (text.includes("*")) {
        text = text.replace(/\*/g, "")
      }

      return NextResponse.json({ text })
    } catch (generationError) {
      return NextResponse.json({ text: resumeText })
    }
  } catch (error) {
    return NextResponse.json({ text: "Error optimizing resume. Please try again." })
  }
}

