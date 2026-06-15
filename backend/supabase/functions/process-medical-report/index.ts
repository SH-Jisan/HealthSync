// File: HealthSync/backend/supabase/functions/process-medical-report/index.ts

/* @ts-ignore */
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai"
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS Handle
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. Input Parsing
    const { imageBase64, mimeType, reportText, patient_id, uploader_id, file_url, file_hash, file_path } = await req.json()

    // @ts-ignore
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables!')
    }

    // 2. Initialize Clients
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 🛑 3. DUPLICATE CHECK (Based on Hash)
    if (file_hash) {
      const { data: duplicates } = await supabase
          .from('medical_events')
          .select('id')
          .eq('patient_id', patient_id)
          .eq('file_hash', file_hash)

      if (duplicates && duplicates.length > 0) {
        // ডুপ্লিকেট হলে স্টোরেজ থেকে ফাইল ক্লিন করা
        if (file_path) {
          await supabase.storage.from('reports').remove([file_path])
        }
        return new Response(JSON.stringify({ error: "Duplicate File: This report has already been uploaded." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409,
        })
      }
    }

    // 4. AI Configuration
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) // বা "gemini-1.5-pro" যদি আপনার এক্সেস থাকে

    // 5. YOUR NEW ENHANCED PROMPT
    const prompt = `
    Role: You are an Expert Medical AI Assistant with strong OCR, clinical reasoning, and bilingual explanation skills.

Primary Objective:
Accurately read, understand, and analyze medical documents (reports or prescriptions) from image or text input, with zero hallucination.

Step-by-step Tasks:

1. OCR & TEXT EXTRACTION:
   - Extract every single visible word, number, symbol, heading, footer, stamp, handwriting (if readable).
   - Preserve original spelling, line breaks, units, and formatting as closely as possible.
   - Do NOT guess missing or unclear text. If unreadable, write "[illegible]".

2. DOCUMENT CLASSIFICATION:
   - Identify the document type strictly as:
     - "REPORT" (lab tests, investigations, imaging, pathology, etc.)
     - "PRESCRIPTION" (medicines, dosage, doctor advice)
   - If mixed, choose the dominant type.

3. MEDICAL ANALYSIS (Three Levels):

   a) Simple, Easy-to-understand explanation:
      - Written for a normal non-medical person.
      - Explain clearly:
        • What this document is about
        • What important results were found
        • Whether the situation looks GOOD / OKAY / NEEDS ATTENTION
        • What general next steps should be taken

   b) Detailed, Professional analysis:
      - Use correct medical terminology.
      - Explain abnormal values with:
        • Normal reference range
        • Possible clinical meaning
      - Highlight red flags if any.
      - Use structured Markdown (bullet points, **bold headings**).
      - Do NOT make a confirmed diagnosis.

   c) Disease / Condition Insight (ONLY if evidence suggests one):
      - Identify the most likely disease or medical condition suggested by the data.
      - If evidence is insufficient, clearly say:
        "No specific disease can be confidently identified from this document alone."

      - For identified disease/condition, explain:
        • Disease name (medical term)
        • Local / common Bangla name
        • Primary causes
        • Common symptoms that patients may experience
        • Whether this is acute, chronic, mild, or serious

4. BILINGUAL OUTPUT:
   - Provide ALL explanations in both:
     - English
     - Bengali (Bangla, simple and natural language)

5. SAFETY & VALIDATION RULES:
   - Do NOT invent diseases, values, or medicines.
   - Do NOT over-diagnose from limited data.
   - If multiple diseases are possible, list them as "Possible conditions".
   - Clearly state when doctor consultation is required.
   - For prescriptions:
     • Check drug interactions, overdose risk, and age safety.
   - For reports:
     • Medicine safety check must be "N/A".

6. SEVERITY GRADING LOGIC:
   - HIGH: Life-threatening, critical abnormal findings.
   - MEDIUM: Abnormal findings needing medical follow-up.
   - LOW: Normal or minor deviations.

Final Output:
Return ONLY valid JSON (no explanations, no markdown fences outside text fields).

JSON Structure:
{
  "title": "Short descriptive title (e.g., CBC Report / Prescription by Dr. X)",
  "event_type": "REPORT or PRESCRIPTION",
  "event_date": "YYYY-MM-DD (If not found, use today's date)",
  "severity": "HIGH / MEDIUM / LOW",

  "simple_explanation_en": "A simple, easy-to-understand explanation for a general person.",
  "simple_explanation_bn": "সাধারণ মানুষের বোঝার মতো সহজ ব্যাখ্যা।",

  "detailed_analysis_en": "Professional medical analysis in Markdown.",
  "detailed_analysis_bn": "Markdown ফরম্যাটে বাংলায় বিস্তারিত মেডিকেল বিশ্লেষণ।",

  "disease_insight_en": "Disease/condition name, causes, symptoms, and seriousness OR clear statement if not identifiable.",
  "disease_insight_bn": "রোগের নাম, স্থানীয় নাম, কারণ, সম্ভাব্য উপসর্গ এবং গুরুত্ব—অথবা রোগ নির্ধারণ সম্ভব নয় এমন স্পষ্ট বক্তব্য।",

  "extracted_text": "Complete extracted OCR text.",
  "key_findings": ["Key values with status"],
  "medicine_safety_check": "Safe / Caution / Danger / N/A"
}`

    // 6. Generate Content
    let generatedContent;
    if (imageBase64) {
      // Image Processing
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" } },
      ])
      generatedContent = result.response.text()
    } else {
      // Text Processing (Fallback)
      const result = await model.generateContent([prompt, `DOCUMENT CONTENT: ${reportText}`])
      generatedContent = result.response.text()
    }

    // 7. Clean and Parse JSON
    const cleanedText = generatedContent.replace(/```json/g, '').replace(/```/g, '').trim()
    let aiData;
    try {
      aiData = JSON.parse(cleanedText)
    } catch (e) {
      console.error("JSON Parse Error:", cleanedText)
      throw new Error("Failed to parse AI response")
    }

    // 8. Prepare Data
    const newTitle = aiData['title'] || 'Medical Document'
    const rawDate = aiData['event_date']
    // Date Validation
    const newDate = (rawDate && rawDate.match(/^\d{4}-\d{2}-\d{2}$/))
        ? rawDate
        : new Date().toISOString().split('T')[0]

    // 9. Database Insert
    const { error: insertError } = await supabase
        .from('medical_events')
        .insert({
          patient_id: patient_id,
          uploader_id: uploader_id,
          title: newTitle,
          event_type: aiData['event_type'] ?? 'REPORT',
          event_date: newDate,
          severity: aiData['severity'] ?? 'LOW',

          // **Legacy Compatibility**: অ্যাপের পুরনো ভার্সন যাতে ক্র্যাশ না করে,
          // তাই 'summary' ফিল্ডে আমরা ইংলিশ সিম্পল ব্যাখ্যাটি সেভ করছি।
          summary: aiData['simple_explanation_en'],

          extracted_text: aiData['extracted_text'],
          key_findings: aiData['key_findings'],
          attachment_urls: [file_url],
          file_hash: file_hash,

          // **New Feature**: পুরো JSON ডাটা (সহজ/কঠিন, বাংলা/ইংলিশ) এখানে থাকছে
          ai_details: aiData
        })

    if (insertError) throw insertError

    return new Response(JSON.stringify({ success: true, data: aiData }), {
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
