# Inbox Page - Dynamic Implementation

## Overview

The inbox page has been completely refactored to be fully dynamic, fetching conversations and messages from the MongoDB backend instead of using static mock data.

## What Was Implemented

### 1. Backend API Routes

#### `/api/conversations/route.ts`

- **GET**: Fetches all conversations (leads with messages) for a tenant
- Groups leads with their last message and unread count
- Formats timestamps dynamically (e.g., "10:30 AM", "Yesterday", "2 days ago")
- Returns conversation data with:
  - Lead information (name, email, initials)
  - Last message preview
  - Unread message count
  - Status and timestamps

#### `/api/messages/route.ts`

- **GET**: Fetches all messages for a specific lead
- **POST**: Creates a new message (user reply)
- Supports different sender types: `user`, `lead`, and `ai`
- Formats message timestamps
- Returns messages ordered chronologically

### 2. Custom React Hooks

#### `hooks/use-conversations.ts`

- `useConversations()`: Fetches conversations for the current user's tenant
- Uses TanStack Query for caching and state management
- Auto-refetches every 10 seconds for real-time updates
- Type-safe with `Conversation` interface

#### `hooks/use-messages.ts`

- `useMessages(leadId)`: Fetches messages for a specific lead
- `useSendMessage()`: Mutation hook for sending new messages
- Auto-refetches every 5 seconds for real-time chat updates
- Automatically invalidates cache after sending a message
- Type-safe with `Message` interface

### 3. Updated Inbox Page

#### New Features:

- **Dynamic Data Loading**: Fetches real conversations and messages from the database
- **Loading States**: Shows spinners while data is being fetched
- **Search Functionality**: Filter conversations by name, email, or message content
- **Auto-selection**: Automatically selects the first conversation on load
- **Real-time Updates**: Conversations refresh every 10s, messages every 5s
- **Send Messages**: Users can send replies with Enter key or button click
- **Unread Indicators**: Shows unread message count for each conversation
- **Auto-scroll**: Messages automatically scroll to bottom
- **Toast Notifications**: Success/error feedback when sending messages
- **Empty States**: Helpful messages when no conversations or messages exist

#### User Experience Improvements:

- Smooth transitions and hover effects
- Loading indicators during data fetches
- Disabled state for send button while sending
- Keyboard support (Enter to send)
- Visual distinction between user, lead, and AI messages
- Responsive layout maintained

## Database Schema Used

The implementation uses the existing MongoDB collections:

- **leads**: Contains lead information (name, email, status, etc.)
- **messages**: Contains conversation messages (content, sender, timestamps, etc.)

## Data Flow

1. User opens inbox page
2. `useConversations()` fetches all leads for the tenant
3. For each lead, the API aggregates the last message and unread count
4. User selects a conversation
5. `useMessages()` fetches all messages for that lead
6. User types a reply and sends
7. `useSendMessage()` creates a new message in the database
8. Queries are invalidated, triggering automatic refetch
9. UI updates with the new message

## Real-time Features

- Conversations automatically refresh every 10 seconds
- Messages automatically refresh every 5 seconds
- New messages appear without manual refresh
- Unread counts update automatically

## Error Handling

- Graceful error states with user-friendly messages
- Toast notifications for send failures
- Fallback UI for empty states
- Type-safe error handling with TypeScript

## Next Steps (Optional Enhancements)

1. **Mark messages as read**: Update read_at when viewing messages
2. **AI suggestions**: Implement AI-powered reply suggestions
3. **File attachments**: Support sending files in messages
4. **Message status**: Show delivered/read indicators
5. **Typing indicators**: Show when lead is typing
6. **WebSocket integration**: Replace polling with real-time WebSocket updates
7. **Pagination**: Add infinite scroll for large message lists
8. **Message search**: Search within conversation messages
9. **Archive conversations**: Move inactive conversations to archive
10. **Conversation filters**: Filter by status, date, or unread

## Technologies Used

- **Next.js 14**: App router and API routes
- **TanStack Query**: Data fetching and caching
- **MongoDB**: Database storage
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Sonner**: Toast notifications
- **Lucide React**: Icons

## Files Modified/Created

### Created:

- `/app/api/conversations/route.ts`
- `/app/api/messages/route.ts`
- `/hooks/use-conversations.ts`
- `/hooks/use-messages.ts`

### Modified:

- `/app/(dashboard)/inbox/page.tsx` - Complete refactor from static to dynamic

All static mock data has been removed and replaced with dynamic backend integration.
