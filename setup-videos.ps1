# PowerShell script to create symbolic link to videos folder
# Run as Administrator

$source = "..\Videos"
$target = ".\public\videos"

# Remove existing videos folder if it exists
if (Test-Path $target) {
    Remove-Item $target -Recurse -Force
}

# Create symbolic link (requires admin)
cmd /c mklink /D $target $source

Write-Host "Video folder linked successfully!"
Write-Host "Your videos are now accessible at /videos/ in the app"
