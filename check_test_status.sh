#!/bin/bash

# Quick script to check test status

cd /var/www/html/videogenai-1

echo "📊 Test Status Check - $(date)"
echo "================================"
echo ""

# Check server
if lsof -ti:3001 > /dev/null; then
    echo "✅ Server: Running on port 3001"
else
    echo "❌ Server: Not running"
fi

# Check test process
TEST_COUNT=$(ps aux | grep -E '[b]ash.*test_until_success' | wc -l)
if [ $TEST_COUNT -gt 0 ]; then
    echo "✅ Test: Running ($TEST_COUNT process(es))"
else
    echo "❌ Test: Not running"
fi

# Check for success
if grep -q '"success":true\|SUCCESS' test_attempts.log 2>/dev/null; then
    echo ""
    echo "🎉🎉🎉 SUCCESS! 🎉🎉🎉"
    echo ""
    grep -A 5 "SUCCESS\|success.*true" test_attempts.log | tail -10
    echo ""
    # Check for success response file
    if ls success_response_*.json 2>/dev/null | head -1; then
        echo "✅ Success response saved!"
    fi
else
    echo ""
    echo "⏳ Status: Still testing..."
    echo ""
    echo "Latest activity:"
    tail -10 test_attempts.log 2>/dev/null | tail -5 || echo "  (No activity yet)"
    echo ""
    echo "Total attempts: $(grep -c 'Attempt.*of' test_attempts.log 2>/dev/null || echo '0')"
fi

echo ""
echo "📝 Full log: tail -f test_attempts.log"


