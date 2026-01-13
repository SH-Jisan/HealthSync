// @ts-ignore
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai"
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS Handle
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. ইনপুট ডাটা গ্রহণ
    const { history, language } = await req.json()

    // @ts-ignore
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('Missing GEMINI_API_KEY')
    }

    // 2. AI Client Initialize (SDK ব্যবহার করে)
    const genAI = new GoogleGenerativeAI(apiKey)

    // 🔥 Model Selection: 'gemini-1.5-flash' is faster and more reliable.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })

    // 3. Language Selection
    const isBangla = language === 'bangla'
    const langInstruction = isBangla
      ? "Provide the response strictly in BENGALI language."
      : "Provide the response strictly in ENGLISH language."

    // 4. Smart Prompt
    const prompt = `
    Role: Expert AI Medical Assistant & Nutritionist.
    Task: Analyze the patient's medical history and create a personalized daily health routine.

    Patient Medical History (Latest Events):
    ${JSON.stringify(history)}

    Instructions:
    1. Analyze the 'severity', 'event_type', and 'summary' of the provided events.
    2. Create a routine including Diet, Exercise, and Precautions based on these conditions.
    3. ${langInstruction}
    4. Ensure 'diet', 'exercise', and 'precautions' are SIMPLE STRINGS (semicolon or newline separated if needed). Do NOT use nested arrays or objects.

    Output JSON format (Strictly JSON, no Markdown):
    {
      "summary": "Short analysis of current health status based on history",
      "diet": "Specific food advice (what to eat and what to avoid) as a single string",
      "exercise": "Safe exercises suitable for their condition as a single string",
      "precautions": "Critical warnings or lifestyle changes as a single string"
    }
    `

    // 5. AI Call
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // 6. Cleaning Response (Markdown removal)
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const aiData = JSON.parse(cleanedText)

    // 7. Response Return
    return new Response(JSON.stringify(aiData), {
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