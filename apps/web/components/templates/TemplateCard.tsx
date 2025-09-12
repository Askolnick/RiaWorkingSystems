'use client';

import { Card, Button, Badge } from '@ria/web-ui';
import { Clock, Users, TrendingUp, CheckCircle } from 'lucide-react';

interface BusinessTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  featured?: boolean;
  tags?: string[];
  phases?: any[];
  estimatedDuration?: number;
  type?: string;
}

interface TemplateCardProps {
  template: BusinessTemplate;
  onSelect: () => void;
  onCreateInstance: () => void;
}

export function TemplateCard({ template, onSelect, onCreateInstance }: TemplateCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      startup: 'bg-blue-100 text-blue-800',
      growth: 'bg-green-100 text-green-800',
      enterprise: 'bg-purple-100 text-purple-800',
      compliance: 'bg-red-100 text-red-800',
      transformation: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'onboarding': return Users;
      case 'planning': return TrendingUp;
      case 'compliance': return CheckCircle;
      default: return Clock;
    }
  };

  const TypeIcon = getTypeIcon(template.type);

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <TypeIcon className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">{template.name}</h3>
          </div>
          {template.featured && (
            <Badge variant="default">Featured</Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getCategoryColor(template.category)}>
            {template.category}
          </Badge>
          {template.phases && (
            <Badge variant="outline">
              {template.phases.length} Phases
            </Badge>
          )}
          {template.estimatedDuration && (
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {template.estimatedDuration} days
            </Badge>
          )}
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs text-muted-foreground">
                #{tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{template.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onCreateInstance();
            }}
            className="flex-1"
            size="sm"
          >
            Use Template
          </Button>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            variant="outline"
            size="sm"
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}