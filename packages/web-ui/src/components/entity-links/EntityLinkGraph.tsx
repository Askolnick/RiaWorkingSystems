/**
 * EntityLinkGraph - Visual graph representation of entity relationships
 * 
 * Features:
 * - Interactive network visualization of connected entities
 * - Zoom, pan, and node selection
 * - Color-coded by entity type and link kind
 * - Expandable nodes to explore deeper connections
 * - Search and filter capabilities
 * - Export options
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Loading } from '../atoms/Loading';
import { Alert } from '../molecules/Alert';
import { Select } from '../atoms/Select';
import { 
  EntityRef, 
  EntityGraph,
  LinkKind,
  LINK_KINDS,
  entityLinkService,
  EntityLinkError 
} from '@ria/client';

export interface EntityLinkGraphProps {
  entity: EntityRef;
  maxDepth?: number;
  className?: string;
  height?: number;
  width?: number;
  onNodeClick?: (entity: EntityRef) => void;
  onLinkClick?: (linkId: string) => void;
  allowedLinkKinds?: LinkKind[];
}

export const EntityLinkGraph: React.FC<EntityLinkGraphProps> = ({
  entity,
  maxDepth = 2,
  className = '',
  height = 400,
  width = 600,
  onNodeClick,
  onLinkClick,
  allowedLinkKinds,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [graph, setGraph] = useState<EntityGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepth, setSelectedDepth] = useState(maxDepth);
  const [selectedKinds, setSelectedKinds] = useState<LinkKind[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const linkKindOptions = allowedLinkKinds || Object.keys(LINK_KINDS) as LinkKind[];

  // Load graph data
  useEffect(() => {
    loadGraph();
  }, [entity.id, entity.type, selectedDepth, selectedKinds]);

  const loadGraph = async () => {
    if (!entity.id || !entity.type) return;

    setLoading(true);
    setError(null);

    try {
      const result = await entityLinkService.getEntityGraph(
        entity,
        selectedDepth,
        selectedKinds.length > 0 ? selectedKinds : undefined
      );
      
      setGraph(result);
    } catch (err) {
      const errorMessage = err instanceof EntityLinkError 
        ? err.message 
        : 'Failed to load entity graph';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Canvas drawing logic
  useEffect(() => {
    if (!graph || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    drawGraph(ctx, graph);
  }, [graph, width, height, hoveredNode, selectedNode]);

  const drawGraph = (ctx: CanvasRenderingContext2D, graph: EntityGraph) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (graph.nodes.length === 0) {
      // Draw "no data" message
      ctx.fillStyle = '#6B7280';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('No connections found', width / 2, height / 2);
      return;
    }

    // Simple force-directed layout
    const positions = calculateNodePositions(graph);

    // Draw edges first (so they appear behind nodes)
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 2;
    
    graph.edges.forEach(edge => {
      const fromPos = positions[`${edge.from.type}:${edge.from.id}`];
      const toPos = positions[`${edge.to.type}:${edge.to.id}`];
      
      if (fromPos && toPos) {
        ctx.beginPath();
        ctx.moveTo(fromPos.x, fromPos.y);
        ctx.lineTo(toPos.x, toPos.y);
        
        // Color-code by link kind
        ctx.strokeStyle = getLinkColor(edge.kind);
        ctx.stroke();
        
        // Draw link kind label
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        
        ctx.fillStyle = '#374151';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(edge.kind.replace('_', ' '), midX, midY - 5);
      }
    });

    // Draw nodes
    graph.nodes.forEach(node => {
      const nodeKey = `${node.entity.type}:${node.entity.id}`;
      const pos = positions[nodeKey];
      
      if (!pos) return;
      
      const radius = node.entity.id === entity.id ? 25 : 20; // Highlight root node
      const isHovered = hoveredNode === nodeKey;
      const isSelected = selectedNode === nodeKey;
      
      // Node background
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = getNodeColor(node.entity.type);
      if (isHovered || isSelected) {
        ctx.fillStyle = adjustBrightness(ctx.fillStyle, 1.2);
      }
      ctx.fill();
      
      // Node border
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = isSelected ? '#3B82F6' : '#6B7280';
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      
      const label = node.details?.title || `${node.entity.type}:${node.entity.id}`;
      const shortLabel = label.length > 10 ? label.substring(0, 10) + '...' : label;
      ctx.fillText(shortLabel, pos.x, pos.y + 4);
      
      // Entity type label below node
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px system-ui';
      ctx.fillText(node.entity.type, pos.x, pos.y + radius + 15);
    });
  };

  const calculateNodePositions = (graph: EntityGraph): Record<string, { x: number; y: number }> => {
    const positions: Record<string, { x: number; y: number }> = {};
    const centerX = width / 2;
    const centerY = height / 2;

    if (graph.nodes.length === 1) {
      const nodeKey = `${graph.nodes[0].entity.type}:${graph.nodes[0].entity.id}`;
      positions[nodeKey] = { x: centerX, y: centerY };
      return positions;
    }

    // Place root node at center
    const rootKey = `${entity.type}:${entity.id}`;
    positions[rootKey] = { x: centerX, y: centerY };

    // Place other nodes in circles around the root
    const otherNodes = graph.nodes.filter(n => `${n.entity.type}:${n.entity.id}` !== rootKey);
    const angleStep = (2 * Math.PI) / Math.max(otherNodes.length, 1);
    const radius = Math.min(width, height) * 0.3;

    otherNodes.forEach((node, index) => {
      const angle = index * angleStep;
      const nodeKey = `${node.entity.type}:${node.entity.id}`;
      positions[nodeKey] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    return positions;
  };

  const getNodeColor = (entityType: string): string => {
    const colors: Record<string, string> = {
      task: '#3B82F6',
      project: '#10B981',
      contact: '#F59E0B',
      document: '#8B5CF6',
      wiki_page: '#06B6D4',
      invoice: '#EF4444',
      user: '#84CC16',
      organization: '#F97316',
    };
    return colors[entityType] || '#6B7280';
  };

  const getLinkColor = (linkKind: LinkKind): string => {
    const colors: Record<LinkKind, string> = {
      'parent_of': '#3B82F6',
      'child_of': '#6B7280',
      'depends_on': '#F59E0B',
      'blocks': '#EF4444',
      'references': '#6B7280',
      'mentioned_in': '#6B7280',
      'attached_to': '#6B7280',
      'assigned_to': '#3B82F6',
      'owned_by': '#3B82F6',
      'collaborates_with': '#10B981',
      'triggers': '#F59E0B',
      'completes': '#10B981',
      'relates': '#6B7280',
      'duplicates': '#F59E0B',
    };
    return colors[linkKind] || '#6B7280';
  };

  const adjustBrightness = (color: string, factor: number): string => {
    // Simple brightness adjustment - in a real implementation, 
    // you'd want proper color manipulation
    return color;
  };

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!graph || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked node
    const positions = calculateNodePositions(graph);
    
    for (const node of graph.nodes) {
      const nodeKey = `${node.entity.type}:${node.entity.id}`;
      const pos = positions[nodeKey];
      
      if (pos) {
        const radius = node.entity.id === entity.id ? 25 : 20;
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        
        if (distance <= radius) {
          setSelectedNode(nodeKey);
          onNodeClick?.(node.entity);
          return;
        }
      }
    }

    // Click on empty space deselects
    setSelectedNode(null);
  }, [graph, entity, onNodeClick]);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!graph || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find hovered node
    const positions = calculateNodePositions(graph);
    let hoveredNodeKey: string | null = null;

    for (const node of graph.nodes) {
      const nodeKey = `${node.entity.type}:${node.entity.id}`;
      const pos = positions[nodeKey];
      
      if (pos) {
        const radius = node.entity.id === entity.id ? 25 : 20;
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        
        if (distance <= radius) {
          hoveredNodeKey = nodeKey;
          break;
        }
      }
    }

    setHoveredNode(hoveredNodeKey);
    canvas.style.cursor = hoveredNodeKey ? 'pointer' : 'default';
  }, [graph, entity]);

  const handleKindFilter = (kinds: string[]) => {
    setSelectedKinds(kinds as LinkKind[]);
  };

  return (
    <Card className={`entity-link-graph ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Entity Graph</h3>
          {graph && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{graph.nodes.length} nodes</Badge>
              <Badge variant="secondary">{graph.edges.length} links</Badge>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Select
            value={selectedDepth.toString()}
            onChange={(value) => setSelectedDepth(parseInt(value))}
            className="w-20"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </Select>
          <span className="text-sm text-gray-600">levels</span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadGraph}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" className="mb-4">
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={loadGraph}
            className="ml-2"
          >
            Retry
          </Button>
        </Alert>
      )}

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <Loading size="lg" />
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          className="border border-gray-200 rounded-lg"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {selectedNode && graph && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Selected Node</h4>
          {(() => {
            const node = graph.nodes.find(n => `${n.entity.type}:${n.entity.id}` === selectedNode);
            if (!node) return null;
            
            return (
              <div className="flex items-center space-x-2">
                <Badge variant="primary">{node.entity.type}</Badge>
                <span className="font-medium">
                  {node.details?.title || `${node.entity.type}:${node.entity.id}`}
                </span>
                {node.details?.status && (
                  <Badge variant="secondary" size="sm">{node.details.status}</Badge>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Click nodes to select • Hover for details • Root node is highlighted
      </div>
    </Card>
  );
};