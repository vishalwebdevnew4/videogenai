#!/bin/bash
# Test rate-limited models after waiting for rate limit to reset

echo "=========================================="
echo "Retesting Rate-Limited Models"
echo "Waiting 60 seconds for rate limit to reset..."
echo "=========================================="
echo ""

# Load environment variables
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | grep -E "REPLICATE_API_TOKEN|FAL_KEY" | xargs)
fi

if [ -z "$REPLICATE_API_TOKEN" ]; then
    echo "❌ REPLICATE_API_TOKEN not set"
    exit 1
fi

# Models that were rate-limited (might work after waiting)
rate_limited_models=(
    "stability-ai/stable-video-diffusion:Stable Diffusion video"
    "meta/animate-anyone:Meta animation model"
    "wan-video/wan-2.5-t2v-fast:Wan fast text-to-video"
    "wan-video/wan-2.5-i2v-fast:Wan fast image-to-video"
    "wan-video/wan-2.5-i2v:Wan image-to-video"
    "wavespeedai/wan-2.1-i2v-480p:Wan 2.1 480p"
    "wavespeedai/wan-2.1-t2v-480p:Wan 2.1 text 480p"
    "ali-vilab/i2vgen-xl:I2VGen XL"
    "anotherjesse/zeroscope-v2-xl:Zeroscope V2 XL"
    "anotherjesse/zeroscope-v2-576w:Zeroscope V2 576w"
    "fofr/video-morpher:Video Morpher"
    "cjwbw/text2video-zero:Text2Video Zero"
)

working=()
still_rate_limited=()
payment_required=()
not_found=()
errors=()

total=${#rate_limited_models[@]}
current=0

# Wait for rate limit to reset
echo "⏳ Waiting 60 seconds for rate limit to reset..."
sleep 60
echo "✅ Starting retests..."
echo ""

for model_info in "${rate_limited_models[@]}"; do
    IFS=':' read -r model description <<< "$model_info"
    current=$((current + 1))
    
    echo "[$current/$total] Retesting: $model"
    echo "    Description: $description"
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        "https://api.replicate.com/v1/models/$model/predictions" \
        -H "Authorization: Token $REPLICATE_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"input": {"prompt": "a cat walking"}}' \
        --max-time 10)
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    case $http_code in
        201)
            echo "    ✅ WORKING - Model is accessible!"
            working+=("$model:$description")
            ;;
        402)
            echo "    💳 Payment Required"
            payment_required+=("$model:$description")
            ;;
        404)
            echo "    ❌ Not Found (404)"
            not_found+=("$model:$description")
            ;;
        429)
            echo "    ⏳ Still Rate Limited (wait longer)"
            still_rate_limited+=("$model:$description")
            ;;
        *)
            echo "    ❌ Error: HTTP $http_code"
            errors+=("$model:$description:HTTP $http_code")
            ;;
    esac
    
    # Wait between requests
    if [ $current -lt $total ]; then
        echo "    Waiting 5 seconds before next test..."
        sleep 5
    fi
    echo ""
done

# Print summary
echo "=========================================="
echo "RETEST SUMMARY"
echo "=========================================="
echo ""

echo "✅ Now Working (${#working[@]}):"
for item in "${working[@]}"; do
    IFS=':' read -r model desc <<< "$item"
    echo "   - $model: $desc"
done

echo ""
echo "⏳ Still Rate Limited (${#still_rate_limited[@]}):"
for item in "${still_rate_limited[@]}"; do
    IFS=':' read -r model desc <<< "$item"
    echo "   - $model: $desc"
done

echo ""
echo "💳 Payment Required (${#payment_required[@]}):"
for item in "${payment_required[@]}"; do
    IFS=':' read -r model desc <<< "$item"
    echo "   - $model: $desc"
done

echo ""
echo "❌ Not Found (${#not_found[@]}):"
for item in "${not_found[@]}"; do
    IFS=':' read -r model desc <<< "$item"
    echo "   - $model: $desc"
done

# Save results
cat > model_retest_results.txt << EOF
Now Working (${#working[@]}):
$(for item in "${working[@]}"; do echo "  - $item"; done)

Still Rate Limited (${#still_rate_limited[@]}):
$(for item in "${still_rate_limited[@]}"; do echo "  - $item"; done)

Payment Required (${#payment_required[@]}):
$(for item in "${payment_required[@]}"; do echo "  - $item"; done)

Not Found (${#not_found[@]}):
$(for item in "${not_found[@]}"; do echo "  - $item"; done)
EOF

echo ""
echo "✅ Results saved to: model_retest_results.txt"

if [ ${#working[@]} -gt 0 ]; then
    echo ""
    echo "📝 UPDATE CODE WITH WORKING MODELS:"
    echo "const textModels = ["
    for item in "${working[@]}"; do
        IFS=':' read -r model desc <<< "$item"
        echo "  '$model',  // ✅ WORKING - $desc"
    done
    echo "]"
fi

