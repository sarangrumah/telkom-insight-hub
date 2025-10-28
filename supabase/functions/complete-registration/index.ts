import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RegistrationData {
  accountData: {
    email: string
    password: string
    role: string
    maksudTujuan: string
  }
  companyData: {
    companyName: string
    nibNumber: string
    npwpNumber: string
    phone: string
    companyType: string
    aktaNumber: string
    address: string
    provinceId: string
    kabupaténId: string
    kecamatan: string
    kelurahan: string
    postalCode: string
  }
  picData: {
    fullName: string
    idNumber: string
    phoneNumber: string
    position: string
    address: string
    provinceId: string
    kabupaténId: string
    kecamatan: string
    kelurahan: string
    postalCode: string
  }
  documents: {
    nib?: string
    npwp?: string
    akta?: string
    ktp?: string
    assignmentLetter?: string
  }
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

    const registrationData: RegistrationData = await req.json()
    const { accountData, companyData, picData, documents } = registrationData

    console.log('Starting registration for:', accountData.email)

    // Validate required documents
    const requiredDocs = ['nib', 'npwp', 'akta', 'ktp', 'assignmentLetter']
    const missingDocs = requiredDocs.filter(doc => !documents[doc as keyof typeof documents])
    
    if (missingDocs.length > 0) {
      throw new Error(`Dokumen wajib belum diupload: ${missingDocs.join(', ')}`)
    }

    // Start transaction-like operations
    let createdUserId: string | null = null
    let createdCompanyId: string | null = null
    let createdPicId: string | null = null

    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: accountData.email,
        password: accountData.password,
        email_confirm: false, // Will be confirmed via email
        user_metadata: {
          full_name: picData.fullName,
          maksud_tujuan: accountData.maksudTujuan
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        throw new Error(`Gagal membuat akun: ${authError.message}`)
      }
      if (!authData.user) throw new Error("Failed to create user")

      createdUserId = authData.user.id
      console.log('Created user:', createdUserId)

      // 2. Create company
      const { data: companyRecord, error: companyError } = await supabase
        .from('companies')
        .insert({
          company_name: companyData.companyName,
          nib_number: companyData.nibNumber,
          npwp_number: companyData.npwpNumber,
          phone: companyData.phone,
          company_type: companyData.companyType,
          akta_number: companyData.aktaNumber,
          company_address: companyData.address,
          province_id: companyData.provinceId || null,
          kabupaten_id: companyData.kabupaténId || null,
          kecamatan: companyData.kecamatan,
          kelurahan: companyData.kelurahan,
          postal_code: companyData.postalCode,
          email: accountData.email,
          business_field: "Telekomunikasi"
        })
        .select()
        .single()

      if (companyError) {
        console.error('Company error:', companyError)
        throw new Error(`Gagal membuat data perusahaan: ${companyError.message}`)
      }

      createdCompanyId = companyRecord.id
      console.log('Created company:', createdCompanyId)

      // 3. Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          company_id: companyRecord.id,
          full_name: picData.fullName,
          phone: picData.phoneNumber,
          position: picData.position,
          role: 'pelaku_usaha',
          is_company_admin: true
        })

      if (profileError) {
        console.error('Profile error:', profileError)
        throw new Error(`Gagal membuat profil: ${profileError.message}`)
      }

      console.log('Created profile for user:', authData.user.id)

      // 4. Set user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: accountData.role
        })

      if (roleError && !roleError.message.includes('duplicate')) {
        console.error('Role error:', roleError)
        // Don't fail on role error as it might already exist from trigger
      }

      // 5. Create PIC record
      const { data: picRecord, error: picError } = await supabase
        .from('person_in_charge')
        .insert({
          company_id: companyRecord.id,
          full_name: picData.fullName,
          id_number: picData.idNumber,
          phone_number: picData.phoneNumber,
          position: picData.position,
          address: picData.address,
          province_id: picData.provinceId || null,
          kabupaten_id: picData.kabupaténId || null,
          kecamatan: picData.kecamatan,
          kelurahan: picData.kelurahan,
          postal_code: picData.postalCode
        })
        .select()
        .single()

      if (picError) {
        console.error('PIC error:', picError)
        throw new Error(`Gagal membuat data penanggung jawab: ${picError.message}`)
      }

      createdPicId = picRecord.id
      console.log('Created PIC:', createdPicId)

      // 6. Store company documents
      const companyDocs = [
        { type: 'nib', url: documents.nib },
        { type: 'npwp', url: documents.npwp },
        { type: 'akta', url: documents.akta }
      ].filter(doc => doc.url)

      for (const doc of companyDocs) {
        const { error: docError } = await supabase
          .from('company_documents')
          .insert({
            company_id: companyRecord.id,
            document_type: doc.type as string,
            file_path: doc.url!,
            file_name: `${doc.type}-document.pdf`,
            file_size: 0, // This should be set from actual file
            uploaded_by: authData.user.id
          })

        if (docError) {
          console.error(`Error saving ${doc.type} document:`, docError)
          throw new Error(`Gagal menyimpan dokumen ${doc.type}: ${docError.message}`)
        }
      }

      console.log('Saved company documents')

      // 7. Store PIC documents
      const picDocs = [
        { type: 'ktp', url: documents.ktp },
        { type: 'assignment_letter', url: documents.assignmentLetter }
      ].filter(doc => doc.url)

      for (const doc of picDocs) {
        const { error: docError } = await supabase
          .from('pic_documents')
          .insert({
            pic_id: picRecord.id,
            document_type: doc.type as string,
            file_path: doc.url!,
            file_name: `${doc.type}-document.pdf`,
            file_size: 0, // This should be set from actual file
            uploaded_by: authData.user.id
          })

        if (docError) {
          console.error(`Error saving ${doc.type} document:`, docError)
          throw new Error(`Gagal menyimpan dokumen ${doc.type}: ${docError.message}`)
        }
      }

      console.log('Saved PIC documents')

      // Send confirmation email
      const { error: emailError } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: accountData.email
      })

      if (emailError) {
        console.error('Email error:', emailError)
        // Don't fail on email error, registration is complete
      }

      console.log('Registration completed successfully for:', accountData.email)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Registrasi berhasil! Silakan cek email untuk konfirmasi.',
          userId: authData.user.id,
          companyId: companyRecord.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )

    } catch (error) {
      console.error('Registration failed, attempting cleanup...', error)

      // Cleanup on failure
      if (createdPicId) {
        await supabase.from('person_in_charge').delete().eq('id', createdPicId)
      }
      if (createdCompanyId) {
        await supabase.from('companies').delete().eq('id', createdCompanyId)
        await supabase.from('company_documents').delete().eq('company_id', createdCompanyId)
      }
      if (createdUserId) {
        await supabase.from('user_profiles').delete().eq('user_id', createdUserId)
        await supabase.from('user_roles').delete().eq('user_id', createdUserId)
        await supabase.auth.admin.deleteUser(createdUserId)
      }

      throw error
    }

  } catch (error) {
    console.error('Complete registration error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})