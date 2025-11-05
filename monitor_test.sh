#!/bin/bash

# Monitor the test progress
echo "📊 Monitoring test progress..."
echo ""

while true; do
    clear
    echo "=========================================="
    echo "🧪 API Test Monitor - $(date +%H:%M:%S)"
    echo "=========================================="
    echo ""
    
    if [ -f "test_attempts.log" ]; then
        echo "📝 Latest Test Attempts:"
        echo "----------------------------------------"
        tail -20 test_attempts.log | grep -E "(Attempt|SUCCESS|Rate|Payment|Error|404|429)" || tail -10 test_attempts.log
        echo ""
    fi
    
    echo "🔍 Server Logs (recent):"
    echo "----------------------------------------"
    tail -15 /tmp/nextjs-test.log 2>/dev/null | grep -E "(✅|❌|Error|Model|Rate|Success|Trying)" || echo "No server logs yet..."
    echo ""
    
    # Check if test is still running
    if pgrep -f "test_until_success.sh" > /dev/null; then
        echo "✅ Test script is running..."
    else
        echo "⚠️  Test script may have finished"
        if grep -q "SUCCESS" test_attempts.log 2>/dev/null; then
            echo "🎉 SUCCESS DETECTED!"
        fi
    fi
    
    echo ""
    echo "Press Ctrl+C to stop monitoring"
    sleep 5
done

