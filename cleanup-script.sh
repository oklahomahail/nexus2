#!/bin/bash

echo "🧹 Cleaning up migration issues..."

# Remove duplicate KPIWidget imports from any files
echo "Removing duplicate imports..."
for file in $(find src -name "*.tsx" -o -name "*.ts"); do
  if [ -f "$file" ]; then
    # Create temp file with deduplicated imports
    awk '
    /import.*KPIWidget/ {
      if (!seen) {
        seen = 1
        print
      }
      next
    }
    { print }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
done

echo "✅ Duplicate imports cleaned"

# Fix any remaining MetricCard references
echo "Checking for remaining MetricCard issues..."
if grep -r "MetricCard" src/ --include="*.tsx" --include="*.ts"; then
  echo "⚠️  Found remaining MetricCard references - manual review needed"
else
  echo "✅ No MetricCard references found"
fi

# Fix any remaining StatCard references  
echo "Checking for remaining StatCard issues..."
if grep -r "StatCard" src/ --include="*.tsx" --include="*.ts"; then
  echo "⚠️  Found remaining StatCard references - manual review needed"
else
  echo "✅ No StatCard references found"
fi

echo ""
echo "🎉 Cleanup completed!"
echo ""
echo "Next steps:"
echo "• node validate-migration.js --verbose"
echo "• npx tsc --noEmit"
echo "• npm run dev"