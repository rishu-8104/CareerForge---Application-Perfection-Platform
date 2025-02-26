"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Loader2, PlusCircle, Trash2, Plus } from "lucide-react"
import type { JobApplication, ResumeData } from "@/lib/types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"

interface ResumeCreateProps {
  jobApplication: JobApplication
  updateJobApplication: (data: Partial<JobApplication>) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  setError: (error: string) => void
  resumeInputMethod: string
}

export default function ResumeCreate({
  jobApplication,
  updateJobApplication,
  isLoading,
  setIsLoading,
  setError,
  resumeInputMethod,
}: ResumeCreateProps) {
  // State for manual resume creation
  const [manualResumeData, setManualResumeData] = useState<ResumeData>({
    personalDetails: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedIn: "",
      portfolio: "",
      github: "",
    },
    experience: [
      {
        company: "",
        position: "",
        duration: "",
        description: [""],
      },
    ],
    education: [
      {
        institution: "",
        degree: "",
        duration: "",
      },
    ],
    skills: [""],
    certifications: [""],
    rawText: "",
  })

  // Helper function to generate raw text from manual resume data
  const generateRawTextFromManualData = (data: ResumeData): string => {
    let text = `${data.personalDetails.name}\n`

    if (data.personalDetails.email || data.personalDetails.phone || data.personalDetails.location) {
      text += `${data.personalDetails.email} | ${data.personalDetails.phone} | ${data.personalDetails.location}\n`
    }

    if (data.personalDetails.linkedIn || data.personalDetails.github || data.personalDetails.portfolio) {
      const links = []
      if (data.personalDetails.linkedIn) links.push(`LinkedIn: ${data.personalDetails.linkedIn}`)
      if (data.personalDetails.github) links.push(`GitHub: ${data.personalDetails.github}`)
      if (data.personalDetails.portfolio) links.push(`Portfolio: ${data.personalDetails.portfolio}`)
      text += `${links.join(" | ")}\n`
    }

    text += "\nEXPERIENCE\n"
    data.experience.forEach((exp) => {
      if (exp.position || exp.company) {
        text += `${exp.position} | ${exp.company} | ${exp.duration}\n`
        exp.description.forEach((desc) => {
          if (desc.trim()) {
            text += `- ${desc}\n`
          }
        })
        text += "\n"
      }
    })

    text += "EDUCATION\n"
    data.education.forEach((edu) => {
      if (edu.degree || edu.institution) {
        text += `${edu.degree} | ${edu.institution} | ${edu.duration}\n`
      }
    })

    text += "\nSKILLS\n"
    const filteredSkills = data.skills.filter((skill) => skill.trim())
    if (filteredSkills.length > 0) {
      text += filteredSkills.join(", ") + "\n"
    }

    if (data.certifications && data.certifications.some((cert) => cert.trim())) {
      text += "\nCERTIFICATIONS\n"
      const filteredCerts = data.certifications.filter((cert) => cert.trim())
      text += filteredCerts.join("\n") + "\n"
    }

    return text
  }

  const handleManualResumeSubmit = () => {
    try {
      setIsLoading(true)
      setError("")

      // Validate required fields
      if (!manualResumeData.personalDetails.name) {
        setError("Please enter your name")
        setIsLoading(false)
        return
      }

      if (!manualResumeData.personalDetails.email) {
        setError("Please enter your email")
        setIsLoading(false)
        return
      }

      // Generate raw text from the structured data
      const rawText = generateRawTextFromManualData(manualResumeData)

      // Create a virtual file for consistency with the rest of the application
      const resumeFile = new File([rawText], "manual-resume.txt", { type: "text/plain" })

      // Update the resume data with the raw text
      const updatedResumeData = {
        ...manualResumeData,
        rawText,
      }

      // Update the application state
      updateJobApplication({
        resumeFile,
        resumeText: rawText,
        resumeData: updatedResumeData,
      })

      setIsLoading(false)
    } catch (err) {
      setError(`Failed to process the manual resume: ${err instanceof Error ? err.message : "Unknown error"}`)
      setIsLoading(false)
    }
  }

  // Helper functions to update manual resume data
  const updatePersonalDetails = (field: string, value: string) => {
    setManualResumeData((prev) => ({
      ...prev,
      personalDetails: {
        ...prev.personalDetails,
        [field]: value,
      },
    }))
  }

  const updateExperience = (index: number, field: string, value: string | string[]) => {
    setManualResumeData((prev) => {
      const newExperience = [...prev.experience]
      newExperience[index] = {
        ...newExperience[index],
        [field]: value,
      }
      return {
        ...prev,
        experience: newExperience,
      }
    })
  }

  const updateExperienceDescription = (expIndex: number, descIndex: number, value: string) => {
    setManualResumeData((prev) => {
      const newExperience = [...prev.experience]
      const newDescriptions = [...newExperience[expIndex].description]
      newDescriptions[descIndex] = value
      newExperience[expIndex] = {
        ...newExperience[expIndex],
        description: newDescriptions,
      }
      return {
        ...prev,
        experience: newExperience,
      }
    })
  }

  const addExperienceDescription = (expIndex: number) => {
    setManualResumeData((prev) => {
      const newExperience = [...prev.experience]
      newExperience[expIndex] = {
        ...newExperience[expIndex],
        description: [...newExperience[expIndex].description, ""],
      }
      return {
        ...prev,
        experience: newExperience,
      }
    })
  }

  const removeExperienceDescription = (expIndex: number, descIndex: number) => {
    setManualResumeData((prev) => {
      const newExperience = [...prev.experience]
      const newDescriptions = newExperience[expIndex].description.filter((_, i) => i !== descIndex)
      newExperience[expIndex] = {
        ...newExperience[expIndex],
        description: newDescriptions.length > 0 ? newDescriptions : [""],
      }
      return {
        ...prev,
        experience: newExperience,
      }
    })
  }

  const addExperience = () => {
    setManualResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: "",
          position: "",
          duration: "",
          description: [""],
        },
      ],
    }))
  }

  const removeExperience = (index: number) => {
    setManualResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }))
  }

  const updateEducation = (index: number, field: string, value: string) => {
    setManualResumeData((prev) => {
      const newEducation = [...prev.education]
      newEducation[index] = {
        ...newEducation[index],
        [field]: value,
      }
      return {
        ...prev,
        education: newEducation,
      }
    })
  }

  const addEducation = () => {
    setManualResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: "",
          degree: "",
          duration: "",
        },
      ],
    }))
  }

  const removeEducation = (index: number) => {
    setManualResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
  }

  const updateSkills = (value: string) => {
    const skillsArray = value.split(",").map((skill) => skill.trim())
    setManualResumeData((prev) => ({
      ...prev,
      skills: skillsArray,
    }))
  }

  const updateCertifications = (value: string) => {
    const certsArray = value
      .split("\n")
      .map((cert) => cert.trim())
      .filter((cert) => cert)
    setManualResumeData((prev) => ({
      ...prev,
      certifications: certsArray.length > 0 ? certsArray : [""],
    }))
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-2 bg-blue-50 border border-blue-200 rounded-md"
      >
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ x: 3 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <p className="text-xs text-blue-700 font-medium">No Resume?</p>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-blue-700 mt-1"
        >
          Fill in the form below to create your resume from scratch. All fields with * are required.
        </motion.p>
      </motion.div>

      {isLoading && resumeInputMethod === "manual" ? (
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Processing your information...</p>
        </div>
      ) : jobApplication.resumeFile && jobApplication.resumeFile.name === "manual-resume.txt" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="p-3 bg-muted/30 rounded text-left"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-medium"
          >
            Resume created successfully
          </motion.p>
          {jobApplication.resumeData && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.3,
                  },
                },
              }}
            >
              <motion.p
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="text-xs text-muted-foreground mt-2"
              >
                Name: {jobApplication.resumeData.personalDetails.name}
              </motion.p>
              <motion.p
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="text-xs text-muted-foreground"
              >
                Experience: {jobApplication.resumeData.experience.length} positions
              </motion.p>
              <motion.p
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="text-xs text-muted-foreground"
              >
                Skills: {jobApplication.resumeData.skills.length} skills
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
            <AccordionItem value="personal" className="border-b">
              <AccordionTrigger>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                  Personal Details
                </motion.div>
              </AccordionTrigger>
              <AccordionContent>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={manualResumeData.personalDetails.name}
                        onChange={(e) => updatePersonalDetails("name", e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={manualResumeData.personalDetails.email}
                        onChange={(e) => updatePersonalDetails("email", e.target.value)}
                        placeholder="john.doe@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={manualResumeData.personalDetails.phone}
                        onChange={(e) => updatePersonalDetails("phone", e.target.value)}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={manualResumeData.personalDetails.location}
                        onChange={(e) => updatePersonalDetails("location", e.target.value)}
                        placeholder="City, State, Country"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn URL</Label>
                      <Input
                        id="linkedin"
                        value={manualResumeData.personalDetails.linkedIn}
                        onChange={(e) => updatePersonalDetails("linkedIn", e.target.value)}
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub URL</Label>
                      <Input
                        id="github"
                        value={manualResumeData.personalDetails.github}
                        onChange={(e) => updatePersonalDetails("github", e.target.value)}
                        placeholder="github.com/johndoe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="portfolio">Portfolio URL</Label>
                      <Input
                        id="portfolio"
                        value={manualResumeData.personalDetails.portfolio}
                        onChange={(e) => updatePersonalDetails("portfolio", e.target.value)}
                        placeholder="johndoe.com"
                      />
                    </div>
                  </div>
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="mt-2"
          >
            <AccordionItem value="experience" className="border-b">
              <AccordionTrigger>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                  Work Experience
                </motion.div>
              </AccordionTrigger>
              <AccordionContent>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-6">
                    {manualResumeData.experience.map((exp, expIndex) => (
                      <div key={expIndex} className="p-4 border rounded-md relative">
                        {manualResumeData.experience.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 text-destructive"
                            onClick={() => removeExperience(expIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`position-${expIndex}`}>Position/Title</Label>
                              <Input
                                id={`position-${expIndex}`}
                                value={exp.position}
                                onChange={(e) => updateExperience(expIndex, "position", e.target.value)}
                                placeholder="Software Engineer"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`company-${expIndex}`}>Company</Label>
                              <Input
                                id={`company-${expIndex}`}
                                value={exp.company}
                                onChange={(e) => updateExperience(expIndex, "company", e.target.value)}
                                placeholder="Acme Inc."
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`duration-${expIndex}`}>Duration</Label>
                            <Input
                              id={`duration-${expIndex}`}
                              value={exp.duration}
                              onChange={(e) => updateExperience(expIndex, "duration", e.target.value)}
                              placeholder="Jan 2020 - Present"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Responsibilities & Achievements</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => addExperienceDescription(expIndex)}
                              >
                                <Plus className="h-3 w-3 mr-1" /> Add
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {exp.description.map((desc, descIndex) => (
                                <div key={descIndex} className="flex items-center gap-2">
                                  <Input
                                    value={desc}
                                    onChange={(e) => updateExperienceDescription(expIndex, descIndex, e.target.value)}
                                    placeholder="Developed and maintained web applications"
                                  />
                                  {exp.description.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive flex-shrink-0"
                                      onClick={() => removeExperienceDescription(expIndex, descIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full" onClick={addExperience}>
                      <Plus className="h-4 w-4 mr-2" /> Add Another Position
                    </Button>
                  </div>
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="mt-2"
          >
            <AccordionItem value="education" className="border-b">
              <AccordionTrigger>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                  Education
                </motion.div>
              </AccordionTrigger>
              <AccordionContent>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-6">
                    {manualResumeData.education.map((edu, eduIndex) => (
                      <div key={eduIndex} className="p-4 border rounded-md relative">
                        {manualResumeData.education.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 text-destructive"
                            onClick={() => removeEducation(eduIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`degree-${eduIndex}`}>Degree/Certificate</Label>
                              <Input
                                id={`degree-${eduIndex}`}
                                value={edu.degree}
                                onChange={(e) => updateEducation(eduIndex, "degree", e.target.value)}
                                placeholder="Bachelor of Science in Computer Science"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`institution-${eduIndex}`}>Institution</Label>
                              <Input
                                id={`institution-${eduIndex}`}
                                value={edu.institution}
                                onChange={(e) => updateEducation(eduIndex, "institution", e.target.value)}
                                placeholder="University of Technology"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`edu-duration-${eduIndex}`}>Duration</Label>
                            <Input
                              id={`edu-duration-${eduIndex}`}
                              value={edu.duration}
                              onChange={(e) => updateEducation(eduIndex, "duration", e.target.value)}
                              placeholder="2016 - 2020"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full" onClick={addEducation}>
                      <Plus className="h-4 w-4 mr-2" /> Add Another Education
                    </Button>
                  </div>
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="mt-2"
          >
            <AccordionItem value="skills" className="border-b">
              <AccordionTrigger>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                  Skills
                </motion.div>
              </AccordionTrigger>
              <AccordionContent>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills (comma separated)</Label>
                      <Textarea
                        id="skills"
                        value={manualResumeData.skills.join(", ")}
                        onChange={(e) => updateSkills(e.target.value)}
                        placeholder="JavaScript, React, Node.js, TypeScript, HTML, CSS"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="mt-2"
          >
            <AccordionItem value="certifications">
              <AccordionTrigger>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                  Certifications
                </motion.div>
              </AccordionTrigger>
              <AccordionContent>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="certifications">Certifications (one per line)</Label>
                      <Textarea
                        id="certifications"
                        value={manualResumeData.certifications.join("\n")}
                        onChange={(e) => updateCertifications(e.target.value)}
                        placeholder="AWS Certified Developer
Google Cloud Professional
Microsoft Certified: Azure Developer"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        </Accordion>
      )}

      {jobApplication.resumeFile?.name !== "manual-resume.txt" && (
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            type="button"
            onClick={handleManualResumeSubmit}
            disabled={isLoading || !manualResumeData.personalDetails.name || !manualResumeData.personalDetails.email}
            className="w-full"
          >
            <motion.div
              className="flex items-center"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Resume
            </motion.div>
          </Button>
        </motion.div>
      )}
    </div>
  )
}

