# Custom AI Model Configuration Guide

## 🎯 How to Add/Configure Custom Models

You have several options to customize AI models in your application:

### Option 1: Use Environment Variables (Easiest)

Add to your `.env.local` file:

```env
# Use a specific text-to-video model
REPLICATE_TEXT_TO_VIDEO_MODEL=your-model-name/here

# Use a specific image-to-video model  
REPLICATE_IMAGE_TO_VIDEO_MODEL=your-model-name/here
```

**Example:**
```env
REPLICATE_TEXT_TO_VIDEO_MODEL=bytedance/seedance-1-lite
REPLICATE_IMAGE_TO_VIDEO_MODEL=wan-video/wan-2.5-i2v
```

### Option 2: Add Custom Model Parameters

The code now supports custom parameters per model. Edit `app/api/generate-video/route.ts`:

```typescript
// Example: Custom parameters for seedance models
if (model.includes('seedance')) {
  modelInput = {
    prompt,
    duration: 10,        // 5 or 10 seconds
    resolution: '1080p', // 480p, 720p, or 1080p
  }
}

// Example: Custom parameters for animate-lcm
else if (model.includes('animate-lcm')) {
  modelInput = {
    prompt,
    num_frames: 32,      // number of frames
    guidance_scale: 7.5, // how closely to follow prompt (1-20)
  }
}
```

### Option 3: Add New Models to the List

Edit `app/api/generate-video/route.ts` and add to the model arrays:

```typescript
const textModels = [
  'your-new-model/name',  // Add your custom model here
  'another-model/name',
  // ... existing models
]
```

## 🔧 Available Model Parameters

Different models support different parameters. Common ones:

### Text-to-Video Models

**Seedance Models:**
- `prompt` (required): Text description
- `duration`: 5 or 10 seconds
- `resolution`: '480p', '720p', or '1080p'

**Kling Models:**
- `prompt` (required): Text description  
- `duration`: 5 or 10 seconds
- `aspect_ratio`: '16:9', '9:16', or '1:1'

**Animate-LCM:**
- `prompt` (required): Text description
- `num_frames`: 16, 24, 32 (number of frames)
- `guidance_scale`: 1-20 (how closely to follow prompt)
- `num_inference_steps`: 4-8 (quality vs speed)

**Veo Models:**
- `prompt` (required): Text description
- `duration`: 5 or 10 seconds
- `aspect_ratio`: '16:9', '9:16', or '1:1'

### Image-to-Video Models

**Wan Models:**
- `image` (required): Image URL
- `prompt`: Optional text description
- `duration`: 5 or 10 seconds

**Seedance I2V:**
- `image` (required): Image URL
- `prompt`: Optional text description
- `duration`: 5 or 10 seconds
- `resolution`: '480p', '720p', or '1080p'

## 🚀 Creating Your Own AI Model (Advanced)

If you want to create a completely new AI model from scratch, here's what you'd need:

### Requirements:
1. **Large Dataset** (millions of video-text pairs)
2. **Compute Power** (GPUs - A100, H100, or cloud GPUs)
3. **Training Time** (weeks to months)
4. **Expertise** (deep learning, computer vision)
5. **Cost** ($10,000 - $100,000+)

### Steps:
1. **Collect/Prepare Dataset**
   - Gather video-text pairs
   - Preprocess and clean data
   - Create training splits

2. **Choose Architecture**
   - Diffusion models (Stable Diffusion, etc.)
   - Transformer-based (like Veo, Sora)
   - GAN-based (older approach)

3. **Training**
   - Set up training infrastructure
   - Train on GPU clusters
   - Monitor and tune hyperparameters

4. **Fine-tuning**
   - Refine on specific tasks
   - Optimize for quality/speed

5. **Deployment**
   - Deploy to cloud (Replicate, Hugging Face, etc.)
   - Create API endpoints
   - Monitor and maintain

### Easier Alternatives:

1. **Fine-tune Existing Models**
   - Use existing models (e.g., Stable Video Diffusion)
   - Fine-tune on your specific data
   - Much cheaper and faster

2. **Use Model APIs**
   - Use Replicate, fal.ai, etc.
   - No model creation needed
   - Pay per use

3. **Train LoRA Adapters**
   - Create style/personality adapters
   - Works with existing models
   - Requires less data/compute

## 📝 Quick Examples

### Example 1: Use Specific Model Only

```env
# .env.local
REPLICATE_TEXT_TO_VIDEO_MODEL=bytedance/seedance-1-pro
```

### Example 2: Custom Parameters in Code

```typescript
// In route.ts, modify the model input:
if (model === 'bytedance/seedance-1-pro') {
  modelInput = {
    prompt,
    duration: 10,
    resolution: '1080p',
  }
}
```

### Example 3: Add New Model

```typescript
// In route.ts, add to textModels array:
const textModels = [
  'your-custom-model/name',  // Your model
  'another-model/name',
  // ... existing models
]
```

## 🎓 Resources

- **Replicate Models**: https://replicate.com/models
- **Model Parameters**: Check each model's page for specific parameters
- **Training Guides**: Hugging Face, PyTorch documentation
- **Fine-tuning**: LoRA tutorials, Hugging Face Transformers

## 💡 Recommendation

For most use cases, **using existing models with custom parameters** is the best approach. Creating a new model from scratch is only needed if:
- You have unique requirements
- You have the budget and expertise
- You need proprietary capabilities

Start with customizing existing models, then consider fine-tuning if needed!

