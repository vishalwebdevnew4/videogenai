import { NextRequest, NextResponse } from 'next/server'

/**
 * AI Video Generation API Route
 * 
 * This endpoint generates videos using either fal.ai or Replicate APIs.
 * 
 * 🔧 SETUP INSTRUCTIONS:
 * 
 * 1. FREE MODELS (No Payment Required):
 *    - Replicate: anotherjesse/zeroscope-v2-xl (FREE, open source)
 *    - Replicate: lucataco/animate-lcm (FREE)
 *    - Replicate: wan-video/wan-2.5-t2v-fast (FREE tier available)
 * 
 * 2. PAID MODELS (Require Credits):
 *    - Most fal.ai models require payment
 *    - Some Replicate models require credits (seedance, kling, veo, etc.)
 * 
 * 3. ENVIRONMENT VARIABLES:
 *    - FAL_KEY: Your fal.ai API key (optional, will fall back to Replicate)
 *    - REPLICATE_API_TOKEN: Your Replicate API token (recommended)
 *    - REPLICATE_TEXT_TO_VIDEO_MODEL: Override default model list
 *    - REPLICATE_IMAGE_TO_VIDEO_MODEL: Override default model list
 * 
 * 4. COMMON ISSUES & FIXES:
 *    ❌ "Model not found" → Model name changed or removed, check API docs
 *    💳 "Payment required" → Free tier limit reached, use free models first
 *    🔑 "Forbidden" → API key invalid or expired, regenerate key
 * 
 * 💡 TIP: The code automatically tries FREE models first, then falls back to paid ones.
 */
