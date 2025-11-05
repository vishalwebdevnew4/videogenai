# 🧪 Continuous Test Status

## Test Configuration

- **Script**: `test_until_success.sh`
- **Max Attempts**: 50
- **Timeout per Request**: 10 minutes (600 seconds)
- **Initial Delay**: 30 seconds between attempts
- **Max Delay**: 300 seconds (5 minutes)

## Why 10-Minute Timeout?

Video generation can take a long time:
- **Fast models**: 30-60 seconds
- **Standard models**: 2-5 minutes
- **High-quality models**: 5-10+ minutes

The test script will wait up to 10 minutes per attempt to allow video generation to complete.

## Current Status

✅ **Test is running** - Will keep retrying until success

### Monitor Progress

```bash
# Watch live progress
tail -f test_attempts.log

# Check status
ps aux | grep test_until_success

# Check server logs
tail -f /tmp/nextjs-server.log
```

## Expected Behavior

1. **Rate Limits (429)**: Will wait longer between attempts
2. **Payment Required (402)**: Will note this and continue trying
3. **Model Not Found (404)**: Will skip to next model
4. **Timeouts**: Will retry with longer delays
5. **Success**: Will exit immediately and save response

## Success Criteria

The test will succeed when:
- ✅ `"success": true` in response
- ✅ `"video"` URL is returned
- ✅ Response is saved to `success_response_*.json`

## Troubleshooting

If test keeps timing out:
1. **Check server logs**: `tail -f /tmp/nextjs-server.log`
2. **Verify API keys**: Check `.env.local` has valid tokens
3. **Check Replicate account**: May need credits for models
4. **Wait longer**: Some models legitimately take 10+ minutes

## Next Steps After Success

Once test succeeds:
1. Response will be saved to `success_response_*.json`
2. Video URL will be displayed
3. You can use this to verify the API works end-to-end
4. Test script will exit with code 0

