# Script to set environment variables in Vercel
$token = "APP_USR-5293198813101462-041503-aed5a78c67fd960cffd145f1397e93e1-3337978854"
$appUrl = "https://guitarla-ts-main.vercel.app"

# Set MP_ACCESS_TOKEN
Write-Host "Adding MP_ACCESS_TOKEN to Vercel..."
$token | & vercel env add MP_ACCESS_TOKEN production

Write-Host "MP_ACCESS_TOKEN added successfully"
