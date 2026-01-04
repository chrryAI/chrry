#!/bin/bash

# Replace all @tamagui/lucide-icons imports with ./icons
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/icons/*" -exec sed -i '' 's/@tamagui\/lucide-icons/\.\/icons/g' {} +

echo "✅ Replaced all @tamagui/lucide-icons imports with ./icons"
