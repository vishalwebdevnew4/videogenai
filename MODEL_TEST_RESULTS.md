# AI Model Test Results

## 📊 Test Summary

**Date:** $(date)
**Total Models Tested:** 16
**Testing Method:** Direct Replicate API calls via curl

## ✅ Results Breakdown

### Working Models: **0**
*No models returned 201 (success) status*

### ⏳ Rate Limited: **12 models**
These models hit rate limits (429) but **might work after waiting**:
- `stability-ai/stable-video-diffusion` - Stable Diffusion video
- `meta/animate-anyone` - Meta animation model  
- `wan-video/wan-2.5-t2v-fast` - Wan fast text-to-video
- `wan-video/wan-2.5-i2v-fast` - Wan fast image-to-video
- `wan-video/wan-2.5-i2v` - Wan image-to-video
- `wavespeedai/wan-2.1-i2v-480p` - Wan 2.1 480p
- `wavespeedai/wan-2.1-t2v-480p` - Wan 2.1 text 480p
- `ali-vilab/i2vgen-xl` - I2VGen XL
- `anotherjesse/zeroscope-v2-xl` - Zeroscope V2 XL
- `anotherjesse/zeroscope-v2-576w` - Zeroscope V2 576w
- `fofr/video-morpher` - Video Morpher
- `cjwbw/text2video-zero` - Text2Video Zero

**Action:** Wait 60+ seconds and retest these models

### 💳 Payment Required: **1 model**
- `wan-video/wan-2.5-t2v` - Wan text-to-video

### ❌ Not Found (404): **3 models**
These models don't exist or were removed:
- `lucataco/animate-lcm` - Fast animation model
- `cjwbw/videocrafter2` - VideoCrafter 2
- `fofr/tooncrafter` - ToonCrafter

## 🔍 Analysis

### Key Findings:
1. **Rate Limits:** Most models hit rate limits (429) - this means they're accessible but need to wait
2. **Free Tier:** Replicate free tier allows 6 requests/minute
3. **Model Availability:** Some models have been removed/changed

### Recommendations:

1. **Wait and Retry:** The 12 rate-limited models should be retested after waiting 60+ seconds
2. **Use Paid Models:** If you have credits, models like `bytedance/seedance-1-lite` will work
3. **Add Credits:** Add $5-10 to Replicate account for better access
4. **Check Model Names:** Some models may have changed names - check Replicate.com/models

## 📝 Next Steps

1. Run `bash test_rate_limited_models.sh` to retest rate-limited models
2. Wait for rate limit to reset (check Replicate dashboard)
3. Update code with working models once confirmed
4. Consider adding credits to Replicate account

## 🛠️ Testing Scripts

- `test_models.sh` - Initial test of all models
- `test_rate_limited_models.sh` - Retest rate-limited models after waiting
- `test_all_free_models.py` - Python version with more detailed output

## 📈 Model Status Legend

- ✅ **Working** - Model accepts requests and can generate videos
- ⏳ **Rate Limited** - Model exists but hit rate limit (retry later)
- 💳 **Payment Required** - Model needs credits/paid account
- ❌ **Not Found** - Model doesn't exist or was removed
- ❌ **Error** - Other errors (timeout, etc.)

