#!/bin/bash

# Navigate to the project root (assumes script is run from infrastructure/scripts/)
cd "$(dirname "$0")/.."

# Build Jekyll site
echo "Building Jekyll site..."
bundle exec jekyll build --quiet

# Navigate to Terraform directory
cd infrastructure/terraform

# Get bucket names from Terraform output
PRIMARY_BUCKET=$(terraform output -raw primary_bucket_name 2>/dev/null)
SECONDARY_BUCKET=$(terraform output -raw secondary_bucket_name 2>/dev/null)

# Navigate back to project root
cd ../..

# Upload to primary bucket using gcloud storage
echo "Uploading to primary bucket: $PRIMARY_BUCKET"
gcloud storage rsync _site/ gs://$PRIMARY_BUCKET/ --recursive --delete-unmatched-destination-objects

# Upload to secondary bucket using gcloud storage
echo "Uploading to secondary bucket: $SECONDARY_BUCKET"
gcloud storage rsync _site/ gs://$SECONDARY_BUCKET/ --recursive --delete-unmatched-destination-objects

echo "✅ Deployment complete!"

# Invalidate CDN cache
echo "Invalidating CDN cache..."
gcloud compute url-maps invalidate-cdn-cache hash-house-harriers-url-map --path "/*" --async

echo ""
echo "Your sites should be available at:"
echo "  • https://hashhouseharriersjakarta.com"
echo "  • https://jakartahash.com"
echo ""
echo "Note: SSL certificates may take 10-60 minutes to provision after DNS propagation."
