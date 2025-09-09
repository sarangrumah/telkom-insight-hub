import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, companyName, nibNumber } = await req.json()

    const validationErrors: string[] = []

    // Check email uniqueness
    const { data: existingUser, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) {
      console.error('Error checking users:', userError)
      throw new Error('Failed to validate email')
    }

    const emailExists = existingUser.users.some(user => user.email === email)
    if (emailExists) {
      validationErrors.push('Email sudah terdaftar')
    }

    // Check company uniqueness if provided
    if (companyName || nibNumber) {
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id, company_name, nib_number')
        .or(`company_name.ilike.${companyName},nib_number.eq.${nibNumber}`)

      if (companyError) {
        console.error('Error checking company:', companyError)
        throw new Error('Failed to validate company data')
      }

      if (companies && companies.length > 0) {
        const existingCompany = companies.find(c => 
          c.company_name?.toLowerCase() === companyName?.toLowerCase()
        )
        const existingNib = companies.find(c => c.nib_number === nibNumber)
        
        if (existingCompany) {
          validationErrors.push('Nama perusahaan sudah terdaftar')
        }
        if (existingNib) {
          validationErrors.push('NIB sudah terdaftar')
        }
      }
    }

    return new Response(
      JSON.stringify({
        valid: validationErrors.length === 0,
        errors: validationErrors
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Validation error:', error)
    return new Response(
      JSON.stringify({
        valid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed']
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})