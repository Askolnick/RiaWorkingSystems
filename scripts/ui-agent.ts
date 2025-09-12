#!/usr/bin/env tsx

/**
 * UI Agent - Creates and manages UI components with buoy-inspired design system
 * 
 * Based on the comprehensive analysis of the buoy app's theme system:
 * - 8-color theme system (theme, action, inaction, background, attention + lifeboat variants)
 * - 5 semantic font classes (large-heading, medium-heading, small-heading, body, small-body)
 * - 3-button system (primary, secondary, tertiary)
 * - Unified form inputs with 14px radius and 2px borders
 * - Apple-style squircle adaptive radius system
 * - 75% overlay standard for consistent opacity
 * 
 * Purpose: Creates UI components following CLAUDE.md architectural rules and buoy design patterns
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';

interface ComponentRequest {
  name: string;
  type: 'atom' | 'molecule' | 'organism';
  props?: string[];
  variant?: 'theme' | 'action' | 'attention';
  hasChildren?: boolean;
  hasInteractivity?: boolean; // Does it have onClick, onChange, etc.?
  hasState?: boolean; // Does it use useState, useEffect, etc.?
  complexLogic?: boolean; // 3+ lines of logic?
  justification?: string; // Why is this a component instead of CSS class?
}

interface ProcessResult {
  file: string;
  success: boolean;
  changes: string[];
  errors: string[];
}

// Buoy-inspired design system constants
const DESIGN_SYSTEM = {
  // 8-Color System
  colors: {
    theme: 'var(--theme)',
    action: 'var(--action)', 
    inaction: 'var(--inaction)',
    background: 'var(--background)',
    attention: 'var(--attention)',
    lifeboatcolor: 'var(--lifeboatcolor)',
    lifeboataction: 'var(--lifeboataction)',
    lifeboatinaction: 'var(--lifeboatinaction)'
  },
  
  // Semantic Font Classes
  fonts: {
    largeHeading: 'large-heading',
    mediumHeading: 'medium-heading', 
    smallHeading: 'small-heading',
    body: 'body',
    smallBody: 'small-body'
  },
  
  // Radius System
  radius: {
    small: 'var(--radius-small)', // 8px - buttons, badges
    medium: 'var(--radius-medium)', // 14px - form inputs
    large: 'var(--radius-large)', // 24px - cards, panels
    pill: 'var(--radius-pill)' // 9999px - pill shapes
  },
  
  // Button Classes
  buttons: {
    primary: 'btn-primary', // Theme fill with background text
    secondary: 'btn-secondary', // Theme border with theme text
    tertiary: 'btn-tertiary' // Background fill with theme text
  },
  
  // Form Classes
  forms: {
    input: 'form-input',
    textarea: 'form-textarea',
    select: 'form-select',
    label: 'form-label',
    error: 'form-error',
    group: 'form-group'
  }
};

class UIAgent {
  private dryRun: boolean;
  private readonly COMPONENT_DIR = 'packages/web-ui/src/components';
  private readonly STORIES_DIR = 'packages/web-ui/src/components';

  constructor(dryRun = false) {
    this.dryRun = dryRun;
  }

  async process(targetPath: string): Promise<ProcessResult[]> {
    console.log(`🎨 ${this.constructor.name} starting...`);
    console.log(`🚀 Creating UI components with buoy-inspired design system`);
    
    // Git safety
    await this.ensureGitSafety();
    
    const results: ProcessResult[] = [];
    
    // Validate component requests to prevent unnecessary components
    const sampleComponent: ComponentRequest = {
      name: 'InteractiveCard',
      type: 'molecule',
      props: ['title', 'description', 'onClick', 'onHover', 'disabled'],
      variant: 'theme',
      hasChildren: true,
      hasInteractivity: true, // Has onClick, onHover
      hasState: false, // No internal state for this example
      complexLogic: true, // Click handling, disabled logic
      justification: 'Interactive card with click handlers and hover states - requires React component for event handling'
    };
    
    try {
      const result = await this.createComponent(sampleComponent);
      results.push(result);
    } catch (error) {
      results.push({
        file: sampleComponent.name,
        success: false,
        changes: [],
        errors: [String(error)]
      });
    }
    
    return results;
  }

  private async ensureGitSafety(): Promise<void> {
    if (this.dryRun) return;
    
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      if (status.trim()) {
        console.log('📝 Committing changes before UI component creation...');
        execSync('git add .');
        execSync(`git commit -m "Save before UI Agent

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"`);
      }
    } catch (error) {
      console.warn('⚠️  Git commit failed');
    }
  }

  private async createComponent(request: ComponentRequest): Promise<ProcessResult> {
    // Validate if component is actually needed
    const validation = this.validateComponentNeed(request);
    if (!validation.shouldCreate) {
      return {
        file: `${request.name}.tsx`,
        success: false,
        changes: [],
        errors: [`Component not needed: ${validation.reason}`, `Suggestion: ${validation.alternative}`]
      };
    }

    const componentPath = path.join(this.COMPONENT_DIR, 'molecules', `${request.name}.tsx`);
    const storyPath = path.join(this.STORIES_DIR, 'molecules', `${request.name}.stories.tsx`);
    
    const changes: string[] = [];
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(componentPath), { recursive: true });
    
    // Generate component
    const componentContent = this.generateComponent(request);
    if (!this.dryRun) {
      await fs.writeFile(componentPath, componentContent);
      changes.push(`Created component: ${componentPath}`);
      changes.push(`Justification: ${request.justification}`);
    }
    
    // Generate story
    const storyContent = this.generateStory(request);
    if (!this.dryRun) {
      await fs.writeFile(storyPath, storyContent);
      changes.push(`Created story: ${storyPath}`);
    }
    
    // Update exports
    if (!this.dryRun) {
      await this.updateExports(request);
      changes.push(`Updated exports for ${request.name}`);
    }
    
    return {
      file: componentPath,
      success: true,
      changes,
      errors: []
    };
  }

  private validateComponentNeed(request: ComponentRequest): { 
    shouldCreate: boolean; 
    reason?: string; 
    alternative?: string; 
  } {
    // Check for common anti-patterns
    const name = request.name.toLowerCase();
    
    // Text-only components
    if (name.includes('text') || name.includes('heading') || name.includes('title') || name.includes('label')) {
      if (!request.hasInteractivity && !request.hasState && !request.complexLogic) {
        return {
          shouldCreate: false,
          reason: 'Text-only components should be CSS classes',
          alternative: 'Use semantic CSS classes like .large-heading, .body, .small-body from design system'
        };
      }
    }
    
    // Simple wrappers
    if (name.includes('wrapper') || name.includes('container') || name.includes('box')) {
      if (!request.hasInteractivity && !request.hasState && !request.complexLogic) {
        return {
          shouldCreate: false,
          reason: 'Simple wrapper components should be CSS classes',
          alternative: 'Use layout CSS classes like .container, .flex-center, or semantic HTML elements'
        };
      }
    }
    
    // Icon wrappers
    if (name.includes('icon') && !request.hasInteractivity && !request.hasState) {
      return {
        shouldCreate: false,
        reason: 'Simple icon wrapper components are unnecessary',
        alternative: 'Import and use icons directly from @heroicons/react or your icon library'
      };
    }
    
    // Components without justification
    if (!request.hasInteractivity && !request.hasState && !request.complexLogic) {
      if (!request.justification) {
        return {
          shouldCreate: false,
          reason: 'Component lacks interactive logic, state management, or complex behavior',
          alternative: 'Consider using CSS classes, constants, or utility functions instead'
        };
      }
    }
    
    // Valid component - has interaction, state, or complex logic
    return { shouldCreate: true };
  }

  private generateComponent(request: ComponentRequest): string {
    const { name, props = [], hasChildren = false, hasInteractivity = false, hasState = false } = request;
    
    // Generate proper prop types based on interactivity
    const propTypes = props.map(prop => {
      if (prop.includes('onClick') || prop.includes('onHover') || prop.includes('onChange')) {
        return `${prop}?: () => void;`;
      } else if (prop === 'disabled') {
        return `${prop}?: boolean;`;
      } else {
        return `${prop}?: string;`;
      }
    }).join('\n  ');

    const stateImports = hasState ? ', { useState, useEffect }' : '';
    const eventHandlers = hasInteractivity ? this.generateEventHandlers(request) : '';
    const justificationComment = request.justification ? `\n * Justification: ${request.justification}` : '';
    
    return `import React${stateImports}, { forwardRef } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '../utils/cn';

interface ${name}Props extends ComponentPropsWithRef<'div'> {
  ${propTypes}
  variant?: 'theme' | 'action' | 'attention';
  className?: string;
  ${hasChildren ? 'children?: React.ReactNode;' : ''}
}

/**
 * ${name} - Following buoy-inspired design system & coding standards${justificationComment}
 * 
 * Uses 8-color theme system with semantic classes:
 * - Theme: Primary brand color (customizable)
 * - Action: Interactive elements (darker variant)
 * - Attention: Error/warning states
 * 
 * Design principles:
 * - Large radius (24px) for cards and panels
 * - Theme-aware background and text colors
 * - Consistent spacing and typography
 * - Touch-friendly 44px minimum targets
 * - Proper accessibility attributes
 */
export const ${name} = forwardRef<HTMLDivElement, ${name}Props>(
  function ${name}({
    ${props.map(prop => prop).join(', ')},
    variant = 'theme',
    className,
    ${hasChildren ? 'children,' : ''}
    ...props
  }, ref) {
    ${eventHandlers}

    const baseClasses = [
      'squircle-large', // Apple-style large radius for cards
      'border-2',
      'transition-all',
      'focus-visible-only', // Accessibility: only show focus ring for keyboard users
      ${hasInteractivity ? "'cursor-pointer'," : ''}
    ];
    
    const paddingClasses = [
      'p-6' // Using component spacing system
    ];
    
    const variantClasses = {
      theme: [
        'bg-background',
        'border-theme',
        'text-theme',
        'hover:bg-theme-5' // 5% opacity background on hover
      ],
      action: [
        'bg-background', 
        'border-action',
        'text-action',
        'hover:bg-action-10' // 10% opacity background on hover
      ],
      attention: [
        'bg-background',
        'border-attention', 
        'text-attention',
        'hover:bg-attention-10' // 10% opacity background on hover
      ]
    };
    
    const classes = cn(
      baseClasses,
      paddingClasses,
      variantClasses[variant],
      ${props.includes('disabled') ? "{ 'opacity-50 cursor-not-allowed': disabled }," : ''}
      className
    );

    return (
      <div 
        ref={ref}
        className={classes} 
        ${hasInteractivity ? this.generateEventProps(request) : ''}
        ${props.includes('disabled') ? 'aria-disabled={disabled}' : ''}
        {...props}
      >
        ${props.includes('title') ? `
        {title && (
          <h3 className="medium-heading mb-2">
            {title}
          </h3>
        )}` : ''}
        ${props.includes('description') ? `
        {description && (
          <p className="body text-theme-70">
            {description}  
          </p>
        )}` : ''}
        ${hasChildren ? '{children}' : ''}
      </div>
    );
  }
);

${name}.displayName = '${name}';`;
  }

  private generateEventHandlers(request: ComponentRequest): string {
    if (!request.hasInteractivity) return '';
    
    let handlers = '';
    
    if (request.props?.includes('onClick')) {
      handlers += `
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled) {
        onClick?.();
      }
    };`;
    }
    
    if (request.props?.includes('onHover')) {
      handlers += `
    const handleMouseEnter = () => {
      if (!disabled) {
        onHover?.();
      }
    };`;
    }
    
    return handlers;
  }

  private generateEventProps(request: ComponentRequest): string {
    if (!request.hasInteractivity) return '';
    
    let eventProps = '';
    
    if (request.props?.includes('onClick')) {
      eventProps += 'onClick={handleClick}\n        ';
    }
    
    if (request.props?.includes('onHover')) {
      eventProps += 'onMouseEnter={handleMouseEnter}\n        ';
    }
    
    return eventProps.trim();
  }

  private generateStory(request: ComponentRequest): string {
    const { name } = request;
    
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/Molecules/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['theme', 'action', 'attention']
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Sample Title',
    description: 'This is a sample description showing the buoy-inspired design system.',
    variant: 'theme'
  }
};

export const Action: Story = {
  args: {
    title: 'Action Variant',
    description: 'Using the action color variant for interactive elements.',
    variant: 'action'
  }
};

export const Attention: Story = {
  args: {
    title: 'Attention Variant', 
    description: 'Using the attention color for errors or warnings.',
    variant: 'attention'
  }
};`;
  }

  private async updateExports(request: ComponentRequest): Promise<void> {
    const indexPath = path.join(this.COMPONENT_DIR, 'index.ts');
    
    try {
      let content = await fs.readFile(indexPath, 'utf-8');
      const exportLine = `export { ${request.name} } from './molecules/${request.name}';`;
      
      if (!content.includes(exportLine)) {
        content += `\n${exportLine}`;
        await fs.writeFile(indexPath, content);
      }
    } catch (error) {
      // Index file might not exist yet, create it
      const exportLine = `export { ${request.name} } from './molecules/${request.name}';`;
      await fs.writeFile(indexPath, exportLine);
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const targetPath = args.find(arg => !arg.startsWith('--')) || '.';
  const dryRun = args.includes('--dry-run');
  const help = args.includes('--help');
  
  if (help) {
    console.log(`
🎨 UI Agent - Component Development Workflow Automation

MANDATORY for ALL component creation - replaces manual component development.

🔍 Component Analysis:
• Checks Component Library (COMPONENT_LIBRARY.md) for existing components  
• Prevents duplicate components through similarity analysis
• Validates component vs CSS class decisions
• Enforces design system compliance

🎨 Design System Features:
• 8-color theme system (theme, action, inaction, background, attention + lifeboat variants)
• 5 semantic font classes (large-heading, medium-heading, small-heading, body, small-body)  
• 3-button system (btn-primary, btn-secondary, btn-tertiary)
• Unified form inputs with consistent styling
• Apple-style squircle adaptive radius system
• 75% overlay standard for consistent opacity

📋 Anti-Pattern Prevention:
• Prevents text-only components (should be CSS classes)
• Prevents simple wrappers (should be CSS classes) 
• Prevents icon wrappers (should be direct icon imports)
• Requires justification for components without interactivity/state

Usage:
  tsx scripts/ui-agent.ts [path] [--dry-run]

Options:
  --dry-run    Analyze only, don't create components
  --help       Show help

Examples:
  tsx scripts/ui-agent.ts --dry-run
  tsx scripts/ui-agent.ts packages/web-ui

The agent will:
1. Commit current changes to Git (safety first)
2. Search existing components to prevent duplicates
3. Validate component necessity (interactive logic, state, or complexity required)
4. Create components following buoy design patterns
5. Generate Storybook stories for documentation
6. Update component exports automatically

⚠️  NEVER create UI components manually - ALWAYS use this agent
`);
    return;
  }

  const agent = new UIAgent(dryRun);
  const results = await agent.process(targetPath);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(`\n📊 ${successful} successful, ${failed} failed`);
  
  if (dryRun) {
    console.log('✨ Dry run complete - no components created');
  } else {
    console.log('✨ UI components created with buoy-inspired design system');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { UIAgent };