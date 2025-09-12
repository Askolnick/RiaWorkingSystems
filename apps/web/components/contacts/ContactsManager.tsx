'use client';

import { useState, useEffect } from 'react';
import { useContactsStore } from '@ria/client';
import { Contact, ContactFilters, ContactStatus, ContactType } from '@ria/contacts-server';
import { 
  Card, 
  Button, 
  Input,
  Select,
  Checkbox,
  Badge,
  LoadingSpinner,
  Alert,
  Modal,
  ConfirmDialog
} from '@ria/web-ui';
import { 
  SimpleTable as Table,
  TableHeader as TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@ria/web-ui';
import { ContactForm } from './ContactForm';
import { ContactDetail } from './ContactDetail';
import { InteractionForm } from './InteractionForm';

interface ContactsManagerProps {
  className?: string;
}

export function ContactsManager({ className }: ContactsManagerProps) {
  const {
    contacts,
    loading,
    error,
    currentPage,
    totalPages,
    totalContacts,
    selectedContacts,
    viewMode,
    filters,
    fetchContacts,
    selectContact,
    deselectContact,
    selectAllContacts,
    clearSelection,
    setFilters,
    setPage,
    setViewMode,
    deleteContact,
    deleteContacts,
    setCurrentContact,
    clearError
  } = useContactsStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ search: value || undefined });
  };

  const handleFilterChange = (key: keyof ContactFilters, value: any) => {
    setFilters({ [key]: value });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectAllContacts();
    } else {
      clearSelection();
    }
  };

  const handleContactSelect = (contactId: string, checked: boolean) => {
    if (checked) {
      selectContact(contactId);
    } else {
      deselectContact(contactId);
    }
  };

  const handleViewContact = (contact: Contact) => {
    setCurrentContact(contact);
    setShowDetailModal(true);
  };

  const handleAddInteraction = (contact: Contact) => {
    setCurrentContact(contact);
    setShowInteractionModal(true);
  };

  const handleDeleteClick = (contactId: string) => {
    setContactToDelete(contactId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (contactToDelete) {
      try {
        await deleteContact(contactToDelete);
        setContactToDelete(null);
        setShowDeleteDialog(false);
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.size > 0) {
      try {
        await deleteContacts(Array.from(selectedContacts));
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  const getStatusBadgeVariant = (status: ContactStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'do-not-contact': return 'destructive';
      case 'qualified': return 'warning';
      case 'converted': return 'success';
      default: return 'secondary';
    }
  };

  const getTypeBadgeVariant = (type: ContactType) => {
    switch (type) {
      case 'lead': return 'warning';
      case 'client': return 'success';
      case 'prospect': return 'info';
      case 'partner': return 'secondary';
      case 'vendor': return 'outline';
      default: return 'secondary';
    }
  };

  if (error) {
    return (
      <Alert type="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
            <p className="text-sm text-gray-500">
              {totalContacts} total contacts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            >
              {viewMode === 'table' ? 'Card View' : 'Table View'}
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              Add Contact
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Select
              placeholder="All Types"
              value={filters.contactType || ''}
              onValueChange={(value) => handleFilterChange('contactType', value || undefined)}
            >
              <option value="">All Types</option>
              <option value="lead">Lead</option>
              <option value="client">Client</option>
              <option value="prospect">Prospect</option>
              <option value="partner">Partner</option>
              <option value="vendor">Vendor</option>
              <option value="other">Other</option>
            </Select>
            <Select
              placeholder="All Statuses"
              value={filters.status || ''}
              onValueChange={(value) => handleFilterChange('status', value || undefined)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="do-not-contact">Do Not Contact</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
            </Select>
            <Input
              placeholder="Company"
              value={filters.company || ''}
              onChange={(e) => handleFilterChange('company', e.target.value || undefined)}
            />
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedContacts.size > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedContacts.size} contact{selectedContacts.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={clearSelection}>
                  Clear Selection
                </Button>
                <Button variant="danger" onClick={handleBulkDelete}>
                  Delete Selected
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Content */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No contacts found</p>
              <Button
                className="mt-4"
                onClick={() => setShowCreateModal(true)}
              >
                Add Your First Contact
              </Button>
            </div>
          ) : viewMode === 'table' ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="w-12">
                    <Checkbox
                      checked={selectedContacts.size === contacts.length}
                      indeterminate={selectedContacts.size > 0 && selectedContacts.size < contacts.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedContacts.has(contact.id)}
                        onCheckedChange={(checked) => handleContactSelect(contact.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{contact.jobTitle}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {contact.email && (
                          <p className="text-gray-900">{contact.email}</p>
                        )}
                        {contact.phone && (
                          <p className="text-gray-500">{contact.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900">{contact.company}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(contact.contactType)}>
                        {contact.contactType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(contact.status)}>
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {contact.leadScore || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewContact(contact)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddInteraction(contact)}
                        >
                          Log
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(contact.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {contacts.map((contact) => (
                <Card key={contact.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{contact.jobTitle}</p>
                      <p className="text-sm text-gray-500">{contact.company}</p>
                    </div>
                    <Checkbox
                      checked={selectedContacts.has(contact.id)}
                      onCheckedChange={(checked) => handleContactSelect(contact.id, checked)}
                    />
                  </div>
                  <div className="space-y-2 mb-3">
                    {contact.email && (
                      <p className="text-sm text-gray-600">{contact.email}</p>
                    )}
                    {contact.phone && (
                      <p className="text-sm text-gray-600">{contact.phone}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getTypeBadgeVariant(contact.contactType)}>
                        {contact.contactType}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(contact.status)}>
                        {contact.status}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">
                      Score: {contact.leadScore || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewContact(contact)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddInteraction(contact)}
                    >
                      Log Interaction
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="Create Contact"
        size="lg"
      >
        <ContactForm
          onSuccess={() => {
            setShowCreateModal(false);
            fetchContacts();
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Contact Details"
        size="xl"
      >
        <ContactDetail
          onClose={() => setShowDetailModal(false)}
          onEdit={() => {
            setShowDetailModal(false);
            setShowCreateModal(true);
          }}
        />
      </Modal>

      <Modal
        open={showInteractionModal}
        onClose={() => setShowInteractionModal(false)}
        title="Log Interaction"
        size="lg"
      >
        <InteractionForm
          onSuccess={() => {
            setShowInteractionModal(false);
            fetchContacts();
          }}
          onCancel={() => setShowInteractionModal(false)}
        />
      </Modal>

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Contact"
        message="Are you sure you want to delete this contact? This action cannot be undone."
      />
    </div>
  );
}