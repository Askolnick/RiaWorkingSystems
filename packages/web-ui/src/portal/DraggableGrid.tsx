'use client'
import { useRef, useCallback } from 'react'
import { Button } from '../components'
import type { WidgetInstance } from '@ria/portal-server'

interface DraggableGridProps {
  cols: number
  rowHeight: number
  gap: number
  items: WidgetInstance[]
  onItemsChange: (items: WidgetInstance[]) => void
  renderItem: (item: WidgetInstance) => React.ReactNode
  onRemove?: (id: string) => void
  className?: string
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function hasCollision(a: WidgetInstance, b: WidgetInstance): boolean {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y)
}

function resolveCollisions(items: WidgetInstance[], movedId: string, cols: number): WidgetInstance[] {
  const list = items.slice().sort((a, b) => a.y - b.y || a.x - b.x)
  const moved = list.find(item => item.id === movedId)!
  
  // Push down phase - resolve collisions
  let changed = true
  while (changed) {
    changed = false
    for (const item of list) {
      if (item.id === moved.id) continue
      if (hasCollision(moved, item)) {
        moved.y = item.y + item.h
        changed = true
      }
    }
  }
  
  // Boundary clamp
  moved.x = Math.max(0, Math.min(cols - moved.w, moved.x))
  if (moved.x + moved.w > cols) moved.x = Math.max(0, cols - moved.w)

  // Compaction phase - move items up where possible
  for (const item of list) {
    let targetY = item.y
    while (targetY > 0) {
      const candidate = { ...item, y: targetY - 1 }
      if (list.filter(x => x.id !== item.id).some(x => hasCollision(candidate, x))) break
      targetY--
    }
    item.y = targetY
  }
  
  return list
}

export function DraggableGrid({
  cols,
  rowHeight,
  gap,
  items,
  onItemsChange,
  renderItem,
  onRemove,
  className
}: DraggableGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const getCellWidth = useCallback(() => {
    const el = containerRef.current
    if (!el) return 100
    const totalGap = gap * (cols - 1)
    const cellWidth = (el.clientWidth - totalGap) / cols
    return Math.floor(cellWidth)
  }, [cols, gap])

  const snapToGrid = useCallback((px: number, unit: number) => {
    return Math.max(0, Math.round(px / unit))
  }, [])

  const getPixelX = useCallback((x: number) => x * (getCellWidth() + gap), [getCellWidth, gap])
  const getPixelY = useCallback((y: number) => y * (rowHeight + gap), [rowHeight, gap])
  const getPixelWidth = useCallback((w: number) => w * getCellWidth() + (w - 1) * gap, [getCellWidth, gap])
  const getPixelHeight = useCallback((h: number) => h * rowHeight + (h - 1) * gap, [rowHeight, gap])

  const moveItem = useCallback((id: string, newX: number, newY: number) => {
    const nextItems = clone(items)
    const item = nextItems.find(i => i.id === id)!
    item.x = newX
    item.y = newY
    onItemsChange(resolveCollisions(nextItems, id, cols))
  }, [items, onItemsChange, cols])

  const resizeItem = useCallback((id: string, newWidth: number, newHeight: number) => {
    const nextItems = clone(items)
    const item = nextItems.find(i => i.id === id)!
    item.w = Math.max(1, Math.min(cols, newWidth))
    item.h = Math.max(1, newHeight)
    onItemsChange(resolveCollisions(nextItems, id, cols))
  }, [items, onItemsChange, cols])

  const handleDragStart = useCallback((e: React.PointerEvent, id: string) => {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const startOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    const handlePointerMove = (ev: PointerEvent) => {
      const container = containerRef.current!.getBoundingClientRect()
      const left = ev.clientX - container.left - startOffset.x
      const top = ev.clientY - container.top - startOffset.y
      const newX = snapToGrid(left, getCellWidth() + gap)
      const newY = snapToGrid(top, rowHeight + gap)
      moveItem(id, newX, newY)
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }, [getCellWidth, gap, rowHeight, snapToGrid, moveItem])

  const handleResizeStart = useCallback((e: React.PointerEvent, id: string) => {
    e.stopPropagation()
    const startPos = { x: e.clientX, y: e.clientY }

    const handlePointerMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startPos.x
      const dy = ev.clientY - startPos.y
      const deltaW = Math.round(dx / (getCellWidth() + gap))
      const deltaH = Math.round(dy / (rowHeight + gap))
      const item = items.find(i => i.id === id)!
      resizeItem(id, item.w + deltaW, item.h + deltaH)
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }, [getCellWidth, gap, rowHeight, items, resizeItem])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
    let dx = 0, dy = 0, dw = 0, dh = 0
    
    switch (e.key) {
      case 'ArrowLeft':
        e.shiftKey ? (dw = -1) : (dx = -1)
        break
      case 'ArrowRight':
        e.shiftKey ? (dw = 1) : (dx = 1)
        break
      case 'ArrowUp':
        e.shiftKey ? (dh = -1) : (dy = -1)
        break
      case 'ArrowDown':
        e.shiftKey ? (dh = 1) : (dy = 1)
        break
    }
    
    if (dx || dy) {
      e.preventDefault()
      const item = items.find(i => i.id === id)!
      moveItem(id, Math.max(0, item.x + dx), Math.max(0, item.y + dy))
    }
    
    if (dw || dh) {
      e.preventDefault()
      const item = items.find(i => i.id === id)!
      resizeItem(id, item.w + dw, item.h + dh)
    }
  }, [items, moveItem, resizeItem])

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} style={{ minHeight: 400 }}>
      {/* Grid background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundSize: `${getCellWidth() + gap}px ${rowHeight + gap}px`,
          backgroundImage: `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`
        }}
      />
      
      {/* Widget items */}
      {items.map(item => (
        <div
          key={item.id}
          role="group"
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown(e, item.id)}
          onPointerDown={(e) => handleDragStart(e, item.id)}
          className="absolute rounded-lg border bg-card shadow-sm overflow-hidden select-none focus:ring-2 focus:ring-ring"
          style={{
            left: getPixelX(item.x),
            top: getPixelY(item.y),
            width: getPixelWidth(item.w),
            height: getPixelHeight(item.h)
          }}
        >
          {/* Widget header */}
          <div className="h-10 px-3 flex items-center justify-between bg-muted/50 border-b cursor-grab active:cursor-grabbing">
            <div className="text-sm font-medium">Widget</div>
            {onRemove && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(item.id)
                }}
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
              >
                Remove
              </Button>
            )}
          </div>
          
          {/* Widget content */}
          <div className="p-2 h-[calc(100%-2.5rem)] overflow-auto">
            {renderItem(item)}
          </div>
          
          {/* Resize handle */}
          <div
            onPointerDown={(e) => handleResizeStart(e, item.id)}
            className="absolute right-1 bottom-1 w-4 h-4 rounded-sm border bg-muted/50 cursor-nw-resize hover:bg-muted"
            style={{
              background: 'linear-gradient(-45deg, transparent 30%, hsl(var(--border)) 30%, hsl(var(--border)) 70%, transparent 70%)'
            }}
          />
        </div>
      ))}
    </div>
  )
}