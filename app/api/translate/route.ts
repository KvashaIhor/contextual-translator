import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export const maxDuration = 300


function createSystemPrompt(inputLanguage: string, outputLanguage: string) {
  return `Translate the following **${inputLanguage}** text into a format for language learners.
- For each line of input, keep the original sentence.
- After each phrase or logical chunk, add the **${outputLanguage} translation in parentheses** immediately after it.
- Keep grammatical notes or meanings after a semicolon when useful.
- Preserve exact formatting and punctuation from the input. Do not merge or split lines.
- Example format (adapt to your language pair):
[Original phrase] ([translated phrase]) [next phrase] ([translated phrase])

Important guidelines:
1. Do not translate the entire sentence as one block
2. Break down into meaningful phrases or logical chunks
3. Add grammatical notes when helpful for learning
4. Preserve all formatting, punctuation, and line breaks
5. Do not add extra commentary or explanation
6. Focus on preserving structure and meaning for language learning

Translate each phrase naturally while maintaining the learning format.`
}


async function translateText(text: string, inputLanguage: string, outputLanguage: string) {
  const systemPrompt = createSystemPrompt(inputLanguage, outputLanguage)
  const { text: translatedText } = await generateText({
    model: openai("gpt-4o-mini"),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Please convert the following text:\n\n${text}` },
    ],
    temperature: 0.2,
  })
  return translatedText
}

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get("file") as File
  const sourceLanguage = formData.get("sourceLanguage") as string || "German"
  const targetLanguage = formData.get("targetLanguage") as string || "Ukrainian"

  if (!sourceLanguage || !targetLanguage) {
    return new Response(JSON.stringify({ error: "Source and target languages are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  if (sourceLanguage === targetLanguage) {
    return new Response(JSON.stringify({ error: "Source and target languages must be different" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  const text = await file.text()
  const lines = text.split("\n").filter((line) => line.trim() !== "")

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const translatedLines: string[] = []


      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const progress = {
          type: "progress",
          current: i + 1,
          total: lines.length,
          percentage: Math.round(((i + 1) / lines.length) * 100),
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(progress)}\n\n`))


        const cleanedLine = line.replace('\n', ' ')
        const translatedText = await translateText(cleanedLine, sourceLanguage, targetLanguage)

        const result = `${translatedText.replace('\n', ' ')}\n\n${cleanedLine}\n\n`
        translatedLines.push(result)


        const lineResult = {
          type: "line",
          index: i,
          original: cleanedLine,
          translated: translatedText,
          result: result,
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(lineResult)}\n\n`))
      }


      const completion = {
        type: "complete",
        fullText: translatedLines.join(""),
        totalLines: lines.length,
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(completion)}\n\n`))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
