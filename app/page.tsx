"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, FileText, Loader2, Languages } from "lucide-react"
import { config } from "@/lib/config"

interface TranslationProgress {
  current: number
  total: number
  percentage: number
  eta?: string
}

interface TranslationLine {
  index: number
  original: string
  translated: string
  result: string
}

const FLASK_URL = config.apiUrl 


const LANGUAGES = [
  { code: "English", name: "English" },
  { code: "Spanish", name: "Spanish (Español)" },
  { code: "French", name: "French (Français)" },
  { code: "German", name: "German (Deutsch)" },
  { code: "Italian", name: "Italian (Italiano)" },
  { code: "Portuguese", name: "Portuguese (Português)" },
  { code: "Russian", name: "Russian (Русский)" },
  { code: "Ukrainian", name: "Ukrainian (Українська)" },
  { code: "Polish", name: "Polish (Polski)" },
  { code: "Dutch", name: "Dutch (Nederlands)" },
  { code: "Swedish", name: "Swedish (Svenska)" },
  { code: "Norwegian", name: "Norwegian (Norsk)" },
  { code: "Danish", name: "Danish (Dansk)" },
  { code: "Finnish", name: "Finnish (Suomi)" },
  { code: "Japanese", name: "Japanese (日本語)" },
  { code: "Korean", name: "Korean (한국어)" },
  { code: "Chinese", name: "Chinese (中文)" },
  { code: "Arabic", name: "Arabic (العربية)" },
  { code: "Hindi", name: "Hindi (हिन्दी)" },
  { code: "Turkish", name: "Turkish (Türkçe)" },
]

export default function TranslationApp() {
  const [file, setFile] = useState<File | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [progress, setProgress] = useState<TranslationProgress>({ current: 0, total: 0, percentage: 0 })
  const [translatedLines, setTranslatedLines] = useState<TranslationLine[]>([])
  const [fullTranslation, setFullTranslation] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [sourceLanguage, setSourceLanguage] = useState<string>("German")
  const [targetLanguage, setTargetLanguage] = useState<string>("Ukrainian")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSwapLanguages = () => {
    const temp = sourceLanguage
    setSourceLanguage(targetLanguage)
    setTargetLanguage(temp)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/plain") {
      setFile(selectedFile)
      setError("")

      setTranslatedLines([])
      setFullTranslation("")
      setProgress({ current: 0, total: 0, percentage: 0 })
    } else {
      setError("Please select a valid .txt file")
    }
  }

  const handleTranslate = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    if (!sourceLanguage || !targetLanguage) {
      setError("Please select both source and target languages")
      return
    }

    if (sourceLanguage === targetLanguage) {
      setError("Source and target languages must be different")
      return
    }

    setIsTranslating(true)
    setError("")
    setTranslatedLines([])
    setFullTranslation("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("sourceLanguage", sourceLanguage)
      formData.append("targetLanguage", targetLanguage)

      const response = await fetch(`${FLASK_URL}/translate`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        if (response.status === 0 || !response.status) {
          throw new Error(`Cannot connect to Flask server. Make sure it's running on ${FLASK_URL}`)
        }
        throw new Error("Translation request failed")
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response stream")
      }

      const decoder = new TextDecoder()
      const lines: TranslationLine[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const dataLines = chunk.split("\n").filter((line) => line.startsWith("data: "))

        for (const dataLine of dataLines) {
          try {
            const jsonStr = dataLine.replace("data: ", "")
            const data = JSON.parse(jsonStr)

            switch (data.type) {
              case "progress":
                setProgress({
                  current: data.current,
                  total: data.total,
                  percentage: data.percentage,
                  eta: data.eta,
                })
                break

              case "line":
                const newLine: TranslationLine = {
                  index: data.index,
                  original: data.original,
                  translated: data.translated,
                  result: data.result,
                }
                lines.push(newLine)
                setTranslatedLines([...lines])
                break

              case "complete":
                setFullTranslation(data.fullText)
                break

              case "error":
                setError(data.message)
                break
            }
          } catch (parseError) {
            console.error("Error parsing SSE data:", parseError)
          }
        }
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Cannot connect to Flask server. Make sure it's running: python flask_api.py")
      } else {
        setError(err instanceof Error ? err.message : "Translation failed")
      }
    } finally {
      setIsTranslating(false)
    }
  }

  const handleDownload = () => {
    if (!fullTranslation) return

    const blob = new Blob([fullTranslation], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = file ? `translated_${file.name}` : "translation.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetApp = () => {
    setFile(null)
    setTranslatedLines([])
    setFullTranslation("")
    setProgress({ current: 0, total: 0, percentage: 0 })
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <Languages className="w-8 h-8 inline mr-2" />
            Universal Language Learner
          </h1>
          <p className="text-lg text-gray-600">Intelligent Translation Tool for Language Learning</p>
        </div>


        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Language Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">From (Source Language)</label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              

              <div className="flex justify-center md:justify-start md:order-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwapLanguages}
                  className="mb-2 px-3 py-2 rounded-full"
                  title="Swap languages"
                >
                  ⇄
                </Button>
              </div>
              
              <div className="space-y-2 md:order-2">
                <label className="text-sm font-medium text-gray-700">To (Target Language)</label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Text File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input ref={fileInputRef} type="file" accept=".txt" onChange={handleFileSelect} className="flex-1" />
              <Button onClick={handleTranslate} disabled={!file || isTranslating || !sourceLanguage || !targetLanguage} className="min-w-[120px]">
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Translating
                  </>
                ) : (
                  "Start Translation"
                )}
              </Button>
              {(translatedLines.length > 0 || fullTranslation) && (
                <Button variant="outline" onClick={resetApp}>
                  Reset
                </Button>
              )}
            </div>

            {file && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
          </CardContent>
        </Card>


        {isTranslating && (
          <Card>
            <CardHeader>
              <CardTitle>Translation Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Processing line {progress.current} of {progress.total}
                  </span>
                  <span>
                    {progress.percentage}% {progress.eta && `(ETA: ${progress.eta})`}
                  </span>
                </div>
                <Progress value={progress.percentage} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}


        {translatedLines.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <Card>
              <CardHeader>
                <CardTitle>Translation Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto space-y-4">
                  {translatedLines.map((line, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="text-sm text-gray-500 mb-1">Line {line.index + 1}</div>
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Original:</strong> {line.original}
                      </div>
                      <div className="text-sm text-blue-700">
                        <strong>Translated:</strong> {line.translated}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Full Translation
                  {fullTranslation && (
                    <Button onClick={handleDownload} size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={fullTranslation || translatedLines.map((line) => line.result).join("")}
                  readOnly
                  className="h-96 text-sm font-mono"
                  placeholder="Full translation will appear here..."
                />
              </CardContent>
            </Card>
          </div>
        )}


        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>
                Start your Flask server: <code className="bg-gray-100 px-2 py-1 rounded">python flask_api.py</code>
              </li>
              <li>Select a German text file (.txt format) using the file input</li>
              <li>Click "Start Translation" to begin the translation process</li>
              <li>Watch the progress bar and live translation feed as each line is processed</li>
              <li>Once complete, download the translated file with Ukrainian translations in parentheses</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
