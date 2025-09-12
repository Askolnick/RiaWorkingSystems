/**
 * EntityLinkViewer - Display and manage entity relationships
 * 
 * Features:
 * - View all links for an entity with filtering
 * - Create new links with validation  
 * - Delete existing links with confirmation
 * - Responsive design with loading states
 * - Error handling with retry options
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Loading } from '../atoms/Loading';
import { Alert } from '../molecules/Alert';
import { Modal } from '../molecules/Modal';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { Select } from '../atoms/Select';
import { SimpleTable } from '../atoms/Table';
import { 
  EntityRef, 
  EntityLinkWithDetails, 
  LinkKind,
  LINK_KINDS,
  entityLinkService,
  EntityLinkError 
} from '@ria/client';

export interface EntityLinkViewerProps {
  entity: EntityRef;
  readonly?: boolean;
  className?: string;
  maxHeight?: string;
  showCreateButton?: boolean;
  allowedLinkKinds?: LinkKind[];
  onLinkCreated?: (link: EntityLinkWithDetails) => void;
  onLinkDeleted?: (linkId: string) => void;
  onError?: (error: Error) => void;
}

export const EntityLinkViewer: React.FC<EntityLinkViewerProps> = ({
  entity,
  readonly = false,
  className = '',
  maxHeight = '400px',
  showCreateButton = true,
  allowedLinkKinds,
  onLinkCreated,
  onLinkDeleted,
  onError,
}) => {
  const [links, setLinks] = useState<EntityLinkWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedKindFilter, setSelectedKindFilter] = useState<LinkKind | 'all'>('all');
  const [linkToDelete, setLinkToDelete] = useState<EntityLinkWithDetails | null>(null);

  const linkKindOptions = allowedLinkKinds || Object.keys(LINK_KINDS) as LinkKind[];

  // Load links on component mount and when entity changes
  useEffect(() => {
    loadLinks();
  }, [entity.id, entity.type, selectedKindFilter]);

  const loadLinks = async () => {
    if (!entity.id || !entity.type) return;

    setLoading(true);
    setError(null);

    try {
      const result = await entityLinkService.getEntityLinks(entity, {
        kinds: selectedKindFilter === 'all' ? undefined : [selectedKindFilter],
        includeDetails: true,
        includeInactive: false,
      });
      
      setLinks(result);
    } catch (err) {
      const errorMessage = err instanceof EntityLinkError 
        ? err.message 
        : 'Failed to load entity links';
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (link: EntityLinkWithDetails) => {
    try {
      await entityLinkService.deleteLink(link.id, entity.tenantId, true); // Soft delete
      
      // Remove from local state
      setLinks(prev => prev.filter(l => l.id !== link.id));
      setLinkToDelete(null);
      
      onLinkDeleted?.(link.id);
    } catch (err) {
      const errorMessage = err instanceof EntityLinkError 
        ? err.message 
        : 'Failed to delete link';
      setError(errorMessage);
      onError?.(err as Error);
    }
  };

  const handleLinkCreated = (newLink: EntityLinkWithDetails) => {
    setLinks(prev => [newLink, ...prev]);
    setShowCreateModal(false);
    onLinkCreated?.(newLink);
  };

  const getLinkDirectionBadge = (link: EntityLinkWithDetails) => {
    const isOutgoing = link.fromType === entity.type && link.fromId === entity.id;
    return (
      <Badge 
        variant={isOutgoing ? 'primary' : 'secondary'}
        size="sm"
      >
        {isOutgoing ? 'Outgoing' : 'Incoming'}
      </Badge>
    );
  };

  const getLinkKindBadge = (kind: LinkKind) => {
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

    return (
      <Badge variant={kindColors[kind]} size="sm">
        {kind.replace('_', ' ')}
      </Badge>
    );
  };

  const getConnectedEntityInfo = (link: EntityLinkWithDetails) => {
    const isOutgoing = link.fromType === entity.type && link.fromId === entity.id;
    const connectedEntity = isOutgoing ? link.toEntity : link.fromEntity;
    
    return connectedEntity ? {
      title: connectedEntity.title,
      type: connectedEntity.type,
      status: connectedEntity.status,
    } : {
      title: `${isOutgoing ? link.toType : link.fromType}:${isOutgoing ? link.toId : link.fromId}`,
      type: isOutgoing ? link.toType : link.fromType,
      status: 'unknown',
    };
  };

  const tableColumns = [
    {
      key: 'direction',
      label: 'Direction',
      render: (link: EntityLinkWithDetails) => getLinkDirectionBadge(link),
    },
    {
      key: 'kind',
      label: 'Relationship',
      render: (link: EntityLinkWithDetails) => getLinkKindBadge(link.kind),
    },
    {
      key: 'entity',
      label: 'Connected Entity',
      render: (link: EntityLinkWithDetails) => {
        const entityInfo = getConnectedEntityInfo(link);
        return (
          <div>
            <div className="font-medium">{entityInfo.title}</div>
            <div className="text-sm text-gray-500">
              {entityInfo.type} • {entityInfo.status}
            </div>
          </div>
        );
      },
    },
    {
      key: 'note',
      label: 'Note',
      render: (link: EntityLinkWithDetails) => (
        <span className="text-sm text-gray-600">
          {link.note || '—'}
        </span>
      ),
    },
    ...(readonly ? [] : [{
      key: 'actions',
      label: 'Actions',
      render: (link: EntityLinkWithDetails) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLinkToDelete(link)}
          className="text-red-600 hover:text-red-700"
        >
          Delete
        </Button>
      ),
    }]),
  ];

  return (
    <Card className={`entity-link-viewer ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Entity Links</h3>
          <Badge variant="secondary">{links.length}</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select
            value={selectedKindFilter}
            onChange={(value) => setSelectedKindFilter(value as LinkKind | 'all')}
            className="w-40"
          >
            <option value="all">All Types</option>
            {linkKindOptions.map(kind => (
              <option key={kind} value={kind}>
                {kind.replace('_', ' ')}
              </option>
            ))}
          </Select>
          
          {!readonly && showCreateButton && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              disabled={loading}
            >
              Add Link
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert type="error" className="mb-4">
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={loadLinks}
            className="ml-2"
          >
            Retry
          </Button>
        </Alert>
      )}

      <div style={{ maxHeight, overflowY: 'auto' }}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loading size="lg" />
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {selectedKindFilter === 'all' 
              ? 'No links found for this entity'
              : `No ${selectedKindFilter.replace('_', ' ')} links found`
            }
          </div>
        ) : (
          <SimpleTable
            data={links}
            columns={tableColumns}
            className="w-full"
          />
        )}
      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <Modal
          title="Create Entity Link"
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          size="md"
        >
          <EntityLinkCreator
            fromEntity={entity}
            allowedLinkKinds={linkKindOptions}
            onSuccess={handleLinkCreated}
            onCancel={() => setShowCreateModal(false)}
            onError={(err) => {
              setError(err.message);
              onError?.(err);
            }}
          />
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {linkToDelete && (
        <ConfirmDialog
          title="Delete Entity Link"
          message={`Are you sure you want to delete this ${linkToDelete.kind.replace('_', ' ')} link? This action can be undone later.`}
          confirmLabel="Delete Link"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={() => handleDeleteLink(linkToDelete)}
          onCancel={() => setLinkToDelete(null)}
        />
      )}
    </Card>
  );
};

// EntityLinkCreator component for creating new links
interface EntityLinkCreatorProps {
  fromEntity: EntityRef;
  allowedLinkKinds?: LinkKind[];
  onSuccess: (link: EntityLinkWithDetails) => void;
  onCancel: () => void;
  onError: (error: Error) => void;
}

const EntityLinkCreator: React.FC<EntityLinkCreatorProps> = ({
  fromEntity,
  allowedLinkKinds = Object.keys(LINK_KINDS) as LinkKind[],
  onSuccess,
  onCancel,
  onError,
}) => {
  const [targetEntityType, setTargetEntityType] = useState('');
  const [targetEntityId, setTargetEntityId] = useState('');
  const [linkKind, setLinkKind] = useState<LinkKind>('relates');
  const [note, setNote] = useState('');
  const [creating, setCreating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetEntityType || !targetEntityId || !linkKind) {
      setValidationError('Please fill in all required fields');
      return;
    }

    setCreating(true);
    setValidationError(null);

    try {
      const toEntity: EntityRef = {
        type: targetEntityType as any,
        id: targetEntityId,
        tenantId: fromEntity.tenantId,
      };

      const newLink = await entityLinkService.createLink(fromEntity, toEntity, linkKind, {
        note: note.trim() || undefined,
        allowDuplicates: false,
      });

      // Convert to EntityLinkWithDetails for consistency
      const linkWithDetails: EntityLinkWithDetails = {
        ...newLink,
        fromEntity: {
          id: fromEntity.id,
          title: `${fromEntity.type}:${fromEntity.id}`,
          type: fromEntity.type,
          status: 'active',
        },
        toEntity: {
          id: toEntity.id,
          title: `${toEntity.type}:${toEntity.id}`,
          type: toEntity.type as any,
          status: 'active',
        },
      };

      onSuccess(linkWithDetails);
    } catch (err) {
      const errorMessage = err instanceof EntityLinkError 
        ? err.message 
        : 'Failed to create entity link';
      setValidationError(errorMessage);
      onError(err as Error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {validationError && (
        <Alert type="error">{validationError}</Alert>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Entity Type *
        </label>
        <Select
          value={targetEntityType}
          onChange={setTargetEntityType}
          required
        >
          <option value="">Select entity type...</option>
          <option value="task">Task</option>
          <option value="project">Project</option>
          <option value="contact">Contact</option>
          <option value="document">Document</option>
          <option value="wiki_page">Wiki Page</option>
          <option value="invoice">Invoice</option>
          <option value="user">User</option>
          <option value="organization">Organization</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Entity ID *
        </label>
        <input
          type="text"
          value={targetEntityId}
          onChange={(e) => setTargetEntityId(e.target.value)}
          placeholder="Enter entity ID..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Relationship Type *
        </label>
        <Select
          value={linkKind}
          onChange={(value) => setLinkKind(value as LinkKind)}
          required
        >
          {allowedLinkKinds.map(kind => (
            <option key={kind} value={kind}>
              {kind.replace('_', ' ')}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note (Optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this relationship..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={creating}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={creating}
        >
          Create Link
        </Button>
      </div>
    </form>
  );
};