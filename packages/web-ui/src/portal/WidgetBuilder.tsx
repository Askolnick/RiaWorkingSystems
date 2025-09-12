'use client'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '../components'
import { Input } from '../Input/Input'
import { Badge } from '../Badge/Badge'
import { Card } from '../Card/Card'
import type { DataQuery, Entity, Viz, Filter } from '@ria/portal-server'

const entityFields: Record<Entity, string[]> = {
  tasks: ['title', 'status', 'assignees', 'dueAt', 'priority', 'project'],
  messages: ['channel', 'from', 'to', 'status', 'receivedAt'],
  contacts: ['name', 'company', 'email', 'phone', 'tags'],
  invoices: ['number', 'status', 'totalCents', 'dueAt', 'customer'],
  expenses: ['vendor', 'amountCents', 'project', 'bookedAt'],
  wiki: ['title', 'updatedAt', 'author', 'tags']
}

const filterOps = ['=', '!=', 'contains', 'in', '>', '<']

interface WidgetBuilderProps {
  value?: { query?: DataQuery }
  onChange: (value: { query: DataQuery }) => void
  preview: (query: DataQuery) => React.ReactNode
  className?: string
}

export function WidgetBuilder({ value, onChange, preview, className }: WidgetBuilderProps) {
  const [entity, setEntity] = useState<Entity>(value?.query?.entity ?? 'tasks')
  const [fields, setFields] = useState<string[]>(value?.query?.fields ?? ['title', 'status'])
  const [filters, setFilters] = useState<Filter[]>(value?.query?.filters ?? [])
  const [viz, setViz] = useState<Viz>(value?.query?.viz ?? 'tile')
  const [limit, setLimit] = useState<number>(value?.query?.limit ?? 5)

  useEffect(() => {
    onChange({ ...(value || {}), query: { entity, fields, filters, viz, limit } })
  }, [entity, fields, filters, viz, limit, onChange, value])

  const toggleField = useCallback((field: string) => {
    setFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field])
  }, [])

  const addFilter = useCallback(() => {
    setFilters(prev => [...prev, { field: entityFields[entity][0], op: '=', value: '' }])
  }, [entity])

  const updateFilter = useCallback((index: number, patch: Partial<Filter>) => {
    setFilters(prev => prev.map((f, i) => i === index ? { ...f, ...patch } : f))
  }, [])

  const removeFilter = useCallback((index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index))
  }, [])

  const availableFields = entityFields[entity]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Entity</label>
          <select 
            value={entity} 
            onChange={(e) => setEntity(e.target.value as Entity)}
            className="w-full px-3 py-2 border rounded-md"
          >
            {Object.keys(entityFields).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fields</label>
          <div className="flex flex-wrap gap-2">
            {availableFields.map(field => (
              <Badge
                key={field}
                variant={fields.includes(field) ? "default" : "neutral"}
                className="cursor-pointer"
                onClick={() => toggleField(field)}
              >
                {field}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Filters</label>
            <Button onClick={addFilter} size="sm" variant="outline">
              Add Filter
            </Button>
          </div>
          <div className="space-y-2">
            {filters.map((filter, index) => (
              <div key={index} className="flex items-center gap-2">
                <select 
                  value={filter.field} 
                  onChange={(e) => updateFilter(index, { field: e.target.value })}
                  className="w-32 px-2 py-1 border rounded-md"
                >
                  {availableFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>

                <select 
                  value={filter.op} 
                  onChange={(e) => updateFilter(index, { op: e.target.value })}
                  className="w-24 px-2 py-1 border rounded-md"
                >
                  {filterOps.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>

                <Input
                  value={String(filter.value)}
                  onChange={(e) => updateFilter(index, { value: e.target.value })}
                  placeholder="value"
                  className="flex-1"
                />

                <Button
                  onClick={() => removeFilter(index)}
                  size="sm"
                  variant="outline"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Visualization</label>
            <select 
              value={viz} 
              onChange={(e) => setViz(e.target.value as Viz)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="tile">Tile</option>
              <option value="list">List</option>
              <option value="chart">Chart</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Limit</label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Math.max(1, Number(e.target.value) || 5))}
              min={1}
            />
          </div>
        </div>
      </div>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-2">Preview</div>
        {preview({ entity, fields, filters, viz, limit })}
      </Card>
    </div>
  )
}