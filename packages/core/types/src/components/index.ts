// Explicit exports to avoid conflicts
export { Button } from './atoms/Button';
// Input components
export { 
  Input,
  Textarea,
  SearchInput
} from './atoms/Input';
// Card components
export { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardGrid
} from './atoms/Card';
export { Badge } from './atoms/Badge';
export { Select } from './atoms/Select';
export { EmptyState } from './atoms/EmptyState';

// Table components - unified implementation
export { 
  Table,           // Main data table with sorting/pagination
  DataTable,       // Alias for Table
  SimpleTable,     // Primitive table wrapper
  TableHeader,     // Table header section
  TableHead,       // Table header cell (backward compatibility)
  TableBody,       // Table body section
  TableRow,        // Table row
  TableCell        // Table cell
} from './atoms/Table';

// Loading components
export { 
  Spinner,
  LoadingOverlay,
  Skeleton,
  LoadingCard,
  LoadingTable,
  LoadingDots,
  LoadingSpinner
} from './atoms/Loading';

// Legacy components
export { Avatar } from '../Avatar/Avatar';
export { FormField } from '../FormField/FormField';

// Alert components
export { 
  Alert,
  ErrorAlert
} from './molecules/Alert';
export { Modal } from './molecules/Modal';
export { AlertDialog } from './molecules/AlertDialog';

// Error Boundary
export { ErrorBoundary } from './ErrorBoundary';

// Form components
export { Checkbox } from './atoms/Checkbox';
export { Label } from './atoms/Label';

// Tab components
export { 
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from './atoms/Tabs';

// Dialog components
export { ConfirmDialog } from './molecules/ConfirmDialog';
export { AttachmentPicker } from './molecules/AttachmentPicker';
export { NavigationTabs } from './molecules/NavigationTabs';

// Messaging components
export { ThreadView } from './messaging/ThreadView';
export { Composer } from './messaging/Composer';
export { default as ConversationList } from './messaging/ConversationList';
export { default as MessageSidebar } from './messaging/MessageSidebar';
export { default as MessagingSettings } from './messaging/MessagingSettings';
export { default as MessageTemplateManager } from './messaging/MessageTemplateManager';
export { default as MessageTemplateForm } from './messaging/MessageTemplateForm';
export { default as MessageTemplatePreview } from './messaging/MessageTemplatePreview';
export { UserSearchPicker } from './messaging/UserSearchPicker';
export { DirectMessageList } from './messaging/DirectMessageList';

// Email components
export { EmailComposer } from './email/EmailComposer';
export { EmailList } from './email/EmailList';
export { EmailThread } from './email/EmailThread';

// Roadmap components
export { default as RoadmapList } from './roadmap/RoadmapList';
export { default as RoadmapDetail } from './roadmap/RoadmapDetail';

// Tasks components - removed KanbanBoard to avoid conflict with ./tasks export

// Navigation components
export { default as CommandPalette } from './navigation/CommandPalette';

// EntityLink components
export { 
  EntityLinkViewer,
  EntityLinkBadge,
  EntityLinkBadgeList,
  EntityLinkGraph
} from './entity-links';

// Sections components
export { SectionEditor } from './sections/SectionEditor';
export { SectionPicker } from './sections/SectionPicker';
export { SectionViewer } from './sections/SectionViewer';

// Quick Link components - temporarily disabled due to missing dependencies
// export { 
//   QuickLinkButton,
//   QuickLinkMenuItem
// } from './molecules/QuickLinkButton';

// Type exports
export type { CreateMessageTemplateData, MessageTemplate } from './messaging/types';
export type {
  EntityLinkViewerProps,
  EntityLinkBadgeProps,
  EntityLinkBadgeListProps,
  EntityLinkGraphProps
} from './entity-links';

export { VotingSystem } from '../roadmap/VotingSystem';
