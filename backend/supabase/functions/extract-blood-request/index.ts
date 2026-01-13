// @ts-ignore
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai"
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { text } = await req.json()

    // @ts-ignore
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })

    // 🤖 AI Prompt
    const prompt = `
    Role: Medical Emergency Assistant.
    Input Text: "${text}"

    Task: Extract blood request details.

    Output Format: JSON ONLY.
    {
      "blood_group": "A+/A-/B+/B-/O+/O-/AB+/AB- or null if not found",
      "location": "Hospital name or Area name or null",
      "urgency": "CRITICAL (if accident/operation/emergency) or NORMAL",
      "patient_note": "A polite and clear message for donors summarizing the need (max 20 words)."
    }
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim()

    return new Response(cleanedText, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})