'use client';

import { useState } from 'react';
import { useContactsStore } from '@ria/client';
import { Contact, CreateContactData, UpdateContactData, ContactType, ContactStatus } from '@ria/contacts-server';
import { 
  Button, 
  Input, 
  Textarea, 
  Select, 
  Card, 
  Label,
  Alert,
  LoadingSpinner 
} from '@ria/web-ui';

interface ContactFormProps {
  contact?: Contact;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ContactForm({ contact, onSuccess, onCancel }: ContactFormProps) {
  const { createContact, updateContact, loading, error, clearError } = useContactsStore();
  
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    jobTitle: contact?.jobTitle || '',
    contactType: contact?.contactType || 'lead' as ContactType,
    status: contact?.status || 'active' as ContactStatus,
    source: contact?.source || '',
    notes: contact?.notes || '',
    leadScore: contact?.leadScore || 0,
    nextFollowUpDate: contact?.nextFollowUpDate || '',
    tags: contact?.tags?.join(', ') || '',
  });

  const [addresses, setAddresses] = useState(
    contact?.addresses || [
      {
        type: 'work' as const,
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isPrimary: true
      }
    ]
  );

  const [socialProfiles, setSocialProfiles] = useState(
    contact?.socialProfiles || []
  );

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (index: number, field: string, value: any) => {
    setAddresses(prev => prev.map((addr, i) => 
      i === index ? { ...addr, [field]: value } : addr
    ));
  };

  const addAddress = () => {
    setAddresses(prev => [
      ...prev,
      {
        type: 'other' as const,
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isPrimary: false
      }
    ]);
  };

  const removeAddress = (index: number) => {
    setAddresses(prev => prev.filter((_, i) => i !== index));
  };

  const addSocialProfile = () => {
    setSocialProfiles(prev => [
      ...prev,
      {
        platform: 'other' as const,
        url: '',
        username: ''
      }
    ]);
  };

  const updateSocialProfile = (index: number, field: string, value: any) => {
    setSocialProfiles(prev => prev.map((profile, i) =>
      i === index ? { ...profile, [field]: value } : profile
    ));
  };

  const removeSocialProfile = (index: number) => {
    setSocialProfiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const contactData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        addresses: addresses.filter(addr => addr.street || addr.city),
        socialProfiles: socialProfiles.filter(profile => profile.url),
        leadScore: Number(formData.leadScore) || 0,
        nextFollowUpDate: formData.nextFollowUpDate || undefined,
      };

      if (contact) {
        await updateContact(contact.id, contactData as UpdateContactData);
      } else {
        await createContact(contactData as CreateContactData);
      }
      
      onSuccess();
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert type="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Basic Information */}
      <Card className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Contact Details */}
      <Card className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactType">Contact Type</Label>
            <Select
              value={formData.contactType}
              onValueChange={(value) => handleInputChange('contactType', value)}
            >
              <option value="lead">Lead</option>
              <option value="client">Client</option>
              <option value="prospect">Prospect</option>
              <option value="partner">Partner</option>
              <option value="vendor">Vendor</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="do-not-contact">Do Not Contact</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              type="text"
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              placeholder="Website, referral, etc."
            />
          </div>
          <div>
            <Label htmlFor="leadScore">Lead Score</Label>
            <Input
              id="leadScore"
              type="number"
              min="0"
              max="100"
              value={formData.leadScore}
              onChange={(e) => handleInputChange('leadScore', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
          </div>
          <div>
            <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
            <Input
              id="nextFollowUpDate"
              type="datetime-local"
              value={formData.nextFollowUpDate}
              onChange={(e) => handleInputChange('nextFollowUpDate', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Addresses */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Addresses</h3>
          <Button type="button" variant="outline" size="sm" onClick={addAddress}>
            Add Address
          </Button>
        </div>
        {addresses.map((address, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <Select
                value={address.type}
                onValueChange={(value) => handleAddressChange(index, 'type', value)}
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </Select>
              {addresses.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAddress(index)}
                >
                  Remove
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Street Address</Label>
                <Input
                  type="text"
                  value={address.street}
                  onChange={(e) => handleAddressChange(index, 'street', e.target.value)}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  type="text"
                  value={address.city}
                  onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                />
              </div>
              <div>
                <Label>State/Province</Label>
                <Input
                  type="text"
                  value={address.state}
                  onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input
                  type="text"
                  value={address.postalCode}
                  onChange={(e) => handleAddressChange(index, 'postalCode', e.target.value)}
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  type="text"
                  value={address.country}
                  onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Social Profiles */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Social Profiles</h3>
          <Button type="button" variant="outline" size="sm" onClick={addSocialProfile}>
            Add Profile
          </Button>
        </div>
        {socialProfiles.map((profile, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <Select
                value={profile.platform}
                onValueChange={(value) => updateSocialProfile(index, 'platform', value)}
              >
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="website">Website</option>
                <option value="other">Other</option>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSocialProfile(index)}
              >
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>URL</Label>
                <Input
                  type="url"
                  value={profile.url}
                  onChange={(e) => updateSocialProfile(index, 'url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Username</Label>
                <Input
                  type="text"
                  value={profile.username || ''}
                  onChange={(e) => updateSocialProfile(index, 'username', e.target.value)}
                  placeholder="@username"
                />
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Notes */}
      <Card className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
        <Textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={4}
          placeholder="Additional notes about this contact..."
        />
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            contact ? 'Update Contact' : 'Create Contact'
          )}
        </Button>
      </div>
    </form>
  );
}