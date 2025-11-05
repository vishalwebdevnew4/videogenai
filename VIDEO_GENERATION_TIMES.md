# Video Generation Time Guide

## Typical Generation Times by Model

### Fast Models (30 seconds - 2 minutes)
- **lucataco/animate-lcm** - 30-60 seconds
  - Fast animation model
  - Good for quick previews
  
- **wan-video/wan-2.5-t2v-fast** - 1-2 minutes
  - Fast version of Wan model
  - Lower quality but quick

### Standard Models (2-5 minutes)
- **bytedance/seedance-1-lite** - 2-4 minutes
  - Most popular model
  - Good balance of speed and quality
  
- **bytedance/seedance-1-pro-fast** - 2-3 minutes
  - Faster pro version
  - High quality output

### High Quality Models (3-8 minutes)
- **bytedance/seedance-1-pro** - 3-6 minutes
  - Professional quality
  - 5-10 second videos at 480p or 1080p
  
- **kwaivgi/kling-v2.5-turbo-pro** - 4-8 minutes
  - Excellent quality
  - Cinematic visuals
  
- **google/veo-3.1** - 5-10 minutes
  - Google's latest model
  - Highest quality, slower generation

- **luma/ray** - 3-7 minutes
  - Fast, high quality
  - Also known as Dream Machine

### Image-to-Video Models
- **wan-video/wan-2.5-i2v-fast** - 1-2 minutes
  - Fast image animation
  
- **wan-video/wan-2.5-i2v** - 2-4 minutes
  - High quality image animation

## Factors Affecting Generation Time

1. **Video Length**
   - 5 seconds: 1-3 minutes
   - 10 seconds: 3-8 minutes

2. **Resolution**
   - 480p: Faster (1-3 minutes)
   - 720p: Medium (2-5 minutes)
   - 1080p: Slower (4-10 minutes)

3. **Model Complexity**
   - Simple prompts: Faster
   - Complex prompts: Slower

4. **Server Load**
   - Peak hours: Slower
   - Off-peak: Faster

5. **API Queue**
   - Free tier: May wait in queue
   - Paid tier: Priority processing

## Current Code Tracking

The code tracks generation time automatically:
- Start time: Recorded when request starts
- End time: Recorded when video completes
- Total time: Calculated and logged
- Returned in API response as `generationTime` (in seconds)

## Expected Timeouts

- **API Timeout**: 180 seconds (3 minutes) for initial response
- **Video Generation**: May take 5-10 minutes total
- **Queue Time**: Can add 1-5 minutes during peak hours

## Tips for Faster Generation

1. Use fast models for quick previews
2. Use lower resolution (480p) for faster generation
3. Keep prompts simple and clear
4. Use paid tier for priority processing
5. Generate during off-peak hours

## Example Response Times

```json
{
  "success": true,
  "videoUrl": "https://...",
  "generationTime": 127,  // seconds
  "model": "bytedance/seedance-1-lite"
}
```

