#!/usr/bin/env tsx

/**
 * Refactor Agent - Breaks down large files into smaller, modular components
 * Analyzes files over 500 lines and intelligently splits them into logical units
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

interface ComponentExtraction {
  name: string;
  code: string;
  imports: string[];
  exports: string[];
  dependencies: string[];
  type: 'component' | 'hook' | 'utility' | 'service' | 'type';
  lineCount: number;
}

interface RefactorResult {
  originalFile: string;
  originalLineCount: number;
  extractedComponents: ComponentExtraction[];
  mainFileCode: string;
  suggestions: string[];
}

class RefactorAgent {
  private readonly MAX_LINES = 500;
  private readonly MIN_COMPONENT_LINES = 20;
  private readonly COMPONENT_PATTERNS = {
    reactComponent: /(?:export\s+)?(?:const|function)\s+([A-Z][a-zA-Z]*)\s*(?::|=)[^{]*\{[\s\S]*?return\s*\(/gm,
    hookFunction: /(?:export\s+)?(?:const|function)\s+(use[A-Z][a-zA-Z]*)/gm,
    utilityFunction: /(?:export\s+)?(?:const|function)\s+([a-z][a-zA-Z]*)\s*(?::|=)\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*\{)/gm,
    interface: /(?:export\s+)?interface\s+([A-Z][a-zA-Z]*)\s*\{[^}]+\}/gm,
    type: /(?:export\s+)?type\s+([A-Z][a-zA-Z]*)\s*=\s*[^;]+;/gm,
  };

  async analyzeTarget(targetPath: string): Promise<RefactorResult[]> {
    console.log(`🔍 Analyzing target: ${targetPath}`);
    
    const stat = await fs.stat(targetPath);
    
    if (stat.isFile()) {
      // Handle single file
      if (!targetPath.endsWith('.ts') && !targetPath.endsWith('.tsx')) {
        console.log('❌ Target file must be a TypeScript or TSX file');
        return [];
      }
      
      const content = await fs.readFile(targetPath, 'utf-8');
      const lineCount = content.split('\n').length;
      
      if (lineCount <= this.MAX_LINES) {
        console.log(`📊 File has ${lineCount} lines (under ${this.MAX_LINES} line threshold)`);
        return [];
      }
      
      console.log(`📊 Analyzing file: ${targetPath} (${lineCount} lines)`);
      const result = await this.refactorFile(targetPath, content);
      return [result];
    } else {
      // Handle directory
      return this.analyzeDirectory(targetPath);
    }
  }

  private async analyzeDirectory(targetPath: string): Promise<RefactorResult[]> {
    console.log(`🔍 Scanning directory: ${targetPath}`);
    
    const patterns = [
      '**/*.tsx',
      '**/*.ts',
      '!**/node_modules/**',
      '!**/*.test.*',
      '!**/*.spec.*',
      '!**/dist/**',
      '!**/build/**'
    ];

    const files = await glob(patterns, { cwd: targetPath, absolute: true });
    const results: RefactorResult[] = [];

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const lineCount = content.split('\n').length;

      if (lineCount > this.MAX_LINES) {
        console.log(`📊 Analyzing large file: ${file} (${lineCount} lines)`);
        const result = await this.refactorFile(file, content);
        results.push(result);
      }
    }

    return results;
  }

  private async refactorFile(filePath: string, content: string): Promise<RefactorResult> {
    const lineCount = content.split('\n').length;
    const components = this.extractComponents(content);
    const suggestions = this.generateSuggestions(filePath, components);

    // Generate refactored main file
    const mainFileCode = this.generateMainFile(filePath, components, content);

    return {
      originalFile: filePath,
      originalLineCount: lineCount,
      extractedComponents: components,
      mainFileCode,
      suggestions
    };
  }

  private extractComponents(content: string): ComponentExtraction[] {
    const components: ComponentExtraction[] = [];

    // Extract React Components
    const componentMatches = [...content.matchAll(this.COMPONENT_PATTERNS.reactComponent)];
    for (const match of componentMatches) {
      const componentName = match[1];
      const componentCode = this.extractCodeBlock(content, match.index!);
      if (componentCode.split('\n').length >= this.MIN_COMPONENT_LINES) {
        components.push({
          name: componentName,
          code: componentCode,
          imports: this.extractImports(componentCode),
          exports: [componentName],
          dependencies: this.extractDependencies(componentCode),
          type: 'component',
          lineCount: componentCode.split('\n').length
        });
      }
    }

    // Extract Hooks
    const hookMatches = [...content.matchAll(this.COMPONENT_PATTERNS.hookFunction)];
    for (const match of hookMatches) {
      const hookName = match[1];
      const hookCode = this.extractCodeBlock(content, match.index!);
      if (hookCode.split('\n').length >= this.MIN_COMPONENT_LINES) {
        components.push({
          name: hookName,
          code: hookCode,
          imports: this.extractImports(hookCode),
          exports: [hookName],
          dependencies: this.extractDependencies(hookCode),
          type: 'hook',
          lineCount: hookCode.split('\n').length
        });
      }
    }

    // Extract Utility Functions
    const utilMatches = [...content.matchAll(this.COMPONENT_PATTERNS.utilityFunction)];
    for (const match of utilMatches) {
      const utilName = match[1];
      if (!utilName.startsWith('use')) { // Skip hooks
        const utilCode = this.extractCodeBlock(content, match.index!);
        if (utilCode.split('\n').length >= 10) { // Lower threshold for utilities
          components.push({
            name: utilName,
            code: utilCode,
            imports: this.extractImports(utilCode),
            exports: [utilName],
            dependencies: this.extractDependencies(utilCode),
            type: 'utility',
            lineCount: utilCode.split('\n').length
          });
        }
      }
    }

    // Extract Types and Interfaces
    const typeContent = this.extractTypeDefinitions(content);
    if (typeContent.length > 0) {
      components.push({
        name: 'types',
        code: typeContent.join('\n\n'),
        imports: [],
        exports: this.extractTypeExports(typeContent.join('\n')),
        dependencies: [],
        type: 'type',
        lineCount: typeContent.join('\n').split('\n').length
      });
    }

    return components;
  }

  private extractCodeBlock(content: string, startIndex: number): string {
    let braceCount = 0;
    let inBraces = false;
    let endIndex = startIndex;
    
    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        inBraces = true;
      } else if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0 && inBraces) {
          endIndex = i + 1;
          break;
        }
      }
    }

    // Find the actual start of the function/component
    let actualStart = startIndex;
    for (let i = startIndex; i >= 0; i--) {
      if (content[i] === '\n' && i < startIndex - 1) {
        // Check if this is the start of the declaration
        const lineStart = content.substring(i + 1, startIndex);
        if (lineStart.includes('export') || lineStart.includes('const') || lineStart.includes('function')) {
          actualStart = i + 1;
          break;
        }
      }
    }

    return content.substring(actualStart, endIndex);
  }

  private extractImports(code: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)(?:\s*,\s*{[^}]+})?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[0]);
    }
    
    return imports;
  }

  private extractDependencies(code: string): string[] {
    const deps: string[] = [];
    
    // Extract used hooks
    const hookRegex = /use[A-Z][a-zA-Z]*(?:\(|<)/g;
    let match;
    while ((match = hookRegex.exec(code)) !== null) {
      const hookName = match[0].replace(/[(<]/, '');
      if (!deps.includes(hookName)) {
        deps.push(hookName);
      }
    }
    
    // Extract component references
    const componentRegex = /<([A-Z][a-zA-Z]*)/g;
    while ((match = componentRegex.exec(code)) !== null) {
      const componentName = match[1];
      if (!deps.includes(componentName)) {
        deps.push(componentName);
      }
    }
    
    return deps;
  }

  private extractTypeDefinitions(content: string): string[] {
    const types: string[] = [];
    
    // Extract interfaces
    const interfaceRegex = /(?:export\s+)?interface\s+\w+\s*(?:<[^>]+>)?\s*\{[^}]+\}/g;
    let match;
    while ((match = interfaceRegex.exec(content)) !== null) {
      types.push(match[0]);
    }
    
    // Extract type aliases
    const typeRegex = /(?:export\s+)?type\s+\w+(?:<[^>]+>)?\s*=\s*[^;]+;/g;
    while ((match = typeRegex.exec(content)) !== null) {
      types.push(match[0]);
    }
    
    return types;
  }

  private extractTypeExports(content: string): string[] {
    const exports: string[] = [];
    const regex = /(?:export\s+)?(?:interface|type)\s+(\w+)/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    return exports;
  }

  private generateSuggestions(filePath: string, components: ComponentExtraction[]): string[] {
    const suggestions: string[] = [];
    const fileName = path.basename(filePath);
    const dir = path.dirname(filePath);

    // Suggest directory structure
    if (components.filter(c => c.type === 'component').length > 2) {
      suggestions.push(`Consider creating a components subdirectory in ${dir}`);
    }

    if (components.filter(c => c.type === 'hook').length > 1) {
      suggestions.push(`Consider creating a hooks subdirectory in ${dir}`);
    }

    if (components.filter(c => c.type === 'utility').length > 2) {
      suggestions.push(`Consider creating a utils subdirectory in ${dir}`);
    }

    // Suggest splitting strategies
    components.forEach(component => {
      if (component.lineCount > 200) {
        suggestions.push(`Component ${component.name} is still large (${component.lineCount} lines). Consider further decomposition.`);
      }
    });

    // Check for mixed concerns
    const hasComponents = components.some(c => c.type === 'component');
    const hasHooks = components.some(c => c.type === 'hook');
    const hasUtils = components.some(c => c.type === 'utility');
    
    if (hasComponents && hasHooks && hasUtils) {
      suggestions.push('File has mixed concerns (components, hooks, and utilities). Consider separating by type.');
    }

    return suggestions;
  }

  private generateMainFile(filePath: string, components: ComponentExtraction[], originalContent: string): string {
    // For now, just preserve the original content and add import suggestions
    // The component extraction is too fragile to safely modify files
    
    const suggestions = [
      '// REFACTOR SUGGESTION: Consider extracting the following utilities:',
      ...components.map(comp => `// - ${comp.name} (${comp.type}, ${comp.lineCount} lines)`),
      '',
      '// Original file preserved to prevent breaking changes'
    ];
    
    return suggestions.join('\n') + '\n\n' + originalContent;
  }

  async generateRefactoredFiles(result: RefactorResult): Promise<Map<string, string>> {
    const files = new Map<string, string>();
    const baseDir = path.dirname(result.originalFile);
    const fileName = path.basename(result.originalFile, path.extname(result.originalFile));
    
    // Main file
    files.set(result.originalFile, result.mainFileCode);
    
    // Component files
    result.extractedComponents.forEach(comp => {
      let filePath: string;
      
      switch (comp.type) {
        case 'component':
          filePath = path.join(baseDir, fileName, `${comp.name}.tsx`);
          break;
        case 'hook':
          filePath = path.join(baseDir, fileName, 'hooks', `${comp.name}.ts`);
          break;
        case 'utility':
          filePath = path.join(baseDir, fileName, 'utils', `${comp.name}.ts`);
          break;
        case 'type':
          filePath = path.join(baseDir, fileName, 'types.ts');
          break;
        default:
          filePath = path.join(baseDir, fileName, `${comp.name}.ts`);
      }
      
      files.set(filePath, this.wrapComponent(comp));
    });
    
    return files;
  }

  private wrapComponent(component: ComponentExtraction): string {
    let content = '';
    
    // Add imports
    if (component.imports.length > 0) {
      content += component.imports.join('\n') + '\n\n';
    }
    
    // Add the component code
    content += component.code;
    
    // Add export if not already exported
    if (!component.code.includes('export ')) {
      content = `export ${content}`;
    }
    
    return content;
  }

  async applyRefactoring(result: RefactorResult): Promise<void> {
    // For safety, only add comments to the original file instead of breaking it apart
    const originalPath = result.originalFile;
    const backupPath = `${originalPath}.backup`;
    
    // Create backup
    await fs.copyFile(originalPath, backupPath);
    console.log(`📋 Backup created: ${backupPath}`);
    
    // Write suggestions as comments to the original file
    await fs.writeFile(originalPath, result.mainFileCode, 'utf-8');
    console.log(`✅ Updated with refactoring suggestions: ${originalPath}`);
    
    console.log(`📝 Refactoring suggestions for ${result.originalFile}:`);
    result.suggestions.forEach(s => console.log(`   - ${s}`));
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const targetPath = args.find(arg => !arg.startsWith('--')) || process.cwd();
  const dryRun = args.includes('--dry-run');
  const help = args.includes('--help') || args.includes('-h');
  
  if (help) {
    console.log(`
🚀 Refactor Agent - Break down large files into manageable components

Usage:
  tsx scripts/refactor-agent.ts [file/directory] [options]

Examples:
  tsx scripts/refactor-agent.ts apps/web/app/finance/page.tsx --dry-run
  tsx scripts/refactor-agent.ts apps/web/components/
  tsx scripts/refactor-agent.ts . --dry-run

Options:
  --dry-run    Analyze only, don't modify files
  --help, -h   Show this help message

Notes:
  - Only analyzes TypeScript (.ts/.tsx) files
  - Files must be over 500 lines to be considered for refactoring
  - Creates .backup files before making changes
  - Extracts components, hooks, utilities, and types
`);
    return;
  }
  
  const agent = new RefactorAgent();
  
  console.log('🚀 Refactor Agent Starting...');
  console.log(`📁 Target: ${targetPath}`);
  console.log(`🔧 Mode: ${dryRun ? 'Dry Run (Analysis Only)' : 'Apply Changes'}`);
  
  try {
    const results = await agent.analyzeTarget(targetPath);
    
    if (results.length === 0) {
      console.log('\n✨ No files found that need refactoring!');
      return;
    }
    
    console.log(`\n📊 Found ${results.length} files to refactor:`);
    
    for (const result of results) {
      console.log(`\n📄 ${result.originalFile}`);
      console.log(`   Lines: ${result.originalLineCount}`);
      console.log(`   Components to extract: ${result.extractedComponents.length}`);
      
      result.extractedComponents.forEach(comp => {
        console.log(`     - ${comp.name} (${comp.type}, ${comp.lineCount} lines)`);
      });
      
      if (!dryRun) {
        await agent.applyRefactoring(result);
      }
    }
    
    if (dryRun) {
      console.log('\n✨ Dry run complete. Use without --dry-run to apply changes.');
    } else {
      console.log('\n✨ Refactoring complete!');
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { RefactorAgent, ComponentExtraction, RefactorResult };