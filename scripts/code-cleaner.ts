#!/usr/bin/env tsx

/**
 * Code Cleanup Agent - Enforces CLAUDE.md architectural rules
 * 
 * Super careful agent that fixes code violations and aligns code with:
 * - Module boundaries (no direct imports between modules)
 * - Repository pattern (no direct API calls)
 * - Zustand stores (no useState for shared data)
 * - Component library usage (@ria/web-ui only)
 * - Centralized routing (ROUTES constants)
 * - No emojis in production code
 * - Error boundaries and loading states
 * - TypeScript-first (no any types)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';

interface CodeViolation {
  type: 'error' | 'warning' | 'info';
  rule: string;
  line: number;
  message: string;
  suggestion?: string;
}

interface ProcessResult {
  file: string;
  success: boolean;
  changes: string[];
  violations: CodeViolation[];
  errors: string[];
}

interface ClaudeRule {
  name: string;
  pattern: RegExp;
  violationType: 'error' | 'warning';
  message: string;
  suggestion?: string;
  autofix?: (content: string, match: RegExpMatchArray) => string;
}

class CodeCleaner {
  private dryRun: boolean;
  private readonly CLAUDE_RULES: ClaudeRule[] = [
    // 1. No direct API calls in components
    {
      name: 'no-direct-api-calls',
      pattern: /fetch\s*\(\s*['"`][^'"`]+['"`]/g,
      violationType: 'error',
      message: 'Direct API calls in components violate repository pattern',
      suggestion: 'Use repository pattern: create repository in @ria/client and use via Zustand store',
      autofix: (content, match) => {
        // Add comment suggesting proper pattern
        return content.replace(match[0], `// TODO: Replace with repository pattern\n  // ${match[0]}`);
      }
    },

    // 2. No useState for shared data
    {
      name: 'no-usestate-shared-data',
      pattern: /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState<[^>]*\[\]/g,
      violationType: 'warning',
      message: 'useState for arrays/objects should use Zustand store for shared data',
      suggestion: 'Create Zustand store in @ria/client for shared state management'
    },

    // 3. No hardcoded routes
    {
      name: 'no-hardcoded-routes',
      pattern: /(['"`])\/[\w\/-]+['"`]/g,
      violationType: 'error',
      message: 'Hardcoded route paths violate centralized routing',
      suggestion: 'Use ROUTES constants from @ria/utils/routes',
      autofix: (content, match) => {
        const route = match[0].replace(/['"`]/g, '');
        // Common route mappings
        const routeMap: Record<string, string> = {
          '/auth/sign-in': 'ROUTES.SIGN_IN',
          '/finance': 'ROUTES.FINANCE',
          '/tasks': 'ROUTES.TASKS',
          '/wiki': 'ROUTES.WIKI'
        };
        const replacement = routeMap[route] || `ROUTES.${route.replace(/[\/\-]/g, '_').toUpperCase()}`;
        return content.replace(match[0], replacement);
      }
    },

    // 4. No emojis in production code
    {
      name: 'no-emojis-production',
      pattern: /[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      violationType: 'warning',
      message: 'Emojis in production code affect accessibility and professionalism',
      suggestion: 'Use proper icons from design system instead',
      autofix: (content, match) => {
        // Map common emojis to proper icon components
        const emojiToIcon: Record<string, string> = {
          '📄': '<DocumentIcon className="h-8 w-8" />',
          '📋': '<ClipboardDocumentIcon className="h-8 w-8" />',
          '💳': '<CreditCardIcon className="h-8 w-8" />',
          '💰': '<CurrencyDollarIcon className="h-8 w-8" />',
          '📊': '<ChartBarIcon className="h-8 w-8" />',
          '📈': '<ChartLineUpIcon className="h-8 w-8" />',
          '⚖️': '<ScaleIcon className="h-8 w-8" />',
          '💵': '<BanknotesIcon className="h-8 w-8" />',
          '🏦': '<BuildingLibraryIcon className="h-8 w-8" />',
          '🔄': '<ArrowPathIcon className="h-8 w-8" />',
          '🧾': '<ReceiptPercentIcon className="h-8 w-8" />',
          '💱': '<CurrencyExchangeIcon className="h-8 w-8" />',
          '💸': '<BanknotesIcon className="h-8 w-8" />'
        };
        
        const replacement = emojiToIcon[match[0]] || '<div className="h-8 w-8 bg-gray-200 rounded"></div>';
        return content.replace(match[0], replacement);
      }
    },

    // 5. No any types
    {
      name: 'no-any-types',
      pattern: /:\s*any\b/g,
      violationType: 'error',
      message: 'TypeScript "any" type violates type safety',
      suggestion: 'Define proper interfaces or use specific types'
    },

    // 6. No console.log in production
    {
      name: 'no-console-log',
      pattern: /console\.log\([^)]*\);?/g,
      violationType: 'warning',
      message: 'Debug console.log statements should not be in production',
      autofix: (content, match) => {
        return content.replace(match[0], ''); // Remove console.log
      }
    },

    // 7. Require error boundaries
    {
      name: 'require-error-boundary',
      pattern: /export\s+default\s+function\s+\w+Page\(\)/g,
      violationType: 'warning',
      message: 'Page components should be wrapped in ErrorBoundary',
      suggestion: 'Wrap component content in <ErrorBoundary>'
    },

    // 8. No direct component creation in apps/web
    {
      name: 'no-inline-components',
      pattern: /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*return\s*<[^>]+>/g,
      violationType: 'warning',
      message: 'Components should be created in @ria/web-ui, not inline',
      suggestion: 'Create reusable component in packages/web-ui'
    },

    // 9. Require loading and error states
    {
      name: 'require-loading-states',
      pattern: /const\s+\{[^}]*loading[^}]*\}\s*=\s*use\w+Store\(\)/g,
      violationType: 'info',
      message: 'Good: Using loading state from store'
    },

    // 10. No direct module imports
    {
      name: 'no-direct-module-imports',
      pattern: /import.*from\s+['"`]@ria\/\w+-server['"`]/g,
      violationType: 'error',
      message: 'Direct imports between modules violate module boundaries',
      suggestion: 'Use @ria/client for cross-module communication'
    },

    // 11. Require @ria/web-ui imports
    {
      name: 'require-webui-imports',
      pattern: /import\s*\{[^}]*(?:Button|Card|Input|Modal)[^}]*\}\s*from\s*['"`](?!@ria\/web-ui)/g,
      violationType: 'error',
      message: 'UI components must be imported from @ria/web-ui',
      suggestion: 'Import from @ria/web-ui instead of creating custom components'
    }
  ];

  constructor(dryRun = false) {
    this.dryRun = dryRun;
  }

  async process(targetPath: string): Promise<ProcessResult[]> {
    console.log(`🧹 ${this.constructor.name} starting...`);
    console.log(`📋 Enforcing ${this.CLAUDE_RULES.length} CLAUDE.md rules`);
    
    // Git safety
    await this.ensureGitSafety();
    
    const files = await this.findFiles(targetPath);
    const results: ProcessResult[] = [];
    
    console.log(`📊 Processing ${files.length} files`);
    
    for (const file of files) {
      try {
        const result = await this.processFile(file);
        results.push(result);
        
        if (result.violations.length > 0) {
          console.log(`⚠️  ${path.relative('.', file)}: ${result.violations.length} violations`);
        }
      } catch (error) {
        results.push({
          file,
          success: false,
          changes: [],
          violations: [],
          errors: [String(error)]
        });
        console.error(`❌ ${file}: ${error}`);
      }
    }
    
    this.printSummary(results);
    return results;
  }

  private async ensureGitSafety(): Promise<void> {
    if (this.dryRun) return;
    
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      if (status.trim()) {
        console.log('📝 Committing changes before cleanup...');
        execSync('git add .');
        execSync(`git commit -m "Save before Code Cleanup Agent

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"`);
      }
    } catch (error) {
      console.warn('⚠️  Git commit failed, continuing with caution');
    }
  }

  private async findFiles(targetPath: string): Promise<string[]> {
    const patterns = [
      '**/*.ts',
      '**/*.tsx', 
      '!**/node_modules/**',
      '!**/dist/**',
      '!**/*.test.*',
      '!**/*.spec.*',
      '!**/scripts/**' // Don't modify tools/agents
    ];
    return await glob(patterns, { cwd: targetPath, absolute: true });
  }

  private async processFile(filePath: string): Promise<ProcessResult> {
    const originalContent = await fs.readFile(filePath, 'utf-8');
    let content = originalContent;
    const changes: string[] = [];
    const violations: CodeViolation[] = [];
    
    // Check each CLAUDE.md rule
    for (const rule of this.CLAUDE_RULES) {
      const matches = Array.from(content.matchAll(rule.pattern));
      
      for (const match of matches) {
        const lineNumber = this.getLineNumber(content, match.index!);
        
        violations.push({
          type: rule.violationType,
          rule: rule.name,
          line: lineNumber,
          message: rule.message,
          suggestion: rule.suggestion
        });
        
        // Apply autofix if available and not in dry-run
        if (rule.autofix && !this.dryRun) {
          const fixedContent = rule.autofix(content, match);
          if (fixedContent !== content) {
            content = fixedContent;
            changes.push(`Fixed ${rule.name} on line ${lineNumber}`);
          }
        }
      }
    }

    // Additional architectural checks
    await this.checkArchitecturalPatterns(filePath, content, violations);
    
    // Write fixed content if changes were made
    if (content !== originalContent && !this.dryRun) {
      await fs.writeFile(filePath, content, 'utf-8');
      changes.push('Applied automatic fixes');
    }
    
    return {
      file: filePath,
      success: true,
      changes,
      violations,
      errors: []
    };
  }

  private async checkArchitecturalPatterns(
    filePath: string, 
    content: string, 
    violations: CodeViolation[]
  ): Promise<void> {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Check if component has proper error handling
    if (fileName.endsWith('.tsx') && content.includes('export default')) {
      if (!content.includes('ErrorBoundary')) {
        violations.push({
          type: 'warning',
          rule: 'missing-error-boundary',
          line: 1,
          message: 'Page/component missing ErrorBoundary wrapper',
          suggestion: 'Wrap component in <ErrorBoundary> from @ria/web-ui'
        });
      }
      
      // Check for loading/error state handling
      if (content.includes('loading') && !content.includes('LoadingCard')) {
        violations.push({
          type: 'warning',
          rule: 'missing-loading-component',
          line: 1,
          message: 'Loading state without proper LoadingCard component',
          suggestion: 'Use <LoadingCard /> from @ria/web-ui for loading states'
        });
      }
      
      // Check if icons are used but not imported
      const iconPattern = /<(\w+Icon)\s+className="[^"]*"\s*\/>/g;
      const iconMatches = Array.from(content.matchAll(iconPattern));
      if (iconMatches.length > 0 && !content.includes('@heroicons/react')) {
        violations.push({
          type: 'warning',
          rule: 'missing-heroicons-import',
          line: 1,
          message: 'Heroicons used but not imported',
          suggestion: 'Add import statement: import { IconName } from \'@heroicons/react/24/outline\''
        });
      }
    }
    
    // Check module boundaries
    if (relativePath.includes('apps/web/') && content.includes('@ria/')) {
      const moduleImports = content.match(/@ria\/(\w+)-server/g);
      if (moduleImports) {
        violations.push({
          type: 'error',
          rule: 'module-boundary-violation',
          line: 1,
          message: `Frontend importing server module: ${moduleImports.join(', ')}`,
          suggestion: 'Use @ria/client repositories and stores instead'
        });
      }
    }
    
    // Check for proper repository pattern usage
    if (content.includes('useEffect') && content.includes('fetch(')) {
      violations.push({
        type: 'error',
        rule: 'repository-pattern-violation',
        line: 1,
        message: 'Component making direct API calls instead of using repository pattern',
        suggestion: 'Create repository in @ria/client and use via Zustand store'
      });
    }
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private printSummary(results: ProcessResult[]): void {
    const totalFiles = results.length;
    const filesWithViolations = results.filter(r => r.violations.length > 0).length;
    const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);
    const errors = results.reduce((sum, r) => sum + r.violations.filter(v => v.type === 'error').length, 0);
    const warnings = results.reduce((sum, r) => sum + r.violations.filter(v => v.type === 'warning').length, 0);
    
    console.log('\n📊 CLAUDE.md Compliance Report:');
    console.log(`   Files processed: ${totalFiles}`);
    console.log(`   Files with violations: ${filesWithViolations}`);
    console.log(`   Total violations: ${totalViolations}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Warnings: ${warnings}`);
    
    if (errors > 0) {
      console.log('\n❌ Critical violations found - these break architectural rules');
    }
    
    if (warnings > 0) {
      console.log('\n⚠️  Warnings found - these should be addressed for best practices');
    }
    
    // Show top violations
    const violationCounts = new Map<string, number>();
    results.forEach(r => {
      r.violations.forEach(v => {
        violationCounts.set(v.rule, (violationCounts.get(v.rule) || 0) + 1);
      });
    });
    
    if (violationCounts.size > 0) {
      console.log('\n🔍 Top violations:');
      [...violationCounts.entries()]
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([rule, count]) => {
          console.log(`   ${rule}: ${count} occurrences`);
        });
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
🧹 Code Cleanup Agent - Enforces CLAUDE.md architectural rules

