'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../lib/tasks.api'

export function useTasksQuery(){
  return useQuery({ queryKey: ['tasks'], queryFn: api.listTasks })
}

export function useUpdateTaskOptimistic(){
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<api.Task> }) => api.updateTask(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] })
      const prev = qc.getQueryData<api.Task[]>(['tasks']) || []
      const next = prev.map(t => t.id === id ? { ...t, ...patch } : t)
      qc.setQueryData(['tasks'], next)
      return { prev }
    },
    onError: (_e, _v, ctx:any) => { if (ctx?.prev) qc.setQueryData(['tasks'], ctx.prev) },
    onSettled: () => { qc.invalidateQueries({ queryKey: ['tasks'] }) }
  })
}
