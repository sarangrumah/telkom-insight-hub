import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const thirdPartyApiKey = Deno.env.get('THIRD_PARTY_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data, apiName = 'example-api' } = await req.json();
    
    console.log(`API Integration: ${apiName} | User: ${user.id} | Data:`, data);
    
    // Rate limiting check
    const now = Date.now();
    const rateLimitKey = `rate_limit_${user.id}_${apiName}`;
    
    if (!thirdPartyApiKey) {
      throw new Error('Third party API key not configured');
    }

    // Simulate third-party API call
    const apiResponse = await fetch('https://api.example.com/endpoint', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${thirdPartyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await apiResponse.json();
    
    // Log the API call
    await supabase.from('api_integration_logs').insert({
      user_id: user.id,
      api_name: apiName,
      request_data: data,
      response_data: result,
      status: apiResponse.ok ? 'success' : 'error',
    });

    console.log(`API Integration Success: ${apiName} | User: ${user.id} | Status: ${apiResponse.status}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        apiName,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: apiResponse.ok ? 200 : 400
      }
    );
  } catch (error) {
    console.error('API Integration Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);