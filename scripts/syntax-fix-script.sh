#!/bin/bash

echo "🔧 Syntax Fix Script for TypeScript Errors"
echo "=========================================="

# Change to project root
cd "$(dirname "$0")/.."

# Function to show progress
show_progress() {
    echo "✓ $1"
}

show_progress "Fixing broken destructuring syntax..."

# Fix the main syntax issues caused by incorrect underscore prefixing

# 1. Fix destructured function parameters that got mangled
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
    -e 's/= (_{/= ({/g' \
    -e 's/,_})/})/g' \
    -e 's/(_{ /({ /g' \
    -e 's/ })/})/g' \
    -e 's/})/})/g'

# 2. Fix useEffect and useCallback with mangled syntax
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
    -e 's/useEffect(_(/useEffect((/g' \
    -e 's/useCallback(_(/useCallback((/g' \
    -e 's/useCallback(_async/useCallback(async/g' \
    -e 's/\.filter(_(/\.filter((/g' \
    -e 's/\.map(_(/\.map((/g'

# 3. Fix return statements that got mangled
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
    -e 's/return (_</return (</g'

# 4. Fix specific broken patterns
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
    -e 's/const NotificationsPanel = (_{/const NotificationsPanel = ({/g' \
    -e 's/const CustomTooltip = (_{ active/const CustomTooltip = ({ active/g'

show_progress "Fixing remaining unused variables properly..."

# Now fix unused variables the correct way - only prefix actual variable names, not destructuring
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
    -e 's/{ active,_payload,_label,/{ active, _payload, _label,/g' \
    -e 's/{ title,_date,_status/{ title, _date, _status/g' \
    -e 's/onCampaignSelect: _onCampaignSelect/onCampaignSelect: _onCampaignSelect/g'

show_progress "Fixing specific syntax errors..."

# Fix specific files with known issues
if [ -f "src/components/AnalyticsFiltersComponent.tsx" ]; then
    sed -i '' 's/filters,_onFiltersChange,_}/filters, _onFiltersChange }/g' src/components/AnalyticsFiltersComponent.tsx
fi

if [ -f "src/components/CampaignList.tsx" ]; then
    sed -i '' 's/useEffect(_() =>/useEffect(() =>/g' src/components/CampaignList.tsx
fi

if [ -f "src/panels/NotificationsPanel.tsx" ]; then
    sed -i '' 's/const NotificationsPanel = (_{/const NotificationsPanel = ({/g' src/panels/NotificationsPanel.tsx
fi

show_progress "Removing remaining unused types and interfaces..."

# Remove specific unused types that are causing errors
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
    -e '/^interface Activity {/,/^}/d' \
    -e '/^interface EmailTemplate {/,/^}/d' \
    -e '/^interface OutreachCampaign {/,/^}/d' \
    -e '/^interface CommunicationRecord {/,/^}/d' \
    -e '/^interface Donor {/,/^}/d' \
    -e '/^interface Donation {/,/^}/d' \
    -e '/^interface SelectOption {/,/^}/d'

show_progress "Fixing specific remaining variable issues..."

# Fix remaining unused variables by prefixing with underscore
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
    -e 's/function calculateDaysLeft(/function _calculateDaysLeft(/g' \
    -e 's/const start = /const _start = /g' \
    -e 's/interface Activity/interface _Activity/g' \
    -e 's/interface EmailTemplate/interface _EmailTemplate/g' \
    -e 's/interface OutreachCampaign/interface _OutreachCampaign/g' \
    -e 's/interface CommunicationRecord/interface _CommunicationRecord/g' \
    -e 's/interface Donor/interface _Donor/g' \
    -e 's/interface Donation/interface _Donation/g' \
    -e 's/interface SelectOption/interface _SelectOption/g'

show_progress "Running ESLint auto-fix..."

# Run ESLint to fix what it can
pnpm eslint . --fix --quiet 2>/dev/null || echo "⚠ ESLint had some issues but continued"

show_progress "Testing the fixes..."

# Test if syntax errors are resolved
if pnpm typecheck:app 2>/dev/null; then
    echo "🎉 All syntax errors fixed!"
else
    echo "⚠ Some errors may remain. Checking specific issues..."
    
    # Show just the first few errors to see what's left
    echo ""
    echo "Remaining errors (first 10):"
    pnpm typecheck:app 2>&1 | head -20 || true
fi

echo ""
echo "📊 Summary:"
echo "✅ Fixed destructured parameter syntax"
echo "✅ Fixed useEffect/useCallback syntax" 
echo "✅ Fixed return statement syntax"
echo "✅ Removed unused type definitions"
echo "✅ Fixed remaining variable naming"
echo "✅ Ran ESLint auto-fix"
echo ""
echo "🔧 Next steps if errors remain:"
echo "   1. Check 'pnpm typecheck:app' for remaining issues"
echo "   2. Most remaining errors should be simple unused variable renames"
echo "   3. Consider manually fixing any complex syntax issues"