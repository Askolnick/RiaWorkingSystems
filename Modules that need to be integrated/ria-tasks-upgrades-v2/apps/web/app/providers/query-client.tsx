'use client'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const client = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000, retry: 1 } }
})

export function WithQueryClient({ children }: { children: React.ReactNode }){
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
