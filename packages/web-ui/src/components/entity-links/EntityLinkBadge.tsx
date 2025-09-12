/**
 * EntityLinkBadge - Compact display of entity relationships
 * 
 * Features:
 * - Compact badge showing link type and connected entity
 * - Clickable to view details or navigate
 * - Color-coded by relationship type
 * - Tooltip showing full details
 * - Loading and error states
 */

'use client';

import React from 'react';
import { Badge } from '../atoms/Badge';
import { 
  EntityLinkWithDetails, 
  EntityRef,
  LinkKind 
} from '@ria/client';

export interface EntityLinkBadgeProps {
  link: EntityLinkWithDetails;
  currentEntity: EntityRef;
  onClick?: (link: EntityLinkWithDetails) => void;
  onEntityClick?: (entity: EntityRef) => void;
  showDirection?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EntityLinkBadge: React.FC<EntityLinkBadgeProps> = ({
  link,
  currentEntity,
  onClick,
  onEntityClick,
  showDirection = false,
  size = 'sm',
  className = '',
}) => {
  const isOutgoing = link.fromType === currentEntity.type && link.fromId === currentEntity.id;
  const connectedEntity = isOutgoing ? link.toEntity : link.fromEntity;
  
  const getLinkKindColor = (kind: LinkKind): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' => {
    const kindColors: Record<LinkKind, 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
      'parent_of': 'primary',
      'child_of': 'secondary', 
      'depends_on': 'warning',
      'blocks': 'danger',
      'references': 'secondary',
      'mentioned_in': 'secondary',
      'attached_to': 'secondary',
      'assigned_to': 'primary',
      'owned_by': 'primary',
      'collaborates_with': 'success',
      'triggers': 'warning',
      'completes': 'success',
      'relates': 'secondary',
      'duplicates': 'warning',
    };
    return kindColors[kind];
  };

  const formatLinkKind = (kind: LinkKind) => {
    return kind.replace('_', ' ');
  };

  const getEntityTitle = () => {
    if (connectedEntity) {
      return connectedEntity.title;
    }
    
    // Fallback to ID if no details available
    const entityId = isOutgoing ? link.toId : link.fromId;
    const entityType = isOutgoing ? link.toType : link.fromType;
    return `${entityType}:${entityId}`;
  };

  const getTooltipContent = () => {
    const direction = isOutgoing ? 'outgoing' : 'incoming';
    const entityTitle = getEntityTitle();
    const kind = formatLinkKind(link.kind);
    
    let tooltip = `${direction} ${kind} link to ${entityTitle}`;
    
    if (link.note) {
      tooltip += `\nNote: ${link.note}`;
    }
    
    return tooltip;
  };

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(link);
  };

  const handleEntityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEntityClick && connectedEntity) {
      const entityRef: EntityRef = {
        type: connectedEntity.type,
        id: connectedEntity.id,
        tenantId: link.tenantId,
      };
      onEntityClick(entityRef);
    }
  };

  return (
    <div className={`entity-link-badge inline-flex items-center space-x-1 ${className}`}>
      {showDirection && (
        <Badge
          variant={isOutgoing ? 'primary' : 'secondary'}
          size="xs"
          className="text-xs"
        >
          {isOutgoing ? '→' : '←'}
        </Badge>
      )}
      
      <Badge
        variant={getLinkKindColor(link.kind)}
        size={size}
        className={`cursor-pointer transition-colors ${onClick ? 'hover:opacity-80' : ''}`}
        onClick={onClick ? handleBadgeClick : undefined}
        title={getTooltipContent()}
      >
        {formatLinkKind(link.kind)}
      </Badge>
      
      <Badge
        variant="outline"
        size={size}
        className={`max-w-32 truncate ${onEntityClick && connectedEntity ? 'cursor-pointer hover:bg-gray-100' : ''}`}
        onClick={onEntityClick && connectedEntity ? handleEntityClick : undefined}
        title={getTooltipContent()}
      >
        {getEntityTitle()}
      </Badge>
    </div>
  );
};

/**
 * EntityLinkBadgeList - Display multiple entity link badges
 */
export interface EntityLinkBadgeListProps {
  links: EntityLinkWithDetails[];
  currentEntity: EntityRef;
  maxVisible?: number;
  onLinkClick?: (link: EntityLinkWithDetails) => void;
  onEntityClick?: (entity: EntityRef) => void;
  onShowAll?: () => void;
  showDirection?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EntityLinkBadgeList: React.FC<EntityLinkBadgeListProps> = ({
  links,
  currentEntity,
  maxVisible = 5,
  onLinkClick,
  onEntityClick,
  onShowAll,
  showDirection = false,
  size = 'sm',
  className = '',
}) => {
  const visibleLinks = maxVisible > 0 ? links.slice(0, maxVisible) : links;
  const hasMore = maxVisible > 0 && links.length > maxVisible;
  const moreCount = hasMore ? links.length - maxVisible : 0;

  if (links.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No links
      </div>
    );
  }

  return (
    <div className={`entity-link-badge-list flex flex-wrap items-center gap-1 ${className}`}>
      {visibleLinks.map(link => (
        <EntityLinkBadge
          key={link.id}
          link={link}
          currentEntity={currentEntity}
          onClick={onLinkClick}
          onEntityClick={onEntityClick}
          showDirection={showDirection}
          size={size}
        />
      ))}
      
      {hasMore && (
        <Badge
          variant="outline"
          size={size}
          className={`cursor-pointer hover:bg-gray-100 ${onShowAll ? '' : 'cursor-default'}`}
          onClick={onShowAll}
          title={`Show ${moreCount} more links`}
        >
          +{moreCount}
        </Badge>
      )}
    </div>
  );
};