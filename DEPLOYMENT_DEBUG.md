# Deployment Debugging Guide

## Issue: 500 Internal Server Error on Vercel

### Status
The `/api/analyze-candidate` endpoint returns a 500 error on the Vercel deployment, but works locally.

### Root Causes & Solutions

#### 1. **Missing or Incorrect Environment Variables**
The most common cause of 500 errors on Vercel.

**Required Variables:**
- `GEMINI_API_KEY` - Must be set and valid
- `GITHUB_TOKEN` - Must have `public_repo` scope access
- `OPENAI_API_KEY` - Optional, but needed if using OpenAI fallback
- `AI_PRIMARY_PROVIDER` - Set to "gemini" or "openai"
- `GEMINI_MODEL` - Default: `gemini-2.5-flash`
- `OPENAI_MODEL` - Default: `gpt-4o-mini`

**Action Items:**
1. Go to Vercel project settings → Environment Variables
2. Add all missing variables from `backend/.env.example`
3. Redeploy the project after updating env vars

#### 2. **Outdated Code on Vercel**
Recent changes to the AI provider fallback system may not be deployed.

**Action Items:**
1. Push all changes to Git
2. Trigger a redeploy in Vercel
3. Check deployment logs for build errors

#### 3. **Code Issues (if still failing after above steps)**

**Check for:**
- Import errors: All modules must export correctly
  - `llm-provider.js` must export `generateLlmText`
  - `gemini.js` must export `generateGeminiContent`
  - `openai.js` must export `generateOpenAiContent` and `isOpenAiConfigured`
  
- Configuration errors: `env.js` must properly parse all environment variables
  
- Database connection: MongoDB is optional; logs will show "skipped" if not configured

#### 4. **GitHub API Rate Limiting**
If you've exhausted GitHub API quota.

**Solution:**
- Use a different GitHub token with higher rate limit
- Implement caching for GitHub profile data

#### 5. **AI Provider Quota Exceeded**
If all Gemini and OpenAI models are hitting quota limits.

**Solutions:**
- Configure both Gemini and OpenAI API keys
- Set `AI_PRIMARY_PROVIDER=openai` to switch primary provider
- Add more fallback models to `GEMINI_FALLBACK_MODELS` and `OPENAI_FALLBACK_MODELS`

---

## Testing Locally

To test the full flow before deployment:

```bash
# Install dependencies
npm install

# Create .env file in backend/ directory (copy from .env.example)
cp backend/.env.example backend/.env

# Edit backend/.env with your API keys

# Start dev servers
npm run dev

# Test the endpoint
curl -X POST http://localhost:5000/api/analyze-candidate \
  -F "resume=@path/to/resume.pdf" \
  -F "githubUsername=torvalds"
```

---

## Vercel Deployment Checklist

- [ ] All environment variables added to Vercel project settings
- [ ] Code pushed to main branch
- [ ] Deployment triggered and completed successfully
- [ ] Check Vercel build logs for errors
- [ ] Test endpoint with curl or frontend
- [ ] Check Vercel function logs if still failing

---

## Provider Fallback Behavior

### Default Setup (Gemini Primary)
1. Try: `gemini-2.5-flash`
2. Try: `gemini-2.0-flash` (if 1 fails with retryable error)
3. Try: `gemini-1.5-flash-001` (if 2 fails with retryable error)
4. Fallback: `OpenAI` provider (if all Gemini models exhausted and `OPENAI_API_KEY` set)

### OpenAI Primary Setup
1. Try: `gpt-4o-mini`
2. Try: `gpt-4o-mini` again from fallback models (if 1 fails with retryable error)
3. Fallback: `Gemini` provider (if OpenAI exhausted and `GEMINI_API_KEY` set)

### Retryable Errors
The system automatically falls back to the next provider/model on these errors:
- 429 (Too Many Requests)
- 500, 502, 503 (Server Errors)
- "quota exceeded"
- "rate limit"
- "resource_exhausted"
- "service unavailable"

---

## Contact & Support

If issues persist:
1. Check Vercel function logs: `vercel logs <deployment-url>`
2. Enable debug logging by setting `LOG_LEVEL=debug` (if supported)
3. Review the error message carefully - it usually indicates the exact problem
