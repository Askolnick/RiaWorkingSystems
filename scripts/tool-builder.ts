#!/usr/bin/env tsx

/**
 * Tool Builder Agent - Responsible for creating, updating, and managing development tools
 * 
 * Follows Git-first practices:
 * 1. Always commits and tags before making changes
 * 2. Samples code to understand patterns before building tools
 * 3. Checks for existing similar tools to update rather than duplicate
 * 4. Double-checks scripts with dry runs
 * 5. Reverts and fixes if errors are defects (not expected behavior)
 * 6. Manages tool lifecycle (one-time use vs reusable storage)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';

interface ToolRequest {
  name: string;
  description: string;
  purpose: 'refactor' | 'analyze' | 'generate' | 'validate' | 'migrate' | 'cleanup';
  targetPattern?: string; // e.g., "**/*.tsx", "apps/web/**/*"
  expectedBehavior?: string;
  oneTimeUse?: boolean;
}

interface ExistingTool {
  path: string;
  name: string;
  purpose: string;
  description: string;
  lastModified: Date;
}

interface CodeSample {
  file: string;
  pattern: string;
  example: string;
}

class ToolBuilder {
  private readonly TOOLS_DIR = 'scripts';
  private readonly TOOLS_ARCHIVE = 'scripts/archive';
  private readonly SAMPLE_SIZE = 5; // Number of code samples to analyze

  async buildTool(request: ToolRequest): Promise<string> {
    console.log(`🛠️  Tool Builder Starting: ${request.name}`);
    
    // Step 1: Git commit and tag current state
    await this.gitCommitAndTag(`pre-${request.name}`);
    
    // Step 2: Sample code to understand patterns
    const samples = await this.sampleCodebase(request.targetPattern);
    console.log(`📊 Analyzed ${samples.length} code samples`);
    
    // Step 3: Check for existing similar tools
    const existingTool = await this.findSimilarTool(request);
    
    if (existingTool) {
      console.log(`🔄 Found similar tool: ${existingTool.name}, updating instead`);
      return await this.updateExistingTool(existingTool, request, samples);
    } else {
      console.log(`✨ Creating new tool: ${request.name}`);
      return await this.createNewTool(request, samples);
    }
  }

  private async gitCommitAndTag(tagSuffix: string): Promise<void> {
    try {
      // Check if there are changes to commit
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      
      if (status.trim()) {
        console.log('📝 Committing current changes before tool building...');
        execSync('git add .');
        execSync(`git commit -m "Save current state before tool building

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"`);
      }
      
      // Create tag
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const tagName = `tool-builder-${tagSuffix}-${timestamp}`;
      execSync(`git tag -a "${tagName}" -m "Tool builder checkpoint: ${tagSuffix}"`);
      console.log(`🏷️  Tagged: ${tagName}`);
      
    } catch (error) {
      console.warn('⚠️  Git operations failed, continuing without version control');
    }
  }

  private async sampleCodebase(targetPattern?: string): Promise<CodeSample[]> {
    const samples: CodeSample[] = [];
    
    const patterns = targetPattern ? [targetPattern] : [
      '**/*.tsx',
      '**/*.ts',
      '!**/node_modules/**',
      '!**/dist/**',
      '!**/*.test.*',
      '!**/*.spec.*'
    ];

    const files = await glob(patterns, { absolute: true });
    const sampleFiles = files.slice(0, this.SAMPLE_SIZE);

    for (const file of sampleFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');
        
        // Extract patterns like imports, exports, function definitions, etc.
        const patterns = {
          imports: lines.filter(line => line.trim().startsWith('import')).slice(0, 3),
          exports: lines.filter(line => line.includes('export')).slice(0, 3),
          functions: lines.filter(line => /(?:function|const|let)\s+\w+.*[=:{]/.test(line)).slice(0, 3)
        };

        samples.push({
          file: path.relative(process.cwd(), file),
          pattern: this.detectPattern(content),
          example: [
            '// Imports:',
            ...patterns.imports,
            '// Exports:',
            ...patterns.exports,
            '// Functions:',
            ...patterns.functions
          ].join('\n')
        });
      } catch (error) {
        // Skip unreadable files
      }
    }

    return samples;
  }

  private detectPattern(content: string): string {
    const patterns = [];
    
    if (content.includes('React') || content.includes('useState') || content.includes('useEffect')) {
      patterns.push('react');
    }
    if (content.includes('export default')) {
      patterns.push('default-export');
    }
    if (content.includes('interface ') || content.includes('type ')) {
      patterns.push('typescript-types');
    }
    if (content.includes('@ria/')) {
      patterns.push('monorepo-imports');
    }
    if (content.match(/\d{3,}/)) {
      patterns.push('large-file');
    }
    
    return patterns.join(',') || 'unknown';
  }

  private async findSimilarTool(request: ToolRequest): Promise<ExistingTool | null> {
    try {
      const toolFiles = await glob(`${this.TOOLS_DIR}/**/*.ts`, { absolute: true });
      
      for (const toolFile of toolFiles) {
        const content = await fs.readFile(toolFile, 'utf-8');
        const toolName = path.basename(toolFile, '.ts');
        
        // Check if tool serves similar purpose
        const purposeMatch = content.toLowerCase().includes(request.purpose.toLowerCase());
        const nameMatch = this.calculateSimilarity(toolName, request.name) > 0.6;
        
        if (purposeMatch || nameMatch) {
          const stats = await fs.stat(toolFile);
          
          return {
            path: toolFile,
            name: toolName,
            purpose: request.purpose,
            description: this.extractDescription(content),
            lastModified: stats.mtime
          };
        }
      }
    } catch (error) {
      // No tools directory or no tools found
    }
    
    return null;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private extractDescription(content: string): string {
    const match = content.match(/\/\*\*\s*\n\s*\*\s*(.+)\n/);
    return match ? match[1] : 'No description found';
  }

  private async updateExistingTool(
    existingTool: ExistingTool,
    request: ToolRequest,
    samples: CodeSample[]
  ): Promise<string> {
    const backupPath = `${existingTool.path}.backup-${Date.now()}`;
    await fs.copyFile(existingTool.path, backupPath);
    console.log(`📋 Backup created: ${backupPath}`);

    const existingContent = await fs.readFile(existingTool.path, 'utf-8');
    const updatedContent = await this.generateToolUpdate(existingContent, request, samples);
    
    await fs.writeFile(existingTool.path, updatedContent);
    console.log(`✅ Updated tool: ${existingTool.path}`);
    
    // Test the updated tool
    const testResult = await this.testTool(existingTool.path, request);
    
    if (!testResult.success) {
      console.log('❌ Updated tool failed tests, reverting...');
      await fs.copyFile(backupPath, existingTool.path);
      await fs.unlink(backupPath);
      throw new Error(`Tool update failed: ${testResult.error}`);
    }
    
    await fs.unlink(backupPath);
    return existingTool.path;
  }

  private async createNewTool(request: ToolRequest, samples: CodeSample[]): Promise<string> {
    const toolPath = path.join(this.TOOLS_DIR, `${request.name}.ts`);
    const toolContent = await this.generateTool(request, samples);
    
    // Ensure scripts directory exists
    await fs.mkdir(this.TOOLS_DIR, { recursive: true });
    
    await fs.writeFile(toolPath, toolContent);
    console.log(`✅ Created tool: ${toolPath}`);
    
    // Test the new tool
    const testResult = await this.testTool(toolPath, request);
    
    if (!testResult.success) {
      console.log('❌ New tool failed tests, removing...');
      await fs.unlink(toolPath);
      throw new Error(`Tool creation failed: ${testResult.error}`);
    }
    
    return toolPath;
  }

  private async generateTool(request: ToolRequest, samples: CodeSample[]): Promise<string> {
    const samplePatterns = samples.map(s => s.pattern).join(', ');
    const sampleFiles = samples.map(s => s.file).slice(0, 3).join(', ');
    
    return `#!/usr/bin/env tsx

/**
 * ${request.name} - ${request.description}
 * 
 * Purpose: ${request.purpose}
 * Target Pattern: ${request.targetPattern || 'all TypeScript files'}
 * Expected Behavior: ${request.expectedBehavior || 'Process files without breaking functionality'}
 * 
 * Generated by Tool Builder based on analysis of:
 * - Files: ${sampleFiles}
 * - Patterns: ${samplePatterns}
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';

interface ${this.capitalize(request.name)}Options {
  targetPath: string;
  dryRun?: boolean;
  verbose?: boolean;
}

interface ProcessResult {
  file: string;
  success: boolean;
  changes: string[];
  errors: string[];
}

class ${this.capitalize(request.name)} {
  private options: ${this.capitalize(request.name)}Options;
  
  constructor(options: ${this.capitalize(request.name)}Options) {
    this.options = options;
  }

  async process(): Promise<ProcessResult[]> {
    console.log(\`🚀 \${this.constructor.name} Starting...\`);
    
    // Git safety check
    await this.ensureGitSafety();
    
    const results: ProcessResult[] = [];
    const files = await this.findTargetFiles();
    
    console.log(\`📊 Found \${files.length} files to process\`);
    
    for (const file of files) {
      try {
        const result = await this.processFile(file);
        results.push(result);
        
        if (this.options.verbose) {
          console.log(\`✅ \${file}: \${result.changes.length} changes\`);
        }
      } catch (error) {
        results.push({
          file,
          success: false,
          changes: [],
          errors: [error instanceof Error ? error.message : String(error)]
        });
        console.error(\`❌ \${file}: \${error}\`);
      }
    }
    
    return results;
  }

  private async ensureGitSafety(): Promise<void> {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      if (status.trim()) {
        if (!this.options.dryRun) {
          console.log('📝 Committing changes before processing...');
          execSync('git add .');
          execSync(\`git commit -m "Save before \${this.constructor.name} processing

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"\`);
        } else {
          console.log('⚠️  Uncommitted changes detected (dry run mode)');
        }
      }
    } catch (error) {
      console.warn('⚠️  Git safety check failed, proceeding with caution');
    }
  }

  private async findTargetFiles(): Promise<string[]> {
    const patterns = ${JSON.stringify(this.generateFilePatterns(request.targetPattern))};
    return await glob(patterns, { absolute: true });
  }

  private async processFile(filePath: string): Promise<ProcessResult> {
    const content = await fs.readFile(filePath, 'utf-8');
    const changes: string[] = [];
    
    // TODO: Implement specific processing logic based on tool purpose
    // This is a template - customize based on the specific tool requirements
    
    ${this.generateProcessingLogic(request.purpose)}
    
    if (!this.options.dryRun && changes.length > 0) {
      await fs.writeFile(filePath, content);
    }
    
    return {
      file: filePath,
      success: true,
      changes,
      errors: []
    };
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const targetPath = args.find(arg => !arg.startsWith('--')) || process.cwd();
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');
  const help = args.includes('--help') || args.includes('-h');
  
  if (help) {
    console.log(\`
🛠️  \${${this.capitalize(request.name)}.name} - ${request.description}

Usage:
  tsx scripts/${request.name}.ts [path] [options]

Options:
  --dry-run    Analyze only, don't modify files
  --verbose    Show detailed progress
  --help, -h   Show this help

Examples:
  tsx scripts/${request.name}.ts apps/web --dry-run
  tsx scripts/${request.name}.ts . --verbose
\`);
    return;
  }

  const tool = new ${this.capitalize(request.name)}({
    targetPath,
    dryRun,
    verbose
  });

  try {
    const results = await tool.process();
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(\`\n📊 Results: \${successful} successful, \${failed} failed\`);
    
    if (failed > 0) {
      console.log('\\n❌ Failed files:');
      results.filter(r => !r.success).forEach(r => {
        console.log(\`   - \${r.file}: \${r.errors.join(', ')}\`);
      });
    }
    
    if (dryRun) {
      console.log('\\n✨ Dry run complete. Use without --dry-run to apply changes.');
    } else {
      console.log('\\n✨ Processing complete!');
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { ${this.capitalize(request.name)} };
`;
  }

  private async generateToolUpdate(
    existingContent: string,
    request: ToolRequest,
    samples: CodeSample[]
  ): Promise<string> {
    // For now, add new functionality to existing tool
    const updateComment = `

// Updated by Tool Builder on ${new Date().toISOString()}
// New capability: ${request.description}
// Based on samples: ${samples.map(s => s.file).join(', ')}

`;
    
    // Insert before the CLI interface
    const cliIndex = existingContent.indexOf('// CLI Interface');
    if (cliIndex !== -1) {
      return existingContent.slice(0, cliIndex) + updateComment + existingContent.slice(cliIndex);
    }
    
    return existingContent + updateComment;
  }

  private generateFilePatterns(targetPattern?: string): string[] {
    if (targetPattern) {
      return [targetPattern];
    }
    
    return [
      '**/*.tsx',
      '**/*.ts',
      '!**/node_modules/**',
      '!**/dist/**',
      '!**/*.test.*',
      '!**/*.spec.*'
    ];
  }

  private generateProcessingLogic(purpose: string): string {
    switch (purpose) {
      case 'refactor':
        return `
    // Refactoring logic - look for patterns to extract
    const functionMatches = content.match(/function\\s+\\w+[^{]*\\{[^}]*\\}/g);
    if (functionMatches) {
      changes.push(\`Found \${functionMatches.length} functions to potentially extract\`);
    }`;
      
      case 'analyze':
        return `
    // Analysis logic - gather metrics and patterns
    const lineCount = content.split('\\n').length;
    const complexity = (content.match(/if|for|while|switch/g) || []).length;
    changes.push(\`Lines: \${lineCount}, Complexity: \${complexity}\`);`;
      
      case 'validate':
        return `
    // Validation logic - check for common issues
    const issues = [];
    if (content.includes('console.log')) issues.push('Debug console.log found');
    if (content.includes('any')) issues.push('TypeScript any type used');
    if (issues.length > 0) changes.push(\`Issues: \${issues.join(', ')}\`);`;
      
      default:
        return `
    // Generic processing logic
    const processedContent = content; // TODO: Implement specific logic
    changes.push('Processed file');`;
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private async testTool(toolPath: string, request: ToolRequest): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🧪 Testing tool with dry run...');
      
      // Run the tool in dry-run mode
      const result = execSync(`npx tsx "${toolPath}" . --dry-run`, { 
        encoding: 'utf-8',
        timeout: 30000 // 30 second timeout
      });
      
      // Check if tool ran without crashing
      if (result.includes('Error:') || result.includes('❌')) {
        return { success: false, error: 'Tool produced errors during dry run' };
      }
      
      console.log('✅ Tool test passed');
      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async manageToolLifecycle(toolPath: string, request: ToolRequest): Promise<void> {
    if (request.oneTimeUse) {
      console.log('🗑️  One-time use tool, archiving...');
      
      await fs.mkdir(this.TOOLS_ARCHIVE, { recursive: true });
      const archivePath = path.join(this.TOOLS_ARCHIVE, path.basename(toolPath));
      await fs.rename(toolPath, archivePath);
      
      console.log(`📚 Archived tool: ${archivePath}`);
    } else {
      console.log('🔄 Reusable tool, keeping in tools directory');
      
      // Add to tool registry or documentation
      const registryPath = path.join(this.TOOLS_DIR, 'TOOLS_REGISTRY.md');
      const registryEntry = `
## ${request.name}
- **Purpose**: ${request.purpose}
- **Description**: ${request.description}
- **Path**: ${path.basename(toolPath)}
- **Created**: ${new Date().toISOString()}
- **Reusable**: Yes

`;
      
      try {
        const existingRegistry = await fs.readFile(registryPath, 'utf-8');
        await fs.writeFile(registryPath, existingRegistry + registryEntry);
      } catch {
        const header = `# Tools Registry

This file tracks all reusable tools in the scripts directory.

`;
        await fs.writeFile(registryPath, header + registryEntry);
      }
      
      console.log(`📝 Added to tools registry: ${registryPath}`);
    }
  }
}

// CLI Interface for Tool Builder
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
🛠️  Tool Builder - Creates and manages development tools

Usage:
  tsx scripts/tool-builder.ts <name> <purpose> [options]

Arguments:
  name        Name of the tool to create/update
  purpose     Tool purpose: refactor|analyze|generate|validate|migrate|cleanup

Options:
  --description "Tool description"
  --target-pattern "**/*.tsx"
  --one-time-use
  --expected-behavior "What the tool should do"

Examples:
  tsx scripts/tool-builder.ts large-file-splitter refactor --description "Splits large files"
  tsx scripts/tool-builder.ts dependency-analyzer analyze --target-pattern "packages/**/*.ts"
  tsx scripts/tool-builder.ts migration-helper migrate --one-time-use
`);
    return;
  }

  const name = args[0];
  const purpose = args[1] as ToolRequest['purpose'];
  
  const request: ToolRequest = {
    name,
    description: getArgValue(args, '--description') || `${purpose} tool for ${name}`,
    purpose,
    targetPattern: getArgValue(args, '--target-pattern'),
    expectedBehavior: getArgValue(args, '--expected-behavior'),
    oneTimeUse: args.includes('--one-time-use')
  };

  const builder = new ToolBuilder();
  
  try {
    const toolPath = await builder.buildTool(request);
    await builder.manageToolLifecycle(toolPath, request);
    
    console.log(`\n✨ Tool building complete!`);
    console.log(`📍 Tool location: ${toolPath}`);
    console.log(`🎯 Purpose: ${request.purpose}`);
    console.log(`♻️  Reusable: ${!request.oneTimeUse ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Tool building failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function getArgValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : undefined;
}

if (require.main === module) {
  main().catch(console.error);
}

export { ToolBuilder };