import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    if (!req.body) {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 })
    }

    let resumeText
    try {
      const body = await req.json()
      resumeText = body.resumeText

      resumeText = resumeText.replace(/\*/g, "")
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    if (!resumeText) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    const prompt = `
  You are an expert resume parser. Extract structured information from the following resume text.
  
  RESUME TEXT:
  ${resumeText}
  
  CRITICAL INSTRUCTION: The resume text may contain formatting artifacts like asterisks (**) around section headings or anywhere in the text.
  You MUST completely ignore these formatting artifacts and extract only the clean content.
  
  Extract and return ONLY a JSON object with the following structure:
  {
    "personalDetails": {
      "name": "Full name of the person",
      "email": "Email address",
      "phone": "Phone number",
      "location": "City, State/Province, Country",
      "linkedIn": "LinkedIn URL if available",
      "portfolio": "Website URL if available",
      "github": "GitHub URL if available"
    },
    "experience": [
      {
        "position": "Job title",
        "company": "Company name",
        "location": "Job location if available",
        "duration": "Employment period",
        "description": ["Achievement/responsibility 1", "Achievement/responsibility 2", ...]
      },
      ...
    ],
    "education": [
      {
        "degree": "Degree name",
        "institution": "Institution name",
        "duration": "Study period"
      },
      ...
    ],
    "skills": ["Skill 1", "Skill 2", ...],
    "certifications": ["Certification 1", "Certification 2", ...]
  }
  
  If any field is not found in the resume, use an empty string for string fields or empty arrays for array fields.
  Do not include any explanations or markdown formatting in your response, just the JSON object.
`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      try {
        let cleanedText = text
        cleanedText = cleanedText.replace(/```json\s*/g, "").replace(/```\s*$/g, "")

        cleanedText = cleanedText.replace(/\*/g, "")

        const jsonResponse = JSON.parse(cleanedText)

        if (!jsonResponse.personalDetails) {
          throw new Error("Invalid response structure from AI model: missing personalDetails")
        }

        return NextResponse.json(jsonResponse)
      } catch (parseError) {
        return NextResponse.json({
          error: "Failed to parse resume data",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
          personalDetails: {
            name: "",
            email: "",
            phone: "",
            location: "",
            linkedIn: "",
            portfolio: "",
          },
          experience: [],
          education: [],
          skills: [],
        })
      }
    } catch (generationError) {
      return NextResponse.json({
        error: "Failed to extract resume data",
        details: generationError instanceof Error ? generationError.message : "Unknown generation error",
        personalDetails: {
          name: "",
          email: "",
          phone: "",
          location: "",
          linkedIn: "",
          portfolio: "",
        },
        experience: [],
        education: [],
        skills: [],
      })
    }
  } catch (error) {
    return NextResponse.json({
      error: "Failed to process resume",
      details: error instanceof Error ? error.message : "Unknown error",
      personalDetails: {
        name: "",
        email: "",
        phone: "",
        location: "",
        linkedIn: "",
        portfolio: "",
      },
      experience: [],
      education: [],
      skills: [],
    })
  }
}