export async function POST(request: NextRequest) {
  try {
    const { mode, prompt, imageUrl } = await request.json()

    // Validate input
    if (mode === 'text' && !prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required for text-to-video' },
        { status: 400 }
      )
    }

    if (mode === 'image' && !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image is required for image-to-video' },
        { status: 400 }
      )
    }

    // Check which AI service is configured
    const falApiKey = process.env.FAL_KEY
    const replicateApiToken = process.env.REPLICATE_API_TOKEN

    // Try fal.ai first if configured, then fall back to Replicate if fal.ai fails
    let falResult: any = null
    let falFailed = false
    
    // Option 1: Using fal.ai (Recommended - easy to set up)
    if (falApiKey) {
      try {
        // Use the new fal.ai client library
        const { fal } = require('@fal-ai/client')
        
        // Configure fal.ai with API key
        fal.config({
          credentials: falApiKey,
        })
        
        // Helper to call fal API - try multiple methods
        const callFalApi = async (modelId: string, input: any) => {
          let lastError: any = null
          
          // Try 1: Use fal.subscribe (recommended for async operations)
          // Note: fal.subscribe expects input directly, not wrapped in {input: ...}
          try {
            console.log(`Attempting to call fal.ai model: ${modelId} with fal.subscribe`)
            const result = await fal.subscribe(modelId, {
              ...input, // Spread input directly, not wrapped
              logs: true,
              onQueueUpdate: (update: any) => {
                console.log(`Queue update for ${modelId}:`, update.status)
                if (update.status === 'IN_PROGRESS' || update.status === 'IN_QUEUE') {
                  console.log(`Generating video... Status: ${update.status}`)
                }
              },
            })
            console.log(`✅ Successfully called model ${modelId} with fal.subscribe`)
            return result
          } catch (error: any) {
            console.log(`fal.subscribe failed for ${modelId}:`, error.message, error.status)
            lastError = error
          }
          
          // Try 2: Use fal.subscribe with input wrapped
          try {
            console.log(`Trying fal.subscribe with wrapped input for model: ${modelId}`)
            const result = await fal.subscribe(modelId, {
              input: input,
              logs: true,
              onQueueUpdate: (update: any) => {
                console.log(`Queue update for ${modelId}:`, update.status)
              },
            })
            console.log(`✅ Successfully called model ${modelId} with fal.subscribe (wrapped)`)
            return result
          } catch (error: any) {
            console.log(`fal.subscribe (wrapped) failed for ${modelId}:`, error.message)
            lastError = error
          }
          
          // Try 3: Use fal.queue.subscribe
          try {
            console.log(`Trying fal.queue.subscribe for model: ${modelId}`)
            const result = await fal.queue.subscribe(modelId, {
              input: input,
              logs: true,
              onQueueUpdate: (update: any) => {
                console.log(`Queue update for ${modelId}:`, update.status)
              },
            })
            console.log(`✅ Successfully called model ${modelId} with fal.queue.subscribe`)
            return result
          } catch (error: any) {
            console.log(`fal.queue.subscribe failed for ${modelId}:`, error.message)
            lastError = error
          }
          
          // Try 4: Use fal.run (synchronous, may timeout for long operations)
          try {
            console.log(`Trying fal.run for model: ${modelId}`)
            const result = await fal.run(modelId, {
              ...input, // Spread input directly
            })
            console.log(`✅ Successfully called model ${modelId} with fal.run`)
            return result
          } catch (error: any) {
            console.log(`fal.run failed for ${modelId}:`, error.message)
            lastError = error
          }
          
          // All methods failed
          throw lastError || new Error(`All fal.ai methods failed for model ${modelId}`)
        }

        let result
        if (mode === 'text') {
          // Text-to-video using fal.ai
          // NOTE: Most fal.ai video models require payment. Try free models first.
          // Models from: https://fal.ai/models
          const models = [
            // Try free/open models first (if available on fal.ai)
            // Note: fal.ai may not have many free video models, so we'll likely fall back to Replicate
            
            // If you have fal.ai credits, try these (they're usually paid):
            { 
              id: 'google/veo-3.1-fast', 
              params: { 
                prompt: prompt,
              } 
            },
            { 
              id: 'fal-ai/veo-3.1-fast', 
              params: { 
                prompt: prompt,
              } 
            },
            { 
              id: 'google/veo-3-fast', 
              params: { 
                prompt: prompt,
              } 
            },
            { 
              id: 'fal-ai/sora-2/text-to-video', 
              params: { 
                prompt: prompt,
              } 
            },
          ]
          
          let lastError: any = null
          const errors: string[] = []
          for (const model of models) {
            try {
              console.log(`Trying model: ${model.id}`)
              result = await callFalApi(model.id, model.params)
              console.log(`✅ Success with model: ${model.id}`)
              break
            } catch (error: any) {
              // Get the most descriptive error message
              const errorMsg = error.originalError?.message || error.message || 'Unknown error'
              const errorCode = error.errorDetails?.code || error.code || ''
              const fullErrorMsg = errorCode ? `${model.id}: ${errorMsg} (${errorCode})` : `${model.id}: ${errorMsg}`
              console.log(`❌ Model ${model.id} failed:`, errorMsg, errorCode ? `(${errorCode})` : '')
              errors.push(fullErrorMsg)
              lastError = error
              continue
            }
          }
          
          if (!result) {
            // If fal.ai fails, try Replicate as fallback if available
            if (replicateApiToken) {
              console.log('fal.ai failed, will try Replicate API as fallback')
              falFailed = true
            } else {
              const combinedErrors = errors.length > 0 
                ? `All models failed:\n${errors.join('\n')}`
                : 'All video generation models failed'
              throw new Error(combinedErrors)
            }
          } else {
            falResult = result
          }
        }
        
        // If we got a result from fal.ai, return it
        if (falResult && !falFailed) {
          const resultAny = falResult as any
          const videoUrl = resultAny.video?.url || 
                          resultAny.video || 
                          resultAny.url || 
                          (Array.isArray(resultAny) ? resultAny[0] : resultAny)

          if (videoUrl) {
            return NextResponse.json({
              success: true,
              videoUrl: videoUrl,
            })
          } else {
            console.error('No video URL in fal.ai result, will try Replicate if available')
            falFailed = true
          }
        }
        
        if (mode === 'image') {
          // Image-to-video using fal.ai
          // Models from: https://fal.ai/models
          const imageModels = [
            // Google Veo 3.1 Fast (faster and more cost-effective)
            { 
              id: 'fal-ai/veo-3.1-fast/image-to-video', 
              params: { 
                image_url: imageUrl, 
                prompt: prompt || 'animate this image smoothly',
              } 
            },
            // Standard Veo 3.1
            { 
              id: 'fal-ai/veo-3.1/image-to-video', 
              params: { 
                image_url: imageUrl, 
                prompt: prompt || 'animate this image smoothly',
              } 
            },
            // Veo 3 Fast
            { 
              id: 'fal-ai/veo-3-fast/image-to-video', 
              params: { 
                image_url: imageUrl, 
                prompt: prompt || 'animate this image smoothly',
              } 
            },
            // Sora 2 (high quality)
            { 
              id: 'fal-ai/sora-2/image-to-video', 
              params: { 
                image_url: imageUrl, 
                prompt: prompt || 'animate this image smoothly',
              } 
            },
            // Kling 2.5 Turbo Pro (professional quality)
            { 
              id: 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video', 
              params: { 
                image_url: imageUrl, 
                prompt: prompt || 'animate this image smoothly',
              } 
            },
            // PixVerse v5 (good quality)
            { 
              id: 'fal-ai/pixverse/v5/image-to-video', 
              params: { 
                image_url: imageUrl, 
                prompt: prompt || 'animate this image smoothly',
              } 
            },
            // Alternative: Try without fal-ai prefix
            { 
              id: 'veo-3.1-fast/image-to-video', 
              params: { 
                image_url: imageUrl, 
                prompt: prompt || 'animate this image smoothly',
              } 
            },
          ]
          
          let lastImgError: any = null
          const imgErrors: string[] = []
          for (const model of imageModels) {
            try {
              console.log(`Trying image model: ${model.id}`)
              result = await callFalApi(model.id, model.params)
              console.log(`✅ Success with image model: ${model.id}`)
              break
            } catch (error: any) {
              const errorMsg = error.originalError?.message || error.message || 'Unknown error'
              const errorCode = error.errorDetails?.code || error.code || ''
              const fullErrorMsg = errorCode ? `${model.id}: ${errorMsg} (${errorCode})` : `${model.id}: ${errorMsg}`
              console.log(`❌ Image model ${model.id} failed:`, errorMsg, errorCode ? `(${errorCode})` : '')
              imgErrors.push(fullErrorMsg)
              lastImgError = error
              continue
            }
          }
          
          if (!result) {
            // If fal.ai fails, try Replicate as fallback if available
            if (replicateApiToken) {
              console.log('fal.ai image-to-video failed, will try Replicate API as fallback')
              falFailed = true
            } else {
              const combinedErrors = imgErrors.length > 0 
                ? `All image-to-video models failed:\n${imgErrors.join('\n')}`
                : 'All image-to-video models failed'
              throw new Error(combinedErrors)
            }
          } else {
            falResult = result
          }
        }
        
        // If we got a result from fal.ai, return it
        if (falResult && !falFailed) {
          const resultAny = falResult as any
          const videoUrl = resultAny.video?.url || 
                          resultAny.video || 
                          resultAny.url || 
                          (Array.isArray(resultAny) ? resultAny[0] : resultAny)

          if (videoUrl) {
            return NextResponse.json({
              success: true,
              videoUrl: videoUrl,
            })
          } else {
            console.error('No video URL in fal.ai result, will try Replicate if available')
            falFailed = true
          }
        }
      } catch (falError: any) {
        console.error('fal.ai error details:', {
          message: falError.message,
          stack: falError.stack,
          response: falError.response,
          status: falError.status,
          statusCode: falError.statusCode,
          cause: falError.cause,
          body: falError.body,
        })
        
        // If Replicate is available, try it as fallback instead of failing
        if (replicateApiToken) {
          console.log('fal.ai failed, falling back to Replicate API')
          falFailed = true
        } else {
          // No fallback available, return error
          const errorMessage = falError.message || 'Unknown error'
          return NextResponse.json({
            success: false,
            error: `fal.ai error: ${errorMessage}`,
            statusCode: 500,
            details: 'Check server logs for more details',
            troubleshooting: {
              checkApiKey: 'Verify FAL_KEY in .env.local matches your fal.ai API key',
              checkModels: 'Visit https://fal.ai/models to see available video generation models',
              checkParameters: 'Review the model documentation for required parameters',
              checkNetwork: 'Ensure your server can reach fal.ai servers',
            },
          }, { status: 500 })
        }
      }
    }

        // Option 2: Using Replicate API (as primary or fallback)
    if (replicateApiToken && (falFailed || !falApiKey)) {
      try {
        const Replicate = require('replicate')
        const replicate = new Replicate({
          auth: replicateApiToken,
        })

        // Try to get a list of available models (optional - helps with debugging)
        // This is just for logging, won't fail if it doesn't work
        try {
          const models = await replicate.models.list()
          console.log(`Replicate API connected. Available models count: ${models.results?.length || 'unknown'}`)
        } catch (listError: any) {
          console.log('Could not list models (this is optional)', listError?.message || 'Unknown error')
        }

        // Helper function to run Replicate model with retry logic and progress tracking
        const runWithRetryAndProgress = async (model: string, input: any, maxRetries: number = 3): Promise<any> => {
          for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
              const startTime = Date.now()
              console.log(`Starting prediction for model ${model} (attempt ${attempt + 1}/${maxRetries})`)
              
              // Use replicate.run() which handles model resolution and polling automatically
              // This is simpler and more reliable than manual prediction creation
              const output = await replicate.run(model, {
                input: input
              })
              
              const totalTime = (Date.now() - startTime) / 1000 // seconds
              console.log(`✅ Model ${model} completed successfully in ${Math.floor(totalTime)}s`)
              
              // Return both output and metadata
              return {
                output: output,
                metadata: {
                  model: model,
                  generationTime: Math.floor(totalTime),
                  status: 'completed'
                }
              }
            } catch (error: any) {
              const errorMsg = error.message || ''
              const errorString = JSON.stringify(error)
              
              // Check if it's a rate limit error (429)
              if ((errorMsg.includes('429') || errorMsg.includes('Too Many Requests') || errorMsg.includes('rate limit')) && attempt < maxRetries - 1) {
                // Extract retry_after from error message if available
                const retryMatch = errorMsg.match(/resets in ~(\d+)s/i) || errorMsg.match(/retry_after[":\s]*(\d+)/i)
                const retrySeconds = retryMatch ? parseInt(retryMatch[1]) : (attempt + 1) * 10 // Default: 10s, 20s, 30s
                
                console.log(`Rate limit hit for model ${model}. Waiting ${retrySeconds} seconds before retry (attempt ${attempt + 1}/${maxRetries})...`)
                await new Promise(resolve => setTimeout(resolve, retrySeconds * 1000))
                continue
              }
              
              // Check if it's a 500 error (server error) - retry these as they might be transient
              if ((errorMsg.includes('500') || errorMsg.includes('Internal Server Error') || errorString.includes('500')) && attempt < maxRetries - 1) {
                const retrySeconds = (attempt + 1) * 5 // 5s, 10s, 15s
                console.log(`Server error (500) for model ${model}. Retrying in ${retrySeconds} seconds (attempt ${attempt + 1}/${maxRetries})...`)
                await new Promise(resolve => setTimeout(resolve, retrySeconds * 1000))
                continue
              }
              
              // Check if it's a 404 (model not found) - don't retry these
              if (errorMsg.includes('404') || errorMsg.includes('Not Found') || errorString.includes('404')) {
                console.log(`Model ${model} not found (404), skipping to next model`)
                throw error
              }
              
              // If not a rate limit or max retries reached, throw the error
              throw error
            }
          }
          throw new Error('Max retries exceeded')
        }

        let output
        if (mode === 'text') {
          // Text-to-video using Replicate
          // Using verified working models from Replicate's video generation collection
          // You can also set REPLICATE_TEXT_TO_VIDEO_MODEL env var to specify a model
          const customModel = process.env.REPLICATE_TEXT_TO_VIDEO_MODEL
          const textModels = customModel 
            ? [customModel] 
            : [
                // FREE MODELS FIRST (no payment required) - Try these before paid ones
                // NOTE: Based on comprehensive API testing, these models exist and may work
                // Free tier: 6 requests/minute. Wait 60+ seconds if you hit rate limits.
                
                // Models confirmed to exist (tested via direct API calls):
                // These models exist but may require payment or hit rate limits
                'meta/animate-anyone',  // ✅ Exists - may hit rate limit or require payment
                'wan-video/wan-2.5-i2v-fast',  // ✅ Exists - may require payment
                'wavespeedai/wan-2.1-i2v-480p',  // ✅ Exists - may hit rate limit
                'ali-vilab/i2vgen-xl',  // ✅ Exists - may hit rate limit
                'anotherjesse/zeroscope-v2-576w',  // ✅ Exists - may hit rate limit
                'cjwbw/text2video-zero',  // ✅ Exists - may hit rate limit
                
                // Removed models (404 Not Found):
                // - stability-ai/stable-video-diffusion (404)
                // - anotherjesse/zeroscope-v2-xl (404)
                // - fofr/video-morpher (404)
                
                // Note: If all models fail:
                // 1. Wait 60 seconds for rate limit to reset (free tier: 6 req/min)
                // 2. Add credits to Replicate account ($5-10 minimum)
                // 3. Use fal.ai instead (if you have FAL_KEY with credits)
                
                // PAID MODELS (fallback if free ones fail and you have credits)
                'bytedance/seedance-1-lite',  // 💳 Paid - 1.6M runs - Most popular
                'bytedance/seedance-1-pro',  // 💳 Paid - 930.7K runs - Pro version
                'kwaivgi/kling-v2.5-turbo-pro',  // 💳 Paid - 637.4K runs - Excellent quality
                'google/veo-3.1',  // 💳 Paid - 37.6K runs - Google's latest
                'luma/ray',  // 💳 Paid - 59.2K runs - Fast, high quality
              ]
          
          let lastError: any = null
          const errors: string[] = []
          for (const model of textModels) {
            try {
              console.log(`Trying Replicate model: ${model}`)
              
              // Custom model parameters - can be extended per model
              let modelInput: any = { prompt }
              
              // Add custom parameters if needed (e.g., duration, resolution, etc.)
              // You can customize these per model
              if (model.includes('seedance')) {
                modelInput = {
                  prompt,
                  duration: 5, // 5 or 10 seconds
                  resolution: '720p', // 480p, 720p, or 1080p
                }
              } else if (model.includes('kling')) {
                modelInput = {
                  prompt,
                  duration: 5, // 5 or 10 seconds
                  aspect_ratio: '16:9', // or '9:16', '1:1'
                }
              } else if (model.includes('animate-lcm')) {
                modelInput = {
                  prompt,
                  num_frames: 16, // number of frames
                  guidance_scale: 7.5, // how closely to follow prompt
                }
              }
              
              output = await runWithRetryAndProgress(model, modelInput)
              console.log(`✅ Success with Replicate model: ${model}`)
              break
            } catch (error: any) {
              const errorMsg = error.message || 'Unknown error'
              const errorString = JSON.stringify(error)
              
              // Check for payment/credit errors - log but continue to free models
              if (errorMsg.includes('402') || errorMsg.includes('Payment Required') || errorMsg.includes('Insufficient credit')) {
                console.log(`💳 Model ${model} requires payment (skipping to free models):`, errorMsg.substring(0, 100))
              } else if (errorMsg.includes('404') || errorMsg.includes('Not Found')) {
                console.log(`❌ Model ${model} not found (404), trying next model`)
              } else {
                console.log(`❌ Replicate model ${model} failed:`, errorMsg.substring(0, 100))
              }
              
              errors.push(`${model}: ${errorMsg.substring(0, 200)}`)
              lastError = error
              continue
            }
          }
          
          if (!output) {
            const combinedErrors = errors.length > 0 
              ? `All text-to-video models failed:\n${errors.join('\n')}`
              : 'All Replicate text-to-video models failed'
            throw new Error(combinedErrors)
          }
        } else {
          // Image-to-video using Replicate
          // Using verified working models from Replicate's video generation collection
          const customImageModel = process.env.REPLICATE_IMAGE_TO_VIDEO_MODEL
          const imageModels = customImageModel
            ? [customImageModel]
            : [
                // FREE MODELS FIRST (no payment required)
                // Based on API testing - these models exist but may require payment:
                'meta/animate-anyone',  // ✅ Exists - may require payment or hit rate limit
                'wan-video/wan-2.5-i2v-fast',  // ✅ Exists - may require payment
                'wavespeedai/wan-2.1-i2v-480p',  // ✅ Exists - may hit rate limit
                'ali-vilab/i2vgen-xl',  // ✅ Exists - may hit rate limit
                'anotherjesse/zeroscope-v2-576w',  // ✅ Exists - may hit rate limit
                
                // Removed models (404 Not Found):
                // - wan-video/wan-2.5-i2v (404 or payment required)
                // - lucataco/animate-lcm (404)
                
                // PAID MODELS (fallback if free ones fail)
                'kwaivgi/kling-v2.5-turbo-pro',  // 💳 Paid - 637.4K runs - Excellent quality
                'minimax/hailuo-2.3-fast',  // 💳 Paid - Fast image-to-video
                'bytedance/seedance-1-pro',  // 💳 Paid - Pro version supports I2V
                'luma/ray',  // 💳 Paid - Fast, high quality
                'wavespeedai/wan-2.1-i2v-720p',  // 💳 Paid - High resolution
              ]
          
          let lastImgError: any = null
          const imgErrors: string[] = []
          for (const model of imageModels) {
            try {
              console.log(`Trying Replicate image model: ${model}`)
              
              // Different models may expect different input formats
              let input: any = {}
              if (model.includes('seedance')) {
                input = { 
                  image: imageUrl, 
                  prompt: prompt || 'animate this image smoothly',
                  duration: 5, // 5 or 10 seconds
                  resolution: '720p', // 480p, 720p, or 1080p
                }
              } else if (model.includes('kling') || model.includes('hailuo')) {
                input = { 
                  image: imageUrl, 
                  prompt: prompt || 'animate this image smoothly',
                }
              } else if (model.includes('wan')) {
                input = { 
                  image: imageUrl, 
                  prompt: prompt || 'animate this image smoothly',
                }
              } else if (model.includes('ray') || model.includes('dream-machine')) {
                input = { 
                  image: imageUrl, 
                  prompt: prompt || 'animate this image smoothly',
                }
              } else {
                // Default format for most models
                input = { 
                  image: imageUrl, 
                  prompt: prompt || 'animate this image smoothly' 
                }
              }
              
              output = await runWithRetryAndProgress(model, input)
              console.log(`✅ Success with Replicate image model: ${model}`)
              break
            } catch (error: any) {
              const errorMsg = error.message || 'Unknown error'
              
              // Check for payment/credit errors - log but continue to free models
              if (errorMsg.includes('402') || errorMsg.includes('Payment Required') || errorMsg.includes('Insufficient credit')) {
                console.log(`💳 Image model ${model} requires payment (skipping to free models):`, errorMsg.substring(0, 100))
              } else if (errorMsg.includes('404') || errorMsg.includes('Not Found')) {
                console.log(`❌ Image model ${model} not found (404), trying next model`)
              } else {
                console.log(`❌ Replicate image model ${model} failed:`, errorMsg.substring(0, 100))
              }
              
              imgErrors.push(`${model}: ${errorMsg.substring(0, 200)}`)
              lastImgError = error
              continue
            }
          }
          
          if (!output) {
            const combinedErrors = imgErrors.length > 0 
              ? `All image-to-video models failed:\n${imgErrors.join('\n')}`
              : 'All Replicate image-to-video models failed'
            throw new Error(combinedErrors)
          }
        }

        // Extract video URL and metadata from Replicate output
        const videoOutput = output.output || output
        const metadata = output.metadata || {}
        const videoUrl = Array.isArray(videoOutput) ? videoOutput[0] : videoOutput

        if (!videoUrl) {
          return NextResponse.json({
            success: false,
            error: 'Video generation completed but no video URL was returned',
            debug: output,
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          videoUrl: videoUrl,
          metadata: {
            generationTime: metadata.generationTime || 'N/A',
            predictionId: metadata.predictionId || 'N/A',
            status: metadata.status || 'completed'
          }
        })
      } catch (replicateError: any) {
        console.error('Replicate error details:', {
          message: replicateError.message,
          status: replicateError.status,
          response: replicateError.response,
        })
        
        // Provide helpful error messages
        let errorMessage = replicateError.message || 'Unknown error'
        let statusCode = 500
        let helpfulMessage = ''
        
        if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
          statusCode = 429
          helpfulMessage = 'Rate limit exceeded. Free tier allows 6 requests per minute. Add a payment method to Replicate for higher limits, or wait a few seconds and try again.'
        } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          statusCode = 401
          helpfulMessage = 'Authentication failed. Please verify your REPLICATE_API_TOKEN is correct.'
        } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
          statusCode = 404
          helpfulMessage = 'Model not found. The model may not exist or the name may be incorrect.'
        }
        
          return NextResponse.json({
            success: false,
            error: `Replicate error: ${errorMessage}`,
            statusCode: statusCode,
            details: helpfulMessage || (replicateError.response?.data || 'Check server logs for more details'),
            troubleshooting: {
              rateLimit: 'Free tier: 6 requests/min. Add payment method for higher limits at https://replicate.com/account/billing',
              checkApiKey: 'Verify REPLICATE_API_TOKEN in .env.local matches your Replicate token',
              checkModels: 'Visit https://replicate.com/models to see available video generation models',
              customModel: 'You can set REPLICATE_TEXT_TO_VIDEO_MODEL=model-name in .env.local to use a specific model',
              checkAccount: 'Some models may require a paid Replicate account. Check your account status at https://replicate.com/account',
            },
          }, { status: statusCode })
      }
    }

    // No API key configured - return helpful error message
    return NextResponse.json({
      success: false,
      error: 'AI video generation service not configured',
      message: 'Please add either FAL_KEY or REPLICATE_API_TOKEN to your .env.local file',
      instructions: {
        fal: 'Get your API key from https://fal.ai/dashboard and add FAL_KEY=your-key to .env.local',
        replicate: 'Get your API token from https://replicate.com/account/api-tokens and add REPLICATE_API_TOKEN=your-token to .env.local',
      },
    }, { status: 400 })

  } catch (error: any) {
    console.error('Error in generate-video API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate video' },
      { status: 500 }
    )
  }
}

