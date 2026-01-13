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
    const { symptoms, location } = await req.json()
    const userLocation = location || "Dhaka, Bangladesh"

    // @ts-ignore
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    // @ts-ignore
    const serperKey = Deno.env.get('SERPER_API_KEY')

    if (!apiKey || !serperKey) throw new Error('Missing API keys!')

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })

    // 🔥 UPDATE: Prompt এ 'potential_causes' চাওয়া হয়েছে
    const prompt = `
    Role: Professional Medical Triage Nurse.
    Input Symptoms: "${symptoms}"

    Task: Analyze symptoms. Provide possible condition, list of potential causes, urgency, specialist, and advice.

    Output Format: JSON ONLY.
    {
      "condition": "Brief condition name (e.g. Migraine)",
      "potential_causes": ["Cause 1", "Cause 2", "Cause 3"],
      "specialty": "Medical Specialty Name (e.g. Neurologist)",
      "urgency": "HIGH/MEDIUM/LOW",
      "advice": "Immediate advice",
      "search_query": "Keyword to search doctor (e.g. Best Neurologist)"
    }
    `
    // "potential_causes" হলো একটি অ্যারে (Array/List)

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const aiData = JSON.parse(cleanedText)

    // Google Search (Serper API) - আগের মতোই
    const searchQuery = `${aiData.search_query} in ${userLocation}`

    const searchResponse = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: searchQuery })
    })

    const searchData = await searchResponse.json()

    const finalResponse = {
      ...aiData,
      internet_doctors: searchData.places || []
    }

    return new Response(JSON.stringify(finalResponse), {
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