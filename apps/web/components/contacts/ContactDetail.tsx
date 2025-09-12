'use client';

import { useState, useEffect } from 'react';
import { useContactsStore } from '@ria/client';
import { Contact, ContactInteraction, InteractionType } from '@ria/contacts-server';
import { 
  Card, 
  Button, 
  Badge, 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  LoadingSpinner,
  Alert,
  Modal
} from '@ria/web-ui';
import { 
  SimpleTable as Table,
  TableHeader as TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@ria/web-ui';
import { InteractionForm } from './InteractionForm';

interface ContactDetailProps {
  onClose: () => void;
  onEdit: () => void;
}

export function ContactDetail({ onClose, onEdit }: ContactDetailProps) {
  const {
    currentContact,
    interactions,
    interactionsLoading,
    error,
    fetchInteractions,
    deleteInteraction,
    clearError
  } = useContactsStore();

  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<ContactInteraction | null>(null);

  useEffect(() => {
    if (currentContact) {
      fetchInteractions(currentContact.id);
    }
  }, [currentContact, fetchInteractions]);

  if (!currentContact) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No contact selected</p>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'do-not-contact': return 'destructive';
      case 'qualified': return 'warning';
      case 'converted': return 'success';
      default: return 'secondary';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'lead': return 'warning';
      case 'client': return 'success';
      case 'prospect': return 'info';
      case 'partner': return 'secondary';
      case 'vendor': return 'outline';
      default: return 'secondary';
    }
  };

  const getInteractionTypeBadgeVariant = (type: InteractionType) => {
    switch (type) {
      case 'call': return 'info';
      case 'email': return 'secondary';
      case 'meeting': return 'success';
      case 'note': return 'outline';
      case 'task': return 'warning';
      case 'proposal': return 'info';
      case 'contract': return 'success';
      default: return 'secondary';
    }
  };

  const handleEditInteraction = (interaction: ContactInteraction) => {
    setEditingInteraction(interaction);
    setShowInteractionModal(true);
  };

  const handleDeleteInteraction = async (interactionId: string) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      try {
        await deleteInteraction(currentContact.id, interactionId);
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert type="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentContact.firstName} {currentContact.lastName}
            </h2>
            <Badge variant={getTypeBadgeVariant(currentContact.contactType)}>
              {currentContact.contactType}
            </Badge>
            <Badge variant={getStatusBadgeVariant(currentContact.status)}>
              {currentContact.status}
            </Badge>
          </div>
          {currentContact.jobTitle && (
            <p className="text-lg text-gray-600 mb-1">{currentContact.jobTitle}</p>
          )}
          {currentContact.company && (
            <p className="text-gray-500">{currentContact.company}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onEdit}>
            Edit Contact
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interactions">
            Interactions ({interactions.length})
          </TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Information */}
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {currentContact.email && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <p className="text-gray-900">{currentContact.email}</p>
                  </div>
                )}
                {currentContact.phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone</span>
                    <p className="text-gray-900">{currentContact.phone}</p>
                  </div>
                )}
                {currentContact.source && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Source</span>
                    <p className="text-gray-900">{currentContact.source}</p>
                  </div>
                )}
                {currentContact.assignedTo && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Assigned To</span>
                    <p className="text-gray-900">{currentContact.assignedTo}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Metrics */}
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Metrics</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Lead Score</span>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentContact.leadScore || 0}
                  </p>
                </div>
                {currentContact.lastContactDate && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Last Contact</span>
                    <p className="text-gray-900">
                      {new Date(currentContact.lastContactDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {currentContact.nextFollowUpDate && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Next Follow-up</span>
                    <p className="text-gray-900">
                      {new Date(currentContact.nextFollowUpDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">Total Interactions</span>
                  <p className="text-gray-900">{interactions.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tags */}
          {currentContact.tags && currentContact.tags.length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentContact.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          {currentContact.notes && (
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{currentContact.notes}</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Interaction History</h3>
            <Button onClick={() => setShowInteractionModal(true)}>
              Log New Interaction
            </Button>
          </div>

          {interactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : interactions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500 mb-4">No interactions recorded yet</p>
              <Button onClick={() => setShowInteractionModal(true)}>
                Log First Interaction
              </Button>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Outcome</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {interactions.map((interaction) => (
                    <TableRow key={interaction.id}>
                      <TableCell>
                        <div className="text-sm">
                          {interaction.completedDate ? (
                            <p className="text-gray-900">
                              {new Date(interaction.completedDate).toLocaleDateString()}
                            </p>
                          ) : interaction.scheduledDate ? (
                            <p className="text-yellow-600">
                              Scheduled: {new Date(interaction.scheduledDate).toLocaleDateString()}
                            </p>
                          ) : (
                            <p className="text-gray-500">Not scheduled</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getInteractionTypeBadgeVariant(interaction.type)}>
                          {interaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{interaction.subject}</p>
                          {interaction.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {interaction.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {interaction.outcome || 'No outcome recorded'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditInteraction(interaction)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInteraction(interaction.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Addresses</h3>
          {currentContact.addresses && currentContact.addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentContact.addresses.map((address, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={address.isPrimary ? 'success' : 'secondary'}>
                      {address.type}
                    </Badge>
                    {address.isPrimary && (
                      <span className="text-xs text-gray-500">Primary</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700">
                    {address.street && <p>{address.street}</p>}
                    <p>
                      {[address.city, address.state, address.postalCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {address.country && <p>{address.country}</p>}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No addresses recorded</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Social Profiles</h3>
          {currentContact.socialProfiles && currentContact.socialProfiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentContact.socialProfiles.map((profile, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {profile.platform}
                      </Badge>
                      {profile.username && (
                        <p className="text-sm text-gray-600 mb-1">{profile.username}</p>
                      )}
                      <a
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 break-all"
                      >
                        {profile.url}
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No social profiles recorded</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Interaction Modal */}
      <Modal
        open={showInteractionModal}
        onClose={() => {
          setShowInteractionModal(false);
          setEditingInteraction(null);
        }}
        title={editingInteraction ? 'Edit Interaction' : 'Log New Interaction'}
        size="lg"
      >
        <InteractionForm
          interaction={editingInteraction}
          onSuccess={() => {
            setShowInteractionModal(false);
            setEditingInteraction(null);
            fetchInteractions(currentContact.id);
          }}
          onCancel={() => {
            setShowInteractionModal(false);
            setEditingInteraction(null);
          }}
        />
      </Modal>
    </div>
  );
}