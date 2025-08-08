# Checks .env and .env.dev files are the same
$envFile = ".env"
$envDevFile = ".env.dev"

if ((Test-Path $envFile) -and (Test-Path $envDevFile)) {
    $envFileContent = Get-Content $envFile
    $envDevFileContent = Get-Content $envDevFile

    if (($envFileContent -join "`n") -ne ($envDevFileContent -join "`n")) {
        Write-Host "[ERROR] The .env and .env.dev files are different, please ensure they are synchronized"
        Exit 1
    } else {
        Write-Host "[OK] The .env and .env.dev files are the same."
    }
} else {
    Write-Host "[ERROR] One or both of the files .env and .env.dev do not exist."
    Exit 1
}

# Copy .env.prod to .env if it exists
$envProdFile = ".env.prod"
if (Test-Path $envProdFile) {
    Write-Host "Copying $envProdFile to $envFile..."
    Copy-Item -Path $envProdFile -Destination $envFile -Force
    Write-Host "[OK] Copied $envProdFile to $envFile."
} else {
    Write-Host "[ERROR] The file $envProdFile does not exist!"
    Exit 1
}

Write-Host "Building standalone Next.js app..."
& bun run build
$nextBuildResult = $LASTEXITCODE
Write-Host "Next.js build result: $nextBuildResult"
if ($nextBuildResult -ne 0) {
    Write-Host "[ERROR] Next.js build failed."

    # Copy back .env.dev to .env
    Copy-Item -Path $envDevFile -Destination $envFile -Force

    Exit 1
} else {
    Write-Host "[OK] Next.js build completed successfully."
}

Write-Host "Copying public and static directories to the build output..."
Copy-Item -Path "public" -Destination ".next/standalone" -Recurse -Force
Copy-Item -Path ".next/static" -Destination ".next/standalone/.next" -Recurse -Force

Write-Host "Zipping the build output..."
tar -czf "nextjs-app.tar.gz" .next/standalone

Write-Host "Cleaning up..."
# Copy back .env.dev to .env
Copy-Item -Path $envDevFile -Destination $envFile -Force

Write-Host "Sending the build output to the server..."
scp ./nextjs-app.tar.gz programordie@hackclub.app:/tmp

Write-Host "Build and deployment process completed successfully."
Exit 0