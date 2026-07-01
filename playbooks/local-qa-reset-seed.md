# Local QA Reset and Seed

Use this workflow when you need a repeatable first-run test of the local dashboard. It resets only
local development data stored in `.job-agent/job-agent.sqlite3`.

## Reset Local Data

1. Stop `pnpm dev` and any running API process.
2. Back up the current local database if you may need it:

   ```powershell
   New-Item -ItemType Directory -Force .job-agent\backup
   if (Test-Path .job-agent\job-agent.sqlite3) {
     Copy-Item .job-agent\job-agent.sqlite3 .job-agent\backup\job-agent.$((Get-Date).ToString("yyyyMMdd-HHmmss")).sqlite3
   }
   ```

3. Remove the working database:

   ```powershell
   Remove-Item .job-agent\job-agent.sqlite3 -ErrorAction SilentlyContinue
   ```

4. Start the app again:

   ```powershell
   pnpm dev
   ```

The API recreates the SQLite database on first use.

## Seed Knowledge Entries

With `pnpm dev` running, seed a few non-sensitive records:

```powershell
$api = "http://127.0.0.1:8000"
$headers = @{ "Content-Type" = "application/json" }

Invoke-RestMethod "$api/knowledge" -Method Post -Headers $headers -Body (@{
  section = "personal"
  entryType = "scalar"
  title = "Email"
  content = "candidate@example.com"
  companyName = $null
  sortOrder = 0
} | ConvertTo-Json)

Invoke-RestMethod "$api/knowledge" -Method Post -Headers $headers -Body (@{
  section = "behavioral_answers"
  entryType = "long_form"
  title = "Tell me about yourself"
  content = "Short QA seed answer for browser testing."
  companyName = $null
  sortOrder = 10
} | ConvertTo-Json)
```

Resume seeding is intentionally manual because uploads should exercise the browser file picker and
PDF validation path.
