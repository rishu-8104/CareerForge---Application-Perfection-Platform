import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // Validate request body
    if (!req.body) {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 })
    }

    let fileName, fileType, fileContent
    try {
      const body = await req.json()
      fileName = body.fileName
      fileType = body.fileType
      fileContent = body.fileContent
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Validate required fields
    if (!fileName || !fileType || !fileContent) {
      return NextResponse.json({ error: "File name, type, and content are required" }, { status: 400 })
    }

    // Check if API key exists
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Initialize the Google AI client
    const genAI = new GoogleGenerativeAI(apiKey)

    // Initialize the model with safety settings
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    // Convert array back to Uint8Array if needed
    let fileBytes
    if (Array.isArray(fileContent)) {
      fileBytes = new Uint8Array(fileContent)
    } else {
      // Handle string content
      fileBytes = new TextEncoder().encode(fileContent)
    }

    // Create a file part for the model
    const filePart = {
      inlineData: {
        data: Buffer.from(fileBytes).toString("base64"),
        mimeType: fileType,
      },
    }

    const prompt = `
You are an expert OCR system. Extract all text content from this document.

CRITICAL INSTRUCTION: The text contains formatting artifacts like asterisks (**) around section headings and at the beginning of lines.
YOU MUST COMPLETELY REMOVE ALL ASTERISKS (*) from the text. Do not preserve any asterisks in your output.

For example:
- "**Summary**" should become "Summary"
- "**Skills**" should become "Skills"
- Any line starting with asterisks should have them removed
- Any asterisks anywhere in the text must be removed

Return ONLY the extracted text with all asterisks removed, preserving the rest of the formatting.
Do not add any explanations, headers, or additional content.
`

    try {
      // Generate content with the file
      const result = await model.generateContent([prompt, filePart])
      const response = await result.response
      let text = response.text()

      // Additional cleanup to ensure all asterisks are removed - make this more aggressive
      text = text.replace(/\*/g, "")

      return NextResponse.json({ text })
    } catch (generationError) {
      return NextResponse.json(
        {
          error: "Failed to extract text from file",
          details: generationError instanceof Error ? generationError.message : "Unknown generation error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    // Return a structured error response
    return NextResponse.json(
      {
        error: "Failed to process file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