This super-careful agent finds and fixes violations of:
• Module boundaries (no direct imports between modules)  
• Repository pattern (no direct API calls)
• Zustand stores (no useState for shared data)
• Component library (@ria/web-ui only)
• Centralized routing (ROUTES constants)
• No emojis in production code
• Error boundaries and loading states
• TypeScript-first (no any types)

Usage:
  tsx scripts/code-cleaner.ts [path] [--dry-run]

Options:
  --dry-run    Analyze only, show violations but don't fix
  --help       Show this help

Examples:
  tsx scripts/code-cleaner.ts apps/web --dry-run
  tsx scripts/code-cleaner.ts packages/client
  tsx scripts/code-cleaner.ts . --dry-run

The agent will:
1. Commit current changes to Git (safety first)
2. Scan files for CLAUDE.md rule violations
3. Apply automatic fixes where possible
4. Report remaining violations that need manual fixes
`);
    return;
  }

  const cleaner = new CodeCleaner(dryRun);
  const results = await cleaner.process(targetPath);
  
  const hasErrors = results.some(r => r.violations.some(v => v.type === 'error'));
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(`\n📊 ${successful} successful, ${failed} failed`);
  
  if (dryRun) {
    console.log('✨ Dry run complete - no changes made');
  } else {
    console.log('✨ Cleanup complete - check Git diff for changes');
  }
  
  if (hasErrors) {
    console.log('⚠️  Critical architectural violations found - manual fixes needed');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { CodeCleaner };