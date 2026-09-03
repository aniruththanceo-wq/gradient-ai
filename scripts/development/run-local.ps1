$ErrorActionPreference = "Stop"

Write-Host "Starting Gradient AI local services"
docker compose up -d postgres

Write-Host "Backend: cd backend; uvicorn app.main:app --reload"
Write-Host "Frontend: cd frontend; npm run dev"

