'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ria/web-ui';
import { MessageSquare, Users, Mail, Hash } from 'lucide-react';
import Link from 'next/link';

export default function MessagingCenter() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Messaging Hub</h1>
      
      <Tabs defaultValue="direct" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="direct" asChild>
            <Link href="/messaging/direct" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Direct Messages
            </Link>
          </TabsTrigger>
          <TabsTrigger value="inbox" asChild>
            <Link href="/messaging/inbox" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Inbox
            </Link>
          </TabsTrigger>
          <TabsTrigger value="channels" asChild>
            <Link href="/messaging/channels" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Channels
            </Link>
          </TabsTrigger>
          <TabsTrigger value="all" asChild>
            <Link href="/messaging/all" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              All Messages
            </Link>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="direct" className="mt-6">
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Direct Messages</h2>
            <p className="text-muted-foreground mb-4">
              Send private messages to team members
            </p>
            <Link 
              href="/messaging/direct" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Open Direct Messages
            </Link>
          </div>
        </TabsContent>
        
        <TabsContent value="inbox" className="mt-6">
          <div className="text-center py-8">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Unified Inbox</h2>
            <p className="text-muted-foreground mb-4">
              Manage all external communications in one place
            </p>
            <Link 
              href="/messaging/inbox" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Open Inbox
            </Link>
          </div>
        </TabsContent>
        
        <TabsContent value="channels" className="mt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Hash className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Channels</h2>
            <p>Topic-based group conversations coming soon...</p>
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="mt-6">
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">All Messages</h2>
            <p>Unified view of all communications coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}