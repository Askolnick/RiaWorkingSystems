'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Input, SearchInput } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Modal } from '../molecules/Modal';
import { Loading } from '../atoms/Loading';

// Import types
import {
  WikiSection,
  SectionType,
  SectionStatus,
  SectionSearchOptions,
  SectionSearchResult
} from './SectionEditor';

interface SectionPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (section: WikiSection) => void;
  spaceId?: string;
  excludeIds?: string[];
  title?: string;
  allowMultiple?: boolean;
  selectedSections?: WikiSection[];
  onSelectMultiple?: (sections: WikiSection[]) => void;
}

interface SectionCardProps {
  section: WikiSection | SectionSearchResult;
  isSelected?: boolean;
  onSelect: () => void;
  showUsageCount?: boolean;
}

function SectionCard({ section, isSelected, onSelect, showUsageCount }: SectionCardProps) {
  const getSectionTypeColor = (type: SectionType) => {
    const colors = {
      text: 'blue',
      code: 'purple',
      image: 'green',
      video: 'red',
      table: 'yellow',
      chart: 'indigo',
      checklist: 'pink',
      callout: 'orange',
      quote: 'gray',
      template: 'cyan'
    };
    return colors[type] || 'gray';
  };

  const getStatusColor = (status: SectionStatus) => {
    const colors = {
      draft: 'gray',
      published: 'green',
      archived: 'red'
    };
    return colors[status] || 'gray';
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
      onClick={onSelect}
      padding="sm"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {section.title}
            </h3>
            {section.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {section.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={getSectionTypeColor(section.type) as any} size="sm">
            {section.type}
          </Badge>
          <Badge variant={getStatusColor(section.status) as any} size="sm">
            {section.status}
          </Badge>
          {section.isTemplate && (
            <Badge variant="purple" size="sm">
              Template
            </Badge>
          )}
          {section.isPublic && (
            <Badge variant="green" size="sm">
              Public
            </Badge>
          )}
          {section.isGlobal && (
            <Badge variant="cyan" size="sm">
              Global
            </Badge>
          )}
        </div>

        {showUsageCount && 'usageCount' in section && (
          <div className="text-xs text-gray-500">
            Used in {section.usageCount} pages
          </div>
        )}

        {section.tags && section.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {section.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
            {section.tags.length > 3 && (
              <Badge variant="secondary" size="sm">
                +{section.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="text-xs text-gray-400">
          Last updated: {new Date(section.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
}

export function SectionPicker({
  isOpen,
  onClose,
  onSelectSection,
  spaceId,
  excludeIds = [],
  title = 'Select Section',
  allowMultiple = false,
  selectedSections = [],
  onSelectMultiple
}: SectionPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SectionSearchResult[]>([]);
  const [sections, setSections] = useState<WikiSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<SectionType | ''>('');
  const [statusFilter, setStatusFilter] = useState<SectionStatus | ''>('');
  const [isTemplateFilter, setIsTemplateFilter] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSections();
      setSelectedIds(selectedSections.map(s => s.id));
    }
  }, [isOpen, spaceId]);

  const loadSections = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockSections: WikiSection[] = [
        {
          id: 'section-1',
          tenantId: 'tenant-1',
          spaceId: spaceId,
          title: 'Company Overview',
          slug: 'company-overview',
          description: 'Standard company overview section for onboarding',
          content: { type: 'text', content: 'Company overview content...' },
          type: SectionType.text,
          status: SectionStatus.published,
          isTemplate: true,
          tags: ['onboarding', 'company'],
          version: 2,
          isPublic: true,
          isGlobal: false,
          createdBy: 'user-1',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-09-01T14:30:00Z'
        },
        {
          id: 'section-2',
          tenantId: 'tenant-1',
          title: 'API Authentication',
          slug: 'api-auth',
          description: 'Code example for API authentication',
          content: { type: 'code', language: 'javascript', content: 'const auth = ...' },
          type: SectionType.code,
          status: SectionStatus.published,
          isTemplate: false,
          tags: ['api', 'auth'],
          version: 1,
          isPublic: true,
          isGlobal: true,
          createdBy: 'user-2',
          createdAt: '2024-02-01T09:00:00Z',
          updatedAt: '2024-02-01T09:00:00Z'
        }
      ].filter(s => !excludeIds.includes(s.id));

      setSections(mockSections);
    } catch (error) {
      console.error('Failed to load sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchOptions: SectionSearchOptions = {
        query: searchQuery,
        spaceIds: spaceId ? [spaceId] : undefined,
        types: typeFilter ? [typeFilter] : undefined,
        statuses: statusFilter ? [statusFilter] : undefined,
        isTemplate: isTemplateFilter ?? undefined,
        limit: 20
      };

      // Mock search results
      const mockResults: SectionSearchResult[] = sections
        .filter(section => 
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .map(section => ({
          id: section.id,
          title: section.title,
          description: section.description,
          type: section.type,
          status: section.status,
          highlights: [section.title],
          relevanceScore: 1.0,
          usageCount: Math.floor(Math.random() * 10),
          lastUpdated: section.updatedAt,
          tags: section.tags,
          isTemplate: section.isTemplate,
          isPublic: section.isPublic,
          isGlobal: section.isGlobal,
          updatedAt: section.updatedAt
        }));

      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSelect = (section: WikiSection | SectionSearchResult) => {
    if (allowMultiple) {
      const sectionId = section.id;
      if (selectedIds.includes(sectionId)) {
        setSelectedIds(prev => prev.filter(id => id !== sectionId));
      } else {
        setSelectedIds(prev => [...prev, sectionId]);
      }
    } else {
      // Convert search result to full section if needed
      const fullSection = 'content' in section 
        ? section as WikiSection
        : sections.find(s => s.id === section.id);
      
      if (fullSection) {
        onSelectSection(fullSection);
        onClose();
      }
    }
  };

  const handleConfirmMultiple = () => {
    if (onSelectMultiple) {
      const selected = sections.filter(s => selectedIds.includes(s.id));
      onSelectMultiple(selected);
    }
    onClose();
  };

  const displaySections = searchQuery.trim() ? searchResults : sections;
  const filteredSections = displaySections.filter(section => {
    if (typeFilter && section.type !== typeFilter) return false;
    if (statusFilter && section.status !== statusFilter) return false;
    if (isTemplateFilter !== null && section.isTemplate !== isTemplateFilter) return false;
    return true;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Card className="max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
              onClear={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              placeholder="Search sections..."
              className="flex-1"
            />
            <Button variant="secondary" onClick={handleSearch}>
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as SectionType | '')}
              options={[
                { value: '', label: 'All Types' },
                { value: SectionType.text, label: 'Text' },
                { value: SectionType.code, label: 'Code' },
                { value: SectionType.checklist, label: 'Checklist' },
                { value: SectionType.callout, label: 'Callout' },
                { value: SectionType.table, label: 'Table' }
              ]}
              placeholder="Filter by type"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SectionStatus | '')}
              options={[
                { value: '', label: 'All Statuses' },
                { value: SectionStatus.draft, label: 'Draft' },
                { value: SectionStatus.published, label: 'Published' },
                { value: SectionStatus.archived, label: 'Archived' }
              ]}
              placeholder="Filter by status"
            />
            <Select
              value={isTemplateFilter === null ? '' : isTemplateFilter.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setIsTemplateFilter(value === '' ? null : value === 'true');
              }}
              options={[
                { value: '', label: 'All Sections' },
                { value: 'true', label: 'Templates Only' },
                { value: 'false', label: 'Regular Sections' }
              ]}
              placeholder="Filter by template"
            />
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loading size="lg" />
              </div>
            ) : filteredSections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSections.map(section => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    isSelected={selectedIds.includes(section.id)}
                    onSelect={() => handleSectionSelect(section)}
                    showUsageCount={searchQuery.trim() !== ''}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchQuery.trim() ? 'No sections found' : 'No sections available'}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter align="between">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {allowMultiple && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {selectedIds.length} selected
              </span>
              <Button
                variant="primary"
                onClick={handleConfirmMultiple}
                disabled={selectedIds.length === 0}
              >
                Add Selected
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </Modal>
  );
}