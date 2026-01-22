#!/bin/bash

# SEO Verification Script
# Verifies that all SEO optimizations are in place

echo "🔍 Verifying SEO Setup..."
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} Found: $1"
        return 0
    else
        echo -e "${RED}❌${NC} Missing: $1"
        return 1
    fi
}

# Function to check if string exists in file
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $3"
        return 0
    else
        echo -e "${YELLOW}⚠️${NC}  $3"
        return 1
    fi
}

echo "📁 Checking Files..."
echo "-------------------"
check_file "next.config.js"
check_file "public/robots.txt"
check_file "public/manifest.json"
check_file "src/app/sitemap.ts"
check_file "src/app/layout.tsx"
check_file "src/lib/seo-utils.ts"
check_file "src/components/StructuredData/StructuredData.tsx"
echo ""

echo "⚙️  Checking Next.js Configuration..."
echo "-------------------------------------"
check_content "next.config.js" "compress: true" "Compression enabled"
check_content "next.config.js" "swcMinify: true" "SWC minification enabled"
check_content "next.config.js" "optimizeCss" "CSS optimization enabled"
check_content "next.config.js" "image/avif" "AVIF image support"
check_content "next.config.js" "image/webp" "WebP image support"
echo ""

echo "🏷️  Checking Meta Tags..."
echo "------------------------"
check_content "src/app/layout.tsx" "title:" "Title meta tag"
check_content "src/app/layout.tsx" "description:" "Description meta tag"
check_content "src/app/layout.tsx" "keywords:" "Keywords meta tag"
check_content "src/app/layout.tsx" "openGraph:" "Open Graph tags"
check_content "src/app/layout.tsx" "twitter:" "Twitter Card tags"
check_content "src/app/layout.tsx" "manifest:" "PWA manifest link"
echo ""

echo "📊 Checking Structured Data..."
echo "------------------------------"
check_content "src/app/layout.tsx" "@context" "JSON-LD Schema present"
check_content "src/app/layout.tsx" "Organization" "Organization schema"
check_content "src/app/layout.tsx" "LocalBusiness" "LocalBusiness schema"
check_content "src/app/layout.tsx" "WebSite" "WebSite schema"
echo ""

echo "🤖 Checking robots.txt..."
echo "-------------------------"
check_content "public/robots.txt" "User-agent" "User-agent directive"
check_content "public/robots.txt" "Sitemap:" "Sitemap URL"
check_content "public/robots.txt" "Disallow: /admin" "Admin blocked"
check_content "public/robots.txt" "Disallow: /api" "API blocked"
echo ""

echo "🗺️  Checking Sitemap..."
echo "----------------------"
check_content "src/app/sitemap.ts" "priority:" "Priority settings"
check_content "src/app/sitemap.ts" "changeFrequency:" "Change frequency"
check_content "src/app/sitemap.ts" "lastModified:" "Last modified dates"
echo ""

echo "📱 Checking PWA Manifest..."
echo "--------------------------"
if [ -f "public/manifest.json" ]; then
    check_content "public/manifest.json" "\"name\":" "App name"
    check_content "public/manifest.json" "\"icons\":" "App icons"
    check_content "public/manifest.json" "\"theme_color\":" "Theme color"
fi
echo ""

echo "================================"
echo "✅ SEO Verification Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Run: npm run build"
echo "   2. Test locally: npm run start"
echo "   3. Check: http://localhost:3000/sitemap.xml"
echo "   4. Check: http://localhost:3000/robots.txt"
echo "   5. Check: http://localhost:3000/manifest.json"
echo ""
echo "🚀 For detailed report, run:"
echo "   node scripts/generate-seo-report.js"
echo ""
