#!/bin/bash

# Test API until we get a successful video generation
# This script will retry with increasing delays until success

API_URL="http://localhost:3001/api/generate-video"
MAX_ATTEMPTS=50
INITIAL_DELAY=30
MAX_DELAY=300

echo "🚀 Testing API until success..."
echo "URL: $API_URL"
echo "Max attempts: $MAX_ATTEMPTS"
echo ""

attempt=1
delay=$INITIAL_DELAY

while [ $attempt -le $MAX_ATTEMPTS ]; do
    echo "=========================================="
    echo "Attempt $attempt of $MAX_ATTEMPTS"
    echo "Waiting ${delay} seconds before test..."
    echo "=========================================="
    
    # Wait before attempting (except first attempt if delay is small)
    if [ $attempt -gt 1 ] || [ $delay -gt 0 ]; then
        sleep $delay
    fi
    
    echo "📤 Sending request..."
    echo "Prompt: 'a cat walking'"
    echo ""
    
    # Make the API call with longer timeout (video generation can take 5-10 minutes)
    # Use 600 seconds (10 minutes) for video generation
    response=$(timeout 600 curl -s -m 600 -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d '{"mode":"text","prompt":"a cat walking"}' 2>&1)
    
    # Check for timeout or connection error
    exit_code=$?
    if [ $exit_code -eq 124 ] || [ $exit_code -eq 28 ]; then
        echo "⏱️  Request timed out after 10 minutes"
        echo "   (Video generation may take longer - this is normal for some models)"
        echo "   Continuing to next attempt..."
        delay=$((delay + 60))
        attempt=$((attempt + 1))
        continue
    elif [ $exit_code -ne 0 ]; then
        echo "❌ Connection error (exit code: $exit_code)"
        echo "   Response: ${response:0:200}"
        delay=$((delay + 10))
        attempt=$((attempt + 1))
        continue
    fi
    
    # Check if we got a response
    if [ -z "$response" ]; then
        echo "❌ No response received"
        delay=$((delay + 10))
        attempt=$((attempt + 1))
        continue
    fi
    
    # Parse JSON response
    success=$(echo "$response" | grep -o '"success":[^,}]*' | grep -o 'true\|false' | head -1)
    error=$(echo "$response" | grep -o '"error":"[^"]*"' | head -1)
    video_url=$(echo "$response" | grep -o '"video":"[^"]*"' | head -1)
    
    echo "Response:"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    echo ""
    
    # Check for success
    if [ "$success" = "true" ]; then
        echo "🎉 SUCCESS! Video generated!"
        echo ""
        if [ ! -z "$video_url" ]; then
            echo "Video URL: $video_url"
            echo ""
            echo "$response" | python3 -m json.tool > "success_response_$(date +%Y%m%d_%H%M%S).json"
            echo "✅ Full response saved to success_response_*.json"
        fi
        exit 0
    fi
    
    # Check error type
    if echo "$error" | grep -q "429\|Rate limit\|throttled"; then
        echo "⏳ Rate limited - increasing delay..."
        delay=$((delay + 30))
        if [ $delay -gt $MAX_DELAY ]; then
            delay=$MAX_DELAY
        fi
    elif echo "$error" | grep -q "402\|Payment Required\|Insufficient credit"; then
        echo "💳 Payment required - models need credits"
        echo "   Visit: https://replicate.com/account/billing"
        delay=$((delay + 60))  # Wait longer for payment errors
    elif echo "$error" | grep -q "404\|Not Found"; then
        echo "❌ Model not found (404) - trying next model in list..."
        delay=$INITIAL_DELAY  # Reset delay for 404s
    else
        echo "⚠️  Other error - retrying with delay..."
        delay=$((delay + 15))
    fi
    
    attempt=$((attempt + 1))
    echo ""
done

echo "❌ Max attempts reached ($MAX_ATTEMPTS). Could not generate video."
echo "💡 Suggestions:"
echo "   1. Add credits to Replicate: https://replicate.com/account/billing"
echo "   2. Wait longer for rate limits to reset"
echo "   3. Check server logs for more details"
exit 1

