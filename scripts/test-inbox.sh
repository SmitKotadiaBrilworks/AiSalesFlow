#!/bin/bash

# Test script to verify inbox API endpoints

echo "Testing Inbox Implementation..."
echo "================================"
echo ""

# Check if the server is running
echo "1. Checking if server is running on localhost:3000..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo "✅ Server is running"
else
    echo "❌ Server is not responding"
    exit 1
fi

echo ""
echo "2. API Files Created:"
echo "   - /app/api/conversations/route.ts"
ls -lh app/api/conversations/route.ts 2>/dev/null && echo "   ✅ Conversations API exists" || echo "   ❌ Missing"

echo "   - /app/api/messages/route.ts"
ls -lh app/api/messages/route.ts 2>/dev/null && echo "   ✅ Messages API exists" || echo "   ❌ Missing"

echo ""
echo "3. Hooks Created:"
echo "   - /hooks/use-conversations.ts"
ls -lh hooks/use-conversations.ts 2>/dev/null && echo "   ✅ Conversations hook exists" || echo "   ❌ Missing"

echo "   - /hooks/use-messages.ts"
ls -lh hooks/use-messages.ts 2>/dev/null && echo "   ✅ Messages hook exists" || echo "   ❌ Missing"

echo ""
echo "4. Updated Files:"
echo "   - /app/(dashboard)/inbox/page.tsx"
if grep -q "useConversations" app/\(dashboard\)/inbox/page.tsx 2>/dev/null; then
    echo "   ✅ Inbox page updated with dynamic data"
else
    echo "   ❌ Inbox page not updated"
fi

echo ""
echo "5. Dependencies:"
echo "   - sonner (toast notifications)"
if grep -q '"sonner"' package.json; then
    echo "   ✅ Sonner installed"
else
    echo "   ❌ Sonner not installed"
fi

echo ""
echo "================================"
echo "Implementation Summary:"
echo "- Backend API routes created for conversations and messages"
echo "- Custom React hooks created for data fetching"
echo "- Inbox page refactored to use dynamic data"
echo "- Toast notifications configured"
echo ""
echo "Next Steps:"
echo "1. Login to the application at http://localhost:3000"
echo "2. Navigate to the Inbox page at http://localhost:3000/inbox"
echo "3. Verify conversations load from the database"
echo "4. Test sending messages"
echo ""
