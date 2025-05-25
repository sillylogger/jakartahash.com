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

# Upload to primary bucket (filter warnings but show file operations)
echo "Uploading to primary bucket: $PRIMARY_BUCKET"
gsutil -m rsync -r -d _site/ gs://$PRIMARY_BUCKET/ 2>&1 | grep -v "multiprocessing on MacOS" | grep -v "bugs.python.org"

# Upload to secondary bucket (filter warnings but show file operations)
echo "Uploading to secondary bucket: $SECONDARY_BUCKET"
gsutil -m rsync -r -d _site/ gs://$SECONDARY_BUCKET/ 2>&1 | grep -v "multiprocessing on MacOS" | grep -v "bugs.python.org"

# Set proper content types (show operations but filter warnings)
echo "Setting content types..."

# Only set HTML content types if HTML files exist
if gsutil ls gs://$PRIMARY_BUCKET/**/*.html >/dev/null 2>&1; then
    gsutil -q -m setmeta -h "Content-Type:text/html" gs://$PRIMARY_BUCKET/**/*.html 2>&1 | grep -v "multiprocessing on MacOS" | grep -v "bugs.python.org"
    gsutil -q -m setmeta -h "Content-Type:text/html" gs://$SECONDARY_BUCKET/**/*.html 2>&1 | grep -v "multiprocessing on MacOS" | grep -v "bugs.python.org"
fi

# Only set CSS content types if CSS files exist
if gsutil ls gs://$PRIMARY_BUCKET/**/*.css >/dev/null 2>&1; then
    gsutil -q -m setmeta -h "Content-Type:text/css" gs://$PRIMARY_BUCKET/**/*.css 2>&1 | grep -v "multiprocessing on MacOS" | grep -v "bugs.python.org"
    gsutil -q -m setmeta -h "Content-Type:text/css" gs://$SECONDARY_BUCKET/**/*.css 2>&1 | grep -v "multiprocessing on MacOS" | grep -v "bugs.python.org"
fi

# Only set JS content types if JS files exist
if gsutil ls gs://$PRIMARY_BUCKET/**/*.js >/dev/null 2>&1; then
    gsutil -q -m setmeta -h "Content-Type:application/javascript" gs://$PRIMARY_BUCKET/**/*.js 2>&1 | grep -v "multiprocessing on MacOS" | grep -v "bugs.python.org"
    gsutil -q -m setmeta -h "Content-Type:application/javascript" gs://$SECONDARY_BUCKET/**/*.js 2>&1 | grep -v "multiprocessing on MacOS" | grep -v "bugs.python.org"
fi

echo "✅ Deployment complete!"

# Invalidate CDN cache
echo "Invalidating CDN cache..."
gcloud compute url-maps invalidate-cdn-cache hash-house-harriers-url-map --path "/*" --quiet

echo ""
echo "Your sites should be available at:"
echo "  • https://hashhouseharriersjakarta.com"
echo "  • https://jakartahash.com"
echo ""
echo "Note: SSL certificates may take 10-60 minutes to provision after DNS propagation."
echo "CDN cache has been invalidated - changes should be visible within a few minutes."