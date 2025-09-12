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
    
    // For now, create a sample component to demonstrate the system
    const sampleComponent: ComponentRequest = {
      name: 'ThemeCard',
      type: 'molecule',
      props: ['title', 'description', 'variant'],
      variant: 'theme',
      hasChildren: true
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

  private generateComponent(request: ComponentRequest): string {
    const { name, props = [], hasChildren = false } = request;
    
    return `import React from 'react';
import { cn } from '../utils/cn';

interface ${name}Props {
  ${props.map(prop => `${prop}?: string;`).join('\n  ')}
  variant?: 'theme' | 'action' | 'attention';
  className?: string;
  ${hasChildren ? 'children?: React.ReactNode;' : ''}
}

/**
 * ${name} - Following buoy-inspired design system
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
 */
export const ${name}: React.FC<${name}Props> = ({
  ${props.map(prop => prop).join(', ')},
  variant = 'theme',
  className,
  ${hasChildren ? 'children,' : ''}
  ...props
}) => {
  const baseClasses = [
    'squircle-large', // Apple-style large radius for cards
    'border-2',
    'transition-all',
    'focus-visible-only' // Accessibility: only show focus ring for keyboard users
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
    className
  );

  return (
    <div className={classes} {...props}>
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
};`;
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
🎨 UI Agent - Creates UI components with buoy-inspired design system

Features:
• 8-color theme system (theme, action, inaction, background, attention + lifeboat variants)
• 5 semantic font classes (large-heading, medium-heading, small-heading, body, small-body)  
• 3-button system (btn-primary, btn-secondary, btn-tertiary)
• Unified form inputs with consistent styling
• Apple-style squircle adaptive radius system
• 75% overlay standard for consistent opacity

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
2. Create components following buoy design patterns
3. Generate Storybook stories for documentation
4. Update component exports automatically
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