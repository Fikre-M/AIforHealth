# Force Render Redeploy - Clear Cache

## The Issue

The CORS header `Access-Control-Allow-Origin` is still not being set, which means:

1. Render hasn't deployed the latest code yet, OR
2. Render is using cached build, OR
3. The environment variables aren't set correctly

## Steps to Force Redeploy

### Option 1: Clear Build Cache in Render Dashboard (RECOMMENDED)

1. Go to https://dashboard.render.com
2. Click on your `aiforhealth-backend` service
3. Click **Settings** tab
4. Scroll down to **Build & Deploy** section
5. Click **Clear build cache**
6. Go back to **Events** tab
7. Click **Manual Deploy** → **Clear build cache & deploy**

### Option 2: Make a Dummy Change and Push

```bash
# Add a comment to trigger rebuild
echo "# Force rebuild $(date)" >> backend/README.md
git add backend/README.md
git commit -m "chore: force rebuild to clear cache"
git push origin main
```

### Option 3: Verify and Set Environment Variables Manually

1. Go to Render Dashboard → Your Service → **Environment** tab
2. Verify these variables exist:
   - `CORS_ORIGIN` = `https://fridayhealth-123.netlify.app`
   - `FRONTEND_URL` = `https://fridayhealth-123.netlify.app`
   - `NODE_ENV` = `production`
3. If they don't exist, click **Add Environment Variable** and add them
4. After adding, click **Save Changes** - this will trigger a redeploy

## Verify the Fix

After redeployment (takes 2-3 minutes), test with PowerShell:

```powershell
$headers = @{'Origin'='https://fridayhealth-123.netlify.app'}
$response = Invoke-WebRequest -Uri 'https://aiforhealth-2.onrender.com/health' -Headers $headers -UseBasicParsing
Write-Host "CORS Header:" $response.Headers['Access-Control-Allow-Origin']
```

**Expected output:** `CORS Header: https://fridayhealth-123.netlify.app`

**Current output:** `CORS Header:` (empty)

## Check Render Logs

After deployment, check the logs for:

```
🔒 CORS Configuration: { environment: 'production', corsOriginEnv: 'https://fridayhealth-123.netlify.app', ... }
```

If you see `corsOriginEnv: undefined`, then the environment variable isn't set in Render.

## Alternative: Hardcode the URL (Quick Fix)

If environment variables aren't working, we can hardcode it:

Edit `backend/src/middleware/security.ts` line 23:

```typescript
const corsOrigin = 'https://fridayhealth-123.netlify.app'; // Hardcoded
```

Then commit and push.

## Netlify Cache Clear

Also clear Netlify cache:

1. Go to https://app.netlify.com
2. Click on your site
3. Go to **Deploys** tab
4. Click **Trigger deploy** → **Clear cache and deploy site**
