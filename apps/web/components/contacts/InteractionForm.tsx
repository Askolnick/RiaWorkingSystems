'use client';

import { useState } from 'react';
import { useContactsStore } from '@ria/client';
import { ContactInteraction, InteractionType } from '@ria/contacts-server';
import { 
  Button, 
  Input, 
  Textarea, 
  Select, 
  Label,
  Card,
  Alert,
  LoadingSpinner 
} from '@ria/web-ui';

interface InteractionFormProps {
  interaction?: ContactInteraction;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InteractionForm({ interaction, onSuccess, onCancel }: InteractionFormProps) {
  const { 
    currentContact, 
    createInteraction, 
    updateInteraction, 
    interactionsLoading, 
    error, 
    clearError 
  } = useContactsStore();
  
  const [formData, setFormData] = useState({
    type: interaction?.type || 'note' as InteractionType,
    subject: interaction?.subject || '',
    description: interaction?.description || '',
    outcome: interaction?.outcome || '',
    nextAction: interaction?.nextAction || '',
    scheduledDate: interaction?.scheduledDate ? 
      new Date(interaction.scheduledDate).toISOString().slice(0, 16) : '',
    completedDate: interaction?.completedDate ? 
      new Date(interaction.completedDate).toISOString().slice(0, 16) : '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentContact) return;

    try {
      const interactionData = {
        ...formData,
        scheduledDate: formData.scheduledDate || undefined,
        completedDate: formData.completedDate || undefined,
      };

      if (interaction) {
        await updateInteraction(
          currentContact.id, 
          interaction.id, 
          interactionData
        );
      } else {
        await createInteraction(currentContact.id, interactionData);
      }
      
      onSuccess();
    } catch (error) {
      // Error is handled by the store
    }
  };

  const interactionTypes: { value: InteractionType; label: string }[] = [
    { value: 'call', label: 'Phone Call' },
    { value: 'email', label: 'Email' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'note', label: 'Note' },
    { value: 'task', label: 'Task' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'contract', label: 'Contract' },
    { value: 'other', label: 'Other' },
  ];

  if (!currentContact) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No contact selected</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert type="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Basic Information */}
      <Card className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {interaction ? 'Edit Interaction' : 'Log Interaction'} for {currentContact.firstName} {currentContact.lastName}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Interaction Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              {interactionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </div>
          
          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Brief description of the interaction"
              required
            />
          </div>
        </div>
      </Card>

      {/* Details */}
      <Card className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              placeholder="Detailed notes about this interaction..."
            />
          </div>
          
          <div>
            <Label htmlFor="outcome">Outcome</Label>
            <Textarea
              id="outcome"
              value={formData.outcome}
              onChange={(e) => handleInputChange('outcome', e.target.value)}
              rows={3}
              placeholder="What was the result or outcome of this interaction?"
            />
          </div>
          
          <div>
            <Label htmlFor="nextAction">Next Action</Label>
            <Input
              id="nextAction"
              type="text"
              value={formData.nextAction}
              onChange={(e) => handleInputChange('nextAction', e.target.value)}
              placeholder="What should be done next?"
            />
          </div>
        </div>
      </Card>

      {/* Timing */}
      <Card className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Timing</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="scheduledDate">Scheduled Date & Time</Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              When was this interaction scheduled to occur?
            </p>
          </div>
          
          <div>
            <Label htmlFor="completedDate">Completed Date & Time</Label>
            <Input
              id="completedDate"
              type="datetime-local"
              value={formData.completedDate}
              onChange={(e) => handleInputChange('completedDate', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              When did this interaction actually occur?
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Tip:</strong> If this is a completed interaction, set the completed date. 
            If it's a future interaction, set the scheduled date. You can leave both blank for general notes.
          </p>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                completedDate: new Date().toISOString().slice(0, 16)
              }));
            }}
          >
            Set as Completed Now
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(9, 0, 0, 0);
              setFormData(prev => ({
                ...prev,
                scheduledDate: tomorrow.toISOString().slice(0, 16)
              }));
            }}
          >
            Schedule for Tomorrow 9 AM
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const nextWeek = new Date();
              nextWeek.setDate(nextWeek.getDate() + 7);
              nextWeek.setHours(9, 0, 0, 0);
              setFormData(prev => ({
                ...prev,
                scheduledDate: nextWeek.toISOString().slice(0, 16)
              }));
            }}
          >
            Schedule for Next Week
          </Button>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={interactionsLoading}>
          {interactionsLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            interaction ? 'Update Interaction' : 'Log Interaction'
          )}
        </Button>
      </div>
    </form>
  );
}