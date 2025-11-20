import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, lang = 'en' } = await req.json();
    console.log('🔍 Starting SEO analysis for:', url, 'Language:', lang);

    // Validate URL
    if (!url) {
      throw new Error('URL is required');
    }

    // Fetch webpage
    console.log('📥 Fetching webpage...');
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch URL:', response.status, response.statusText);
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('✅ HTML fetched, length:', html.length);

    // Extract SEO data
    console.log('🔎 Extracting SEO data...');
    
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const metaDescription = descMatch ? descMatch[1].trim() : null;

    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    const h1Count = h1Matches.length;

    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;

    const imgTags = html.match(/<img[^>]*>/gi) || [];
    const totalImages = imgTags.length;
    const imagesWithoutAlt = imgTags.filter(t => !t.includes('alt=')).length;

    const hasViewport = html.includes('viewport');
    const hasCanonical = html.includes('rel="canonical"');

    console.log('📊 SEO data extracted:', { title, h1Count, h2Count, totalImages, imagesWithoutAlt });

    // Calculate scores
    let score = 100;
    if (!title) score -= 15;
    else if (title.length > 60) score -= 5;
    
    if (!metaDescription) score -= 15;
    else if (metaDescription.length > 160) score -= 5;
    
    if (h1Count === 0) score -= 10;
    else if (h1Count > 1) score -= 5;
    
    if (imagesWithoutAlt > 0) score -= Math.min(10, imagesWithoutAlt * 2);
    if (!hasViewport) score -= 10;
    if (!hasCanonical) score -= 5;

    const scores = {
      global: Math.max(0, score),
      mobile: hasViewport ? Math.max(0, score) : Math.max(0, score - 20),
      desktop: Math.max(0, score),
    };

    console.log('✅ Scores calculated:', scores);

    // Generate AI analysis with Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    let aiAnalysis = '';

    if (LOVABLE_API_KEY) {
      console.log('🤖 Calling Lovable AI for detailed analysis...');
      
      try {
        const prompt = lang === 'fr'
          ? `Analyse SEO professionnelle pour ${url}

**Données SEO:**
- Score global: ${scores.global}/100
- Score mobile: ${scores.mobile}/100  
- Score desktop: ${scores.desktop}/100
- Title: ${title || 'MANQUANT'}
- Meta description: ${metaDescription || 'MANQUANTE'}
- Balises H1: ${h1Count}
- Balises H2: ${h2Count}
- Images: ${totalImages} (dont ${imagesWithoutAlt} sans alt)
- Viewport mobile: ${hasViewport ? 'OUI' : 'NON'}
- Balise canonical: ${hasCanonical ? 'OUI' : 'NON'}

Génère un rapport SEO détaillé en français structuré ainsi:

## Résumé
[1-2 phrases sur la situation globale]

## Points Forts
[Liste à puces des éléments bien optimisés]

## Problèmes Critiques
[Liste à puces des problèmes majeurs à corriger]

## Recommandations
[Liste à puces d'actions concrètes et prioritaires]

Format: Markdown professionnel et clair.`
          : `Professional SEO Analysis for ${url}

**SEO Data:**
- Global score: ${scores.global}/100
- Mobile score: ${scores.mobile}/100
- Desktop score: ${scores.desktop}/100
- Title: ${title || 'MISSING'}
- Meta description: ${metaDescription || 'MISSING'}
- H1 tags: ${h1Count}
- H2 tags: ${h2Count}
- Images: ${totalImages} (${imagesWithoutAlt} without alt)
- Mobile viewport: ${hasViewport ? 'YES' : 'NO'}
- Canonical tag: ${hasCanonical ? 'YES' : 'NO'}

Generate a detailed SEO report in English structured as:

## Summary
[1-2 sentences on overall situation]

## Strengths
[Bullet points of well-optimized elements]

## Critical Issues
[Bullet points of major problems to fix]

## Recommendations
[Bullet points of concrete and prioritized actions]

Format: Professional and clear Markdown.`;

        const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { 
                role: 'system', 
                content: lang === 'fr' 
                  ? 'Tu es un expert SEO qui génère des rapports clairs et actionnables en français.' 
                  : 'You are an SEO expert who generates clear and actionable reports in English.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (aiResp.ok) {
          const data = await aiResp.json();
          aiAnalysis = data.choices?.[0]?.message?.content || '';
          console.log('✅ AI analysis generated successfully, length:', aiAnalysis.length);
        } else {
          const errorText = await aiResp.text();
          console.error('❌ AI API error:', aiResp.status, errorText);
        }
      } catch (aiError) {
        console.error('❌ AI generation error:', aiError);
      }
    } else {
      console.warn('⚠️ LOVABLE_API_KEY not found, using fallback report');
    }

    // Fallback report if AI failed
    if (!aiAnalysis) {
      console.log('📝 Generating fallback report...');
      const isFr = lang === 'fr';
      
      aiAnalysis = `# ${isFr ? 'Rapport d\'Analyse SEO' : 'SEO Analysis Report'}\n\n`;
      aiAnalysis += `## ${isFr ? 'Résumé' : 'Summary'}\n`;
      aiAnalysis += isFr 
        ? `Le site obtient un score de ${scores.global}/100. ${scores.global >= 80 ? 'Bonne base SEO.' : 'Des améliorations sont nécessaires.'}\n\n`
        : `The site scores ${scores.global}/100. ${scores.global >= 80 ? 'Good SEO foundation.' : 'Improvements needed.'}\n\n`;
      
      aiAnalysis += `## ${isFr ? 'Points Forts' : 'Strengths'}\n`;
      if (title) aiAnalysis += `- ${isFr ? '✅ Titre présent' : '✅ Title present'}: "${title}"\n`;
      if (metaDescription) aiAnalysis += `- ${isFr ? '✅ Meta description présente' : '✅ Meta description present'}\n`;
      if (hasViewport) aiAnalysis += `- ${isFr ? '✅ Viewport mobile configuré' : '✅ Mobile viewport configured'}\n`;
      if (h1Count === 1) aiAnalysis += `- ${isFr ? '✅ Une seule balise H1' : '✅ Single H1 tag'}\n`;
      
      aiAnalysis += `\n## ${isFr ? 'Problèmes Critiques' : 'Critical Issues'}\n`;
      if (!title) aiAnalysis += `- ${isFr ? '❌ Titre manquant' : '❌ Missing title'}\n`;
      if (!metaDescription) aiAnalysis += `- ${isFr ? '❌ Meta description manquante' : '❌ Missing meta description'}\n`;
      if (h1Count === 0) aiAnalysis += `- ${isFr ? '❌ Aucune balise H1' : '❌ No H1 tag'}\n`;
      if (h1Count > 1) aiAnalysis += `- ${isFr ? '⚠️ Plusieurs H1' : '⚠️ Multiple H1'}: ${h1Count}\n`;
      if (!hasViewport) aiAnalysis += `- ${isFr ? '❌ Viewport mobile manquant' : '❌ Missing mobile viewport'}\n`;
      if (imagesWithoutAlt > 0) aiAnalysis += `- ${isFr ? '⚠️ Images sans alt' : '⚠️ Images without alt'}: ${imagesWithoutAlt}/${totalImages}\n`;
      
      aiAnalysis += `\n## ${isFr ? 'Recommandations' : 'Recommendations'}\n`;
      if (!title || title.length > 60) aiAnalysis += `- ${isFr ? 'Optimiser le titre (max 60 car.)' : 'Optimize title (max 60 chars)'}\n`;
      if (!metaDescription || metaDescription.length > 160) aiAnalysis += `- ${isFr ? 'Optimiser la meta description (max 160 car.)' : 'Optimize meta description (max 160 chars)'}\n`;
      if (h1Count !== 1) aiAnalysis += `- ${isFr ? 'Utiliser exactement une H1' : 'Use exactly one H1'}\n`;
      if (imagesWithoutAlt > 0) aiAnalysis += `- ${isFr ? 'Ajouter des alt à toutes les images' : 'Add alt to all images'}\n`;
    }

    // Save to database
    console.log('💾 Saving report to database...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    let userId = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
      console.log('👤 User ID:', userId);
    }

    if (userId) {
      const { error: dbError } = await supabase
        .from('seo_reports')
        .insert({
          user_id: userId,
          url,
          title,
          meta_description: metaDescription,
          h1_count: h1Count,
          h2_count: h2Count,
          total_images: totalImages,
          images_without_alt: imagesWithoutAlt,
          has_viewport: hasViewport,
          has_canonical: hasCanonical,
          global_score: scores.global,
          mobile_score: scores.mobile,
          desktop_score: scores.desktop,
          ai_analysis: aiAnalysis,
          report_lang: lang,
        });

      if (dbError) {
        console.error('❌ Database error:', dbError);
      } else {
        console.log('✅ Report saved to database');
      }
    }

    console.log('🎉 Analysis completed successfully');

    return new Response(
      JSON.stringify({
        url,
        scores,
        analysis: {
          title,
          metaDescription,
          h1Count,
          h2Count,
          totalImages,
          imagesWithoutAlt,
          hasViewport,
          hasCanonical,
        },
        aiAnalysis,
        analyzedAt: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 Error in analyze-seo function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
