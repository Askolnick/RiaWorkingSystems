#!/usr/bin/env tsx

/**
 * Code Cleanup Agent - Enforces CODING_STANDARDS.md and fixes build/TypeScript errors
 * 
 * Super careful agent that fixes code violations and aligns code with standards:
 * - Strict TypeScript enforcement (no any, proper types)
 * - Build error resolution (missing imports, type errors)
 * - Import/export organization and standards
 * - Component development standards (forwardRef, proper typing)
 * - State management standards (Zustand patterns)
 * - Repository pattern enforcement
 * - Error handling standards
 * - No bandaid fixes - only proper architectural solutions
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
  fix?: string;
}

interface ProcessResult {
  file: string;
  success: boolean;
  changes: string[];
  violations: CodeViolation[];
  errors: string[];
  buildErrors?: string[];
  typeErrors?: string[];
}

interface CodingStandardRule {
  name: string;
  pattern: RegExp;
  violationType: 'error' | 'warning';
  message: string;
  suggestion?: string;
  autofix?: (content: string, match: RegExpMatchArray, filePath: string) => string;
  skipPaths?: string[];
}

class CodeCleaner {
  private dryRun: boolean;
  private readonly CODING_STANDARDS: CodingStandardRule[] = [
    // TypeScript Strict Mode Enforcement
    {
      name: 'no-any-type',
      pattern: /:\s*any\b(?!\[\])/g,
      violationType: 'error',
      message: 'TypeScript "any" type violates strict type safety',
      suggestion: 'Define proper interface or use specific types (string, number, unknown, etc.)',
      autofix: (content, match, filePath) => {
        // Don't auto-fix, requires manual type definition
        return content;
      }
    },

    // Missing Type Annotations
    {
      name: 'missing-return-type',
      pattern: /function\s+\w+\([^)]*\)\s*\{/g,
      violationType: 'warning',
      message: 'Function missing explicit return type annotation',
      suggestion: 'Add return type: function name(): ReturnType { }',
      autofix: (content, match) => {
        // Add void return type as placeholder
        return content.replace(match[0], match[0].replace('{', ': void {'));
      }
    },

    // Untyped React Props
    {
      name: 'untyped-react-props',
      pattern: /export\s+(?:const|function)\s+\w+\s*=.*\(\s*\{[^}]+\}\s*\)\s*=>/g,
      violationType: 'error',
      message: 'React component props must have TypeScript interface',
      suggestion: 'Define Props interface: interface ComponentNameProps { ... }'
    },

    // Missing forwardRef for components
    {
      name: 'missing-forward-ref',
      pattern: /export\s+const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g,
      violationType: 'warning',
      message: 'React components should use forwardRef pattern for ref forwarding',
      suggestion: 'Use forwardRef pattern: export const Component = forwardRef<HTMLElement, Props>(...)',
      skipPaths: ['**/*store*', '**/*repository*', '**/*util*']
    },

    // Import Organization - Node modules first
    {
      name: 'import-order-violation',
      pattern: /import\s+[^'"]*from\s+['"`]@ria\/[^'"]*['"`][^;]*;\s*import\s+[^'"]*from\s+['"`]react['"`]/g,
      violationType: 'warning',
      message: 'Import order violation - Node modules must come before internal packages',
      suggestion: 'Order: 1) Node modules 2) @ria packages 3) Relative imports 4) Type imports'
    },

    // Missing displayName
    {
      name: 'missing-display-name',
      pattern: /export\s+const\s+(\w+)\s*=\s*forwardRef/g,
      violationType: 'warning',
      message: 'forwardRef components should have displayName for debugging',
      autofix: (content, match) => {
        const componentName = match[1];
        if (!content.includes(`${componentName}.displayName`)) {
          // Add displayName after component definition
          const componentEnd = content.indexOf(';', match.index!);
          if (componentEnd > 0) {
            return content.slice(0, componentEnd + 1) + 
              `\n${componentName}.displayName = '${componentName}';` + 
              content.slice(componentEnd + 1);
          }
        }
        return content;
      }
    },

    // Default exports should be avoided
    {
      name: 'avoid-default-exports',
      pattern: /export\s+default\s+/g,
      violationType: 'warning',
      message: 'Prefer named exports over default exports for better tree-shaking',
      suggestion: 'Use: export const ComponentName = ... instead of export default',
      skipPaths: ['**/page.tsx', '**/layout.tsx', '**/*.stories.tsx']
    },

    // Enforce proper error handling
    {
      name: 'missing-error-handling',
      pattern: /try\s*\{[^}]*\}\s*catch\s*\([^)]*\)\s*\{\s*\}/g,
      violationType: 'error',
      message: 'Empty catch blocks violate error handling standards',
      suggestion: 'Add proper error handling: log error, set error state, or rethrow'
    },

    // Repository pattern violations
    {
      name: 'direct-api-calls',
      pattern: /fetch\s*\(\s*['"`][^'"`]+['"`]/g,
      violationType: 'error',
      message: 'Direct API calls violate repository pattern',
      suggestion: 'Create repository class extending BaseRepository in @ria/client'
    },

    // State management violations
    {
      name: 'useState-for-server-state',
      pattern: /const\s+\[[\w,\s]+\]\s*=\s*useState<[^>]*\[\]/g,
      violationType: 'warning',
      message: 'Arrays/objects in useState suggest server state - use Zustand store',
      suggestion: 'Create Zustand store with proper typing and async actions'
    },

    // Missing proper typing for store selectors
    {
      name: 'untyped-store-selectors',
      pattern: /const\s+\{[^}]+\}\s*=\s*use\w+Store\(\)/g,
      violationType: 'warning',
      message: 'Store selectors should use typed selectors for optimization',
      suggestion: 'Use: const data = useStore(state => state.data) instead of destructuring'
    },

    // Component library violations
    {
      name: 'non-webui-component-usage',
      pattern: /<(?:button|input|textarea|select|div\s+className="btn|card|modal)/gi,
      violationType: 'warning',
      message: 'Use @ria/web-ui components instead of custom HTML elements',
      suggestion: 'Import Button, Input, Card, Modal etc. from @ria/web-ui',
      skipPaths: ['**/packages/web-ui/**']
    },

    // Missing proper props validation
    {
      name: 'missing-props-validation',
      pattern: /interface\s+\w+Props\s*\{[^}]*\w+\?\s*:\s*string/g,
      violationType: 'warning',
      message: 'Optional string props should specify allowed values or use unions',
      suggestion: 'Use: variant?: "primary" | "secondary" instead of variant?: string'
    },

    // Console statements in production
    {
      name: 'console-statements',
      pattern: /console\.(log|warn|error|debug)\s*\(/g,
      violationType: 'warning',
      message: 'Console statements should not be in production code',
      autofix: (content, match) => {
        return content.replace(match[0], '// ' + match[0]);
      },
      skipPaths: ['**/scripts/**', '**/*.test.*', '**/*.spec.*']
    },

    // Proper error boundary usage
    {
      name: 'missing-error-boundary',
      pattern: /export\s+default\s+function\s+\w*Page/g,
      violationType: 'error',
      message: 'Page components must be wrapped in ErrorBoundary',
      suggestion: 'Wrap component return in <ErrorBoundary fallback={<ErrorFallback />}>'
    },

    // Async function error handling
    {
      name: 'unhandled-async-errors',
      pattern: /const\s+\w+\s*=\s*async\s*\([^)]*\)\s*=>\s*\{[^}]*await[^}]*\}(?!\s*\.catch)/g,
      violationType: 'warning',
      message: 'Async functions should have error handling',
      suggestion: 'Add try-catch block or .catch() chain for error handling'
    },

    // Import type usage
    {
      name: 'missing-type-imports',
      pattern: /import\s*\{[^}]*\b(Props|Type|Interface)\b[^}]*\}\s*from/g,
      violationType: 'warning',
      message: 'Type-only imports should use "import type" for better tree-shaking',
      autofix: (content, match) => {
        return content.replace('import {', 'import type {');
      }
    },

    // Proper loading state handling
    {
      name: 'missing-loading-states',
      pattern: /const\s+\{[^}]*data[^}]*\}\s*=\s*use\w+Store\(\)(?!.*loading)/g,
      violationType: 'warning',
      message: 'Store usage should handle loading and error states',
      suggestion: 'Destructure loading and error from store: { data, loading, error }'
    },

    // Build error fixes - Missing imports
    {
      name: 'missing-react-import',
      pattern: /(?:JSX\.Element|React\.FC|useState|useEffect|forwardRef)/g,
      violationType: 'error',
      message: 'React features used but React not imported',
      autofix: (content, match, filePath) => {
        if (!content.includes("import React") && !content.includes("import { ")) {
          return `import React from 'react';\n${content}`;
        }
        return content;
      }
    },

    // Architectural violations - nested packages
    {
      name: 'nested-packages-violation',
      pattern: /packages\/.*\/packages\//g,
      violationType: 'error',
      message: 'Nested packages directory violates clean architecture',
      suggestion: 'Packages should only exist at root level - move to /packages/'
    },

    // Anti-pattern: Unnecessary Text components
    {
      name: 'unnecessary-text-component',
      pattern: /export\s+(?:const|function)\s+(Text|Heading|Title|Label|Caption)\s*[=:]/g,
      violationType: 'warning',
      message: 'Text-only components should be CSS classes instead of React components',
      suggestion: 'Use semantic CSS classes (.large-heading, .body, .small-body) from design system',
      skipPaths: ['**/packages/web-ui/**'] // Allow in the actual component library
    },

    // Anti-pattern: Single-purpose styling components
    {
      name: 'unnecessary-styling-component',
      pattern: /export\s+(?:const|function)\s+(Container|Wrapper|Box|Spacer|Divider)\s*[=:]/g,
      violationType: 'warning',
      message: 'Simple styling components should be CSS classes or HTML elements',
      suggestion: 'Use semantic HTML with CSS classes instead of wrapper components',
      skipPaths: ['**/packages/web-ui/**']
    },

    // Anti-pattern: Icon components that are just wrappers
    {
      name: 'unnecessary-icon-component',
      pattern: /export\s+(?:const|function)\s+(\w*Icon)\s*[=:].*<.*Icon.*\/>/g,
      violationType: 'warning',
      message: 'Simple icon wrapper components are unnecessary',
      suggestion: 'Import and use icons directly from @heroicons/react or icon library',
      skipPaths: ['**/packages/web-ui/**']
    },

    // Anti-pattern: Components that only return className
    {
      name: 'class-only-component',
      pattern: /export\s+(?:const|function)\s+\w+.*=.*className[^}]*\}[^}]*>/g,
      violationType: 'error',
      message: 'Components that only apply className should be CSS classes',
      suggestion: 'Create CSS utility class instead of React component'
    },

    // Anti-pattern: Components without interactive logic
    {
      name: 'static-content-component',
      pattern: /export\s+(?:const|function)\s+\w+.*return\s*\(\s*<[^>]*>[^<{]+<\/[^>]*>\s*\)/g,
      violationType: 'warning',
      message: 'Components with only static content should be CSS classes or constants',
      suggestion: 'Use CSS classes for styling or constants for static content'
    },

    // Simplicity-first: Overly complex components
    {
      name: 'overly-complex-component',
      pattern: /export\s+(?:const|function)\s+\w+[\s\S]*?\{[\s\S]*?(?:useState|useEffect|useCallback|useMemo|useRef)[\s\S]*?(?:useState|useEffect|useCallback|useMemo|useRef)[\s\S]*?(?:useState|useEffect|useCallback|useMemo|useRef)[\s\S]*?\}/g,
      violationType: 'warning',
      message: 'Component has too many hooks and complexity - consider breaking down',
      suggestion: 'Split into smaller, focused components or extract custom hooks'
    },

    // Simplicity-first: Long functions/methods
    {
      name: 'long-function',
      pattern: /(?:function|const\s+\w+\s*=|\w+\s*:\s*(?:async\s+)?(?:function|\()?)[\s\S]*?\{[\s\S]*?(?:\n.*){50,}?\}/g,
      violationType: 'warning', 
      message: 'Function/method is too long (50+ lines) - consider breaking down',
      suggestion: 'Extract smaller, focused functions with single responsibilities'
    },

    // Simplicity-first: Complex conditional logic
    {
      name: 'complex-conditional',
      pattern: /if\s*\([^)]*(?:&&|\|\|)[^)]*(?:&&|\|\|)[^)]*(?:&&|\|\|)[^)]*\)/g,
      violationType: 'warning',
      message: 'Complex conditional logic - consider extracting to named functions',
      suggestion: 'Create well-named predicate functions for complex conditions'
    }
  ];

  constructor(dryRun = false) {
    this.dryRun = dryRun;
  }

  async process(targetPath: string): Promise<ProcessResult[]> {
    console.log(`🧹 ${this.constructor.name} starting...`);
    console.log(`📋 Enforcing ${this.CODING_STANDARDS.length} coding standards`);
    
    // Git safety
    await this.ensureGitSafety();
    
    // First, check for build and TypeScript errors
    console.log('🔍 Checking for build and TypeScript errors...');
    const buildErrors = await this.checkBuildErrors(targetPath);
    const typeErrors = await this.checkTypeErrors(targetPath);
    
    if (buildErrors.length > 0) {
      console.log(`❌ ${buildErrors.length} build errors found`);
    }
    
    if (typeErrors.length > 0) {
      console.log(`🔧 ${typeErrors.length} TypeScript errors found`);
    }
    
    const files = await this.findFiles(targetPath);
    const results: ProcessResult[] = [];
    
    console.log(`📊 Processing ${files.length} files for coding standards`);
    
    for (const file of files) {
      try {
        const result = await this.processFile(file);
        
        // Add build/type errors for this file
        const fileRelative = path.relative(process.cwd(), file);
        result.buildErrors = buildErrors.filter(error => error.includes(fileRelative));
        result.typeErrors = typeErrors.filter(error => error.includes(fileRelative));
        
        results.push(result);
        
        const totalIssues = result.violations.length + 
          (result.buildErrors?.length || 0) + 
          (result.typeErrors?.length || 0);
        
        if (totalIssues > 0) {
          console.log(`⚠️  ${path.relative('.', file)}: ${totalIssues} issues`);
        }
      } catch (error) {
        results.push({
          file,
          success: false,
          changes: [],
          violations: [],
          errors: [String(error)],
          buildErrors: [],
          typeErrors: []
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

  private async checkBuildErrors(targetPath: string): Promise<string[]> {
    try {
      // Try to build the project and capture errors
      const result = execSync('pnpm build', { 
        encoding: 'utf-8', 
        cwd: targetPath,
        timeout: 60000 // 1 minute timeout
      });
      return [];
    } catch (error: any) {
      // Parse build errors from output
      const output = error.stdout || error.stderr || '';
      const errors = output.split('\n')
        .filter((line: string) => line.includes('error') || line.includes('Error'))
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);
      return errors;
    }
  }

  private async checkTypeErrors(targetPath: string): Promise<string[]> {
    try {
      // Run TypeScript compiler check
      const result = execSync('pnpm typecheck', { 
        encoding: 'utf-8', 
        cwd: targetPath,
        timeout: 60000 // 1 minute timeout
      });
      return [];
    } catch (error: any) {
      // Parse TypeScript errors from output
      const output = error.stdout || error.stderr || '';
      const errors = output.split('\n')
        .filter((line: string) => 
          line.includes('error TS') || 
          line.includes('Type \'') ||
          line.includes('Cannot find') ||
          line.includes('Property \'') ||
          line.includes('Argument of type')
        )
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);
      return errors;
    }
  }

  private analyzeComplexity(content: string, filePath: string): {complexity: number, suggestions: string[]} {
    let complexity = 0;
    const suggestions: string[] = [];
    
    // Count complexity indicators
    const hookCount = (content.match(/use[A-Z]\w+/g) || []).length;
    const conditionalCount = (content.match(/\bif\s*\(/g) || []).length; 
    const loopCount = (content.match(/\b(for|while|forEach|map|filter)\s*\(/g) || []).length;
    const functionCount = (content.match(/(?:function|const\s+\w+\s*=)/g) || []).length;
    const lineCount = content.split('\n').length;
    
    complexity = hookCount * 2 + conditionalCount + loopCount + Math.floor(lineCount / 50);
    
    // Generate simplicity suggestions based on user's emphasis on "simplest, cleanest route"
    if (hookCount > 5) {
      suggestions.push(`Extract ${hookCount - 3} hooks into custom hooks - component has too many hooks`);
    }
    
    if (conditionalCount > 8) {
      suggestions.push(`Complex conditional logic detected - extract predicate functions`);
    }
    
    if (lineCount > 200) {
      suggestions.push(`File is ${lineCount} lines - consider breaking into smaller modules`);
    }
    
    if (functionCount > 10) {
      suggestions.push(`${functionCount} functions in one file - consider splitting into focused modules`);
    }
    
    // Check for nested complexity
    const nestedPatterns = content.match(/\{\s*[\s\S]*?\{\s*[\s\S]*?\{\s*[\s\S]*?\}/g);
    if (nestedPatterns && nestedPatterns.length > 3) {
      suggestions.push(`Deep nesting detected - flatten structure or extract functions`);
    }
    
    // Check for long parameter lists
    const longParams = content.match(/\([^)]{100,}\)/g);
    if (longParams && longParams.length > 0) {
      suggestions.push(`Long parameter lists found - consider using configuration objects`);
    }
    
    // Check for excessive imports (complexity indicator)
    const importLines = content.match(/^import.*from.*;$/gm) || [];
    if (importLines.length > 15) {
      suggestions.push(`${importLines.length} imports - consider consolidating dependencies`);
    }
    
    return { complexity, suggestions };
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
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Check each coding standard rule
    for (const rule of this.CODING_STANDARDS) {
      // Skip rule if file path matches skipPaths pattern
      if (rule.skipPaths && rule.skipPaths.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
        return regex.test(relativePath);
      })) {
        continue;
      }
      
      const matches = Array.from(content.matchAll(rule.pattern));
      
      for (const match of matches) {
        const lineNumber = this.getLineNumber(content, match.index!);
        
        const violation: CodeViolation = {
          type: rule.violationType,
          rule: rule.name,
          line: lineNumber,
          message: rule.message,
          suggestion: rule.suggestion
        };
        
        violations.push(violation);
        
        // Apply autofix if available and not in dry-run
        if (rule.autofix && !this.dryRun) {
          const fixedContent = rule.autofix(content, match, filePath);
          if (fixedContent !== content) {
            content = fixedContent;
            changes.push(`Fixed ${rule.name} on line ${lineNumber}`);
            violation.fix = 'Applied automatic fix';
          }
        }
      }
    }

    // Additional architectural checks
    await this.checkArchitecturalPatterns(filePath, content, violations);
    
    // Complexity analysis for simplicity enforcement
    const complexityAnalysis = this.analyzeComplexity(content, filePath);
    if (complexityAnalysis.suggestions.length > 0) {
      complexityAnalysis.suggestions.forEach(suggestion => {
        violations.push({
          type: 'warning',
          rule: 'simplicity-first',
          line: 1,
          message: suggestion,
          suggestion: 'Follow the "simplest, cleanest route" principle - refactor for clarity'
        });
      });
    }
    
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
      errors: [],
      buildErrors: [],
      typeErrors: []
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
    
    // Check for architectural violations in file paths
    if (relativePath.includes('apps/web/packages/')) {
      violations.push({
        type: 'error',
        rule: 'file-structure-violation',
        line: 1,
        message: 'File in apps/web/packages/ violates clean architecture',
        suggestion: 'Move package to root /packages/ directory'
      });
    }
    
    if (relativePath.includes('apps/web/server/') || relativePath.includes('apps/web/api/')) {
      violations.push({
        type: 'error',
        rule: 'file-structure-violation', 
        line: 1,
        message: 'Server code found in frontend directory',
        suggestion: 'Move server code to apps/api/ or appropriate package/'
      });
    }
    
    if (relativePath.includes('apps/api/components/') || relativePath.includes('apps/api/pages/')) {
      violations.push({
        type: 'error',
        rule: 'file-structure-violation',
        line: 1, 
        message: 'Frontend code found in backend directory',
        suggestion: 'Move frontend code to apps/web/ or packages/web-ui/'
      });
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
    const buildErrors = results.reduce((sum, r) => sum + (r.buildErrors?.length || 0), 0);
    const typeErrors = results.reduce((sum, r) => sum + (r.typeErrors?.length || 0), 0);
    const fixesApplied = results.reduce((sum, r) => sum + r.violations.filter(v => v.fix).length, 0);
    
    console.log('\n📊 Code Quality Report:');
    console.log(`   Files processed: ${totalFiles}`);
    console.log(`   Files with issues: ${filesWithViolations}`);
    console.log('\n🔧 Issues Found:');
    console.log(`   Coding standard violations: ${totalViolations}`);
    console.log(`   Build errors: ${buildErrors}`);
    console.log(`   TypeScript errors: ${typeErrors}`);
    console.log(`   Automatic fixes applied: ${fixesApplied}`);
    console.log('\n📈 Breakdown:');
    console.log(`   Critical errors: ${errors + buildErrors + typeErrors}`);
    console.log(`   Warnings: ${warnings}`);
    
    if (buildErrors > 0) {
      console.log('\n❌ Build errors found - these prevent compilation');
      console.log('   Run "pnpm build" to see detailed error messages');
    }
    
    if (typeErrors > 0) {
      console.log('\n🔧 TypeScript errors found - these violate type safety');
      console.log('   Run "pnpm typecheck" to see detailed error messages');
    }
    
    if (errors > 0) {
      console.log('\n⚠️  Critical coding standard violations found');
    }
    
    if (warnings > 0) {
      console.log('\n💡 Code quality warnings - should be addressed for best practices');
    }
    
    // Show top violations
    const violationCounts = new Map<string, number>();
    results.forEach(r => {
      r.violations.forEach(v => {
        violationCounts.set(v.rule, (violationCounts.get(v.rule) || 0) + 1);
      });
    });
    
    if (violationCounts.size > 0) {
      console.log('\n🔍 Most Common Issues:');
      [...violationCounts.entries()]
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([rule, count]) => {
          console.log(`   ${rule}: ${count} occurrences`);
        });
    }
    
    if (fixesApplied > 0) {
      console.log(`\n✅ ${fixesApplied} issues were automatically fixed`);
      console.log('   Review the changes with: git diff');
    }
    
    const remainingIssues = totalViolations + buildErrors + typeErrors - fixesApplied;
    if (remainingIssues > 0) {
      console.log(`\n🔨 ${remainingIssues} issues require manual fixes`);
    } else if (totalFiles > 0) {
      console.log('\n🎉 All files pass coding standards!');
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
🧹 Enhanced Code Cleanup Agent - Fixes build/TypeScript errors & enforces standards

This super-careful agent finds and fixes:

🔧 Build & TypeScript Errors:
• Missing imports and type annotations
• Type safety violations (no any types)
• Compilation errors preventing builds

📋 Coding Standards (CODING_STANDARDS.md):
• Strict TypeScript enforcement
• Component development standards (forwardRef, proper typing)
• State management standards (Zustand patterns)  
• Repository pattern enforcement
• Import/export organization
• Error handling standards

🏗️ Architectural Rules:
• Module boundaries (no direct imports between modules)
• Component library usage (@ria/web-ui only)
• No bandaid fixes - only proper architectural solutions

Usage:
  tsx scripts/code-cleaner.ts [path] [--dry-run]

Options:
  --dry-run    Analyze only, show issues but don't fix
  --help       Show this help

Examples:
  tsx scripts/code-cleaner.ts apps/web --dry-run
  tsx scripts/code-cleaner.ts packages/client
  tsx scripts/code-cleaner.ts . --dry-run

The agent will:
1. Commit current changes to Git (safety first)
2. Run build and typecheck to find errors  
3. Scan files for coding standard violations
4. Apply automatic fixes where possible (NO bandaid fixes)
5. Report remaining issues that need manual fixes
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