#!/bin/bash
# Comprehensive test script for all free AI video models using curl

echo "=========================================="
echo "Testing All Free AI Video Models"
echo "=========================================="
echo ""

# Load environment variables
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | grep -E "REPLICATE_API_TOKEN|FAL_KEY" | xargs)
fi

# Check if API token is set
if [ -z "$REPLICATE_API_TOKEN" ]; then
    echo "❌ REPLICATE_API_TOKEN not set in .env.local"
    echo "Please add your Replicate API token to .env.local"
    exit 1
fi

echo "✅ API Token found"
echo ""

# List of models to test
models=(
    "lucataco/animate-lcm:Fast animation model"
    "stability-ai/stable-video-diffusion:Stable Diffusion video"
    "meta/animate-anyone:Meta animation model"
    "wan-video/wan-2.5-t2v-fast:Wan fast text-to-video"
    "wan-video/wan-2.5-t2v:Wan text-to-video"
    "wan-video/wan-2.5-i2v-fast:Wan fast image-to-video"
    "wan-video/wan-2.5-i2v:Wan image-to-video"
    "wavespeedai/wan-2.1-i2v-480p:Wan 2.1 480p"
    "wavespeedai/wan-2.1-t2v-480p:Wan 2.1 text 480p"
    "cjwbw/videocrafter2:VideoCrafter 2"
    "ali-vilab/i2vgen-xl:I2VGen XL"
    "anotherjesse/zeroscope-v2-xl:Zeroscope V2 XL"
    "anotherjesse/zeroscope-v2-576w:Zeroscope V2 576w"
    "fofr/tooncrafter:ToonCrafter"
    "fofr/video-morpher:Video Morpher"
    "cjwbw/text2video-zero:Text2Video Zero"
)

working=()
payment_required=()
not_found=()
rate_limited=()
errors=()

total=${#models[@]}
current=0

for model_info in "${models[@]}"; do
    IFS=':' read -r model description <<< "$model_info"
    current=$((current + 1))
    
    echo "[$current/$total] Testing: $model"
    echo "    Description: $description"
    
    # Test the model via Replicate API
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
            echo "    ✅ WORKING - Model is accessible"
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
            echo "    ⏳ Rate Limited (429)"
            rate_limited+=("$model:$description")
            ;;
        *)
            echo "    ❌ Error: HTTP $http_code"
            errors+=("$model:$description:HTTP $http_code")
            ;;
    esac
    
    # Wait between requests
    if [ $current -lt $total ]; then
        echo "    Waiting 2 seconds before next test..."
        sleep 2
    fi
    echo ""
done

# Print summary
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo ""

echo "✅ Working Models (${#working[@]}):"
for item in "${working[@]}"; do
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

echo ""
echo "⏳ Rate Limited (${#rate_limited[@]}):"
for item in "${rate_limited[@]}"; do
    IFS=':' read -r model desc <<< "$item"
    echo "   - $model: $desc"
done

echo ""
echo "❌ Errors (${#errors[@]}):"
for item in "${errors[@]}"; do
    echo "   - $item"
done

# Generate results file
cat > model_test_results.txt << EOF
Working Models (${#working[@]}):
$(for item in "${working[@]}"; do echo "  - $item"; done)

Payment Required (${#payment_required[@]}):
$(for item in "${payment_required[@]}"; do echo "  - $item"; done)

Not Found (${#not_found[@]}):
$(for item in "${not_found[@]}"; do echo "  - $item"; done)

Rate Limited (${#rate_limited[@]}):
$(for item in "${rate_limited[@]}"; do echo "  - $item"; done)

Errors (${#errors[@]}):
$(for item in "${errors[@]}"; do echo "  - $item"; done)
EOF

echo ""
echo "✅ Results saved to: model_test_results.txt"

# Generate code suggestion
if [ ${#working[@]} -gt 0 ]; then
    echo ""
    echo "📝 Suggested Model List Update:"
    echo "const textModels = ["
    for item in "${working[@]}"; do
        IFS=':' read -r model desc <<< "$item"
        echo "  '$model',  // ✅ WORKING - $desc"
    done
    echo "]"
fi

