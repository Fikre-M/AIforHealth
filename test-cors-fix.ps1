# PowerShell script to test CORS fix
Write-Host "Testing CORS configuration..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health endpoint with Origin header
Write-Host "Test 1: Health endpoint with CORS" -ForegroundColor Yellow
$headers = @{'Origin'='https://fridayhealth-123.netlify.app'}
try {
    $response = Invoke-WebRequest -Uri 'https://aiforhealth-2.onrender.com/health' -Headers $headers -UseBasicParsing
    $corsHeader = $response.Headers['Access-Control-Allow-Origin']
    
    if ($corsHeader -eq 'https://fridayhealth-123.netlify.app') {
        Write-Host "✅ CORS Header: $corsHeader" -ForegroundColor Green
        Write-Host "✅ CORS is working correctly!" -ForegroundColor Green
    } elseif ([string]::IsNullOrEmpty($corsHeader)) {
        Write-Host "❌ CORS Header: (empty)" -ForegroundColor Red
        Write-Host "⚠️  Render may still be deploying. Wait 2-3 minutes and try again." -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  CORS Header: $corsHeader" -ForegroundColor Yellow
        Write-Host "⚠️  Unexpected CORS header value" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test 2: Login endpoint with CORS" -ForegroundColor Yellow
$headers = @{
    'Content-Type'='application/json'
    'Origin'='https://fridayhealth-123.netlify.app'
}
$body = '{"email":"test@example.com","password":"test123"}'

try {
    $response = Invoke-WebRequest -Uri 'https://aiforhealth-2.onrender.com/api/v1/auth/login' -Method POST -Headers $headers -Body $body -UseBasicParsing
} catch {
    $response = $_.Exception.Response
    if ($response) {
        $corsHeader = $response.Headers['Access-Control-Allow-Origin']
        $statusCode = [int]$response.StatusCode
        
        if ($corsHeader -eq 'https://fridayhealth-123.netlify.app') {
            Write-Host "✅ CORS Header: $corsHeader" -ForegroundColor Green
            Write-Host "✅ Status Code: $statusCode (expected 401 for invalid credentials)" -ForegroundColor Green
            Write-Host "✅ Login endpoint CORS is working!" -ForegroundColor Green
        } elseif ([string]::IsNullOrEmpty($corsHeader)) {
            Write-Host "❌ CORS Header: (empty)" -ForegroundColor Red
            Write-Host "❌ Status Code: $statusCode" -ForegroundColor Red
        } else {
            Write-Host "⚠️  CORS Header: $corsHeader" -ForegroundColor Yellow
            Write-Host "⚠️  Status Code: $statusCode" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. If CORS headers are empty, wait 2-3 minutes for Render to deploy" -ForegroundColor White
Write-Host "2. Run this script again: .\test-cors-fix.ps1" -ForegroundColor White
Write-Host "3. If still failing after 5 minutes, check Render logs" -ForegroundColor White
Write-Host "4. Once CORS is working, test login at https://fridayhealth-123.netlify.app" -ForegroundColor White
