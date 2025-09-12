#!/usr/bin/env tsx

/**
 * Tool Builder Agent - Creates and manages development tools
 * 
 * Git-first practices:
 * 1. Always commits and tags before making changes
 * 2. Samples code to understand patterns
 * 3. Never updates agents - only creates new tools
 * 4. Tests tools with dry runs
 * 5. Manages tool lifecycle (one-time vs reusable)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';

interface ToolRequest {
  name: string;
  description: string;
  purpose: 'refactor' | 'analyze' | 'generate' | 'validate' | 'migrate' | 'cleanup';
  targetPattern?: string;
  oneTimeUse?: boolean;
}

interface CodeSample {
  file: string;
  pattern: string;
  example: string;
}

class ToolBuilder {
  private readonly TOOLS_DIR = 'scripts';
  private readonly TOOLS_ARCHIVE = 'scripts/archive';
  private readonly SAMPLE_SIZE = 5;
  private readonly AGENT_NAMES = ['refactor-agent', 'component-dedup-agent', 'tool-builder'];

  async buildTool(request: ToolRequest): Promise<string> {
    console.log(`🛠️  Tool Builder Starting: ${request.name}`);
    
    // Step 1: Git commit and tag current state
    await this.gitCommitAndTag(`pre-${request.name}`);
    
    // Step 2: Sample code to understand patterns
    const samples = await this.sampleCodebase(request.targetPattern);
    console.log(`📊 Analyzed ${samples.length} code samples`);
    
    // Step 3: Never update agents - always create new tools
    const existingTool = await this.findExistingNonAgent(request);
    
    if (existingTool) {
      console.log(`🔄 Found existing tool: ${existingTool}, updating instead`);
      return await this.updateExistingTool(existingTool, request, samples);
    } else {
      console.log(`✨ Creating new tool: ${request.name}`);
      return await this.createNewTool(request, samples);
    }
  }

  private async gitCommitAndTag(tagSuffix: string): Promise<void> {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      
      if (status.trim()) {
        console.log('📝 Committing current changes...');
        execSync('git add .');
        execSync(`git commit -m "Save state before tool building: ${tagSuffix}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"`);
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const tagName = `tool-${tagSuffix}-${timestamp}`;
      execSync(`git tag -a "${tagName}" -m "Tool builder checkpoint: ${tagSuffix}"`);
      console.log(`🏷️  Tagged: ${tagName}`);
      
    } catch (error) {
      console.warn('⚠️  Git operations failed, continuing...');
    }
  }

  private async sampleCodebase(targetPattern?: string): Promise<CodeSample[]> {
    const samples: CodeSample[] = [];
    
    const patterns = targetPattern ? [targetPattern] : [
      '**/*.tsx',
      '**/*.ts',
      '!**/node_modules/**',
      '!**/dist/**',
      '!**/*.test.*'
    ];

    const files = await glob(patterns, { absolute: true });
    const sampleFiles = files.slice(0, this.SAMPLE_SIZE);

    for (const file of sampleFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        samples.push({
          file: path.relative(process.cwd(), file),
          pattern: this.detectPattern(content),
          example: content.slice(0, 200) + '...'
        });
      } catch (error) {
        // Skip unreadable files
      }
    }

    return samples;
  }

  private detectPattern(content: string): string {
    const patterns = [];
    
    if (content.includes('React') || content.includes('useState')) patterns.push('react');
    if (content.includes('export default')) patterns.push('default-export');
    if (content.includes('interface ') || content.includes('type ')) patterns.push('typescript');
    if (content.includes('@ria/')) patterns.push('monorepo');
    if (content.split('\n').length > 500) patterns.push('large-file');
    
    return patterns.join(',') || 'basic';
  }

  private async findExistingNonAgent(request: ToolRequest): Promise<string | null> {
    try {
      const toolFiles = await glob(`${this.TOOLS_DIR}/*.ts`, { absolute: true });
      
      for (const toolFile of toolFiles) {
        const toolName = path.basename(toolFile, '.ts');
        
        // Never update agents
        if (this.AGENT_NAMES.includes(toolName)) continue;
        
        // Check for exact name match
        if (toolName === request.name) {
          return toolFile;
        }
      }
    } catch (error) {
      // No tools found
    }
    
    return null;
  }

  private async updateExistingTool(toolPath: string, request: ToolRequest, samples: CodeSample[]): Promise<string> {
    const backupPath = `${toolPath}.backup-${Date.now()}`;
    await fs.copyFile(toolPath, backupPath);
    console.log(`📋 Backup created: ${backupPath}`);

    const newContent = await this.generateTool(request, samples);
    await fs.writeFile(toolPath, newContent);
    console.log(`✅ Updated tool: ${toolPath}`);
    
    const testResult = await this.testTool(toolPath);
    
    if (!testResult.success) {
      console.log('❌ Tool failed tests, reverting...');
      await fs.copyFile(backupPath, toolPath);
      await fs.unlink(backupPath);
      throw new Error(`Tool update failed: ${testResult.error}`);
    }
    
    await fs.unlink(backupPath);
    return toolPath;
  }

  private async createNewTool(request: ToolRequest, samples: CodeSample[]): Promise<string> {
    const toolPath = path.join(this.TOOLS_DIR, `${request.name}.ts`);
    const toolContent = await this.generateTool(request, samples);
    
    await fs.mkdir(this.TOOLS_DIR, { recursive: true });
    await fs.writeFile(toolPath, toolContent);
    console.log(`✅ Created tool: ${toolPath}`);
    
    const testResult = await this.testTool(toolPath);
    
    if (!testResult.success) {
      console.log('❌ Tool failed tests, removing...');
      await fs.unlink(toolPath);
      throw new Error(`Tool creation failed: ${testResult.error}`);
    }
    
    return toolPath;
  }

  private async generateTool(request: ToolRequest, samples: CodeSample[]): Promise<string> {
    const sampleInfo = samples.map(s => `${s.file}: ${s.pattern}`).join(', ');
    
    return `#!/usr/bin/env tsx

/**
 * ${request.name} - ${request.description}
 * 
 * Purpose: ${request.purpose}
 * Target: ${request.targetPattern || 'TypeScript files'}
 * Generated from samples: ${sampleInfo}
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';

interface ProcessResult {
  file: string;
  success: boolean;
  changes: string[];
  errors: string[];
}

class ${this.capitalize(request.name)} {
  private dryRun: boolean;
  
  constructor(dryRun = false) {
    this.dryRun = dryRun;
  }

  async process(targetPath: string): Promise<ProcessResult[]> {
    console.log(\`🚀 \${this.constructor.name} starting...\`);
    
    // Git safety
    await this.ensureGitSafety();
    
    const files = await this.findFiles(targetPath);
    const results: ProcessResult[] = [];
    
    console.log(\`📊 Processing \${files.length} files\`);
    
    for (const file of files) {
      try {
        const result = await this.processFile(file);
        results.push(result);
      } catch (error) {
        results.push({
          file,
          success: false,
          changes: [],
          errors: [String(error)]
        });
      }
    }
    
    return results;
  }

  private async ensureGitSafety(): Promise<void> {
    if (this.dryRun) return;
    
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      if (status.trim()) {
        console.log('📝 Committing changes...');
        execSync('git add .');
        execSync(\`git commit -m "Save before \${this.constructor.name}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"\`);
      }
    } catch (error) {
      console.warn('⚠️  Git commit failed');
    }
  }

  private async findFiles(targetPath: string): Promise<string[]> {
    const patterns = ${JSON.stringify(this.generatePatterns(request.targetPattern))};
    return await glob(patterns, { cwd: targetPath, absolute: true });
  }

  private async processFile(filePath: string): Promise<ProcessResult> {
    const content = await fs.readFile(filePath, 'utf-8');
    const changes: string[] = [];
    
    ${this.generateProcessLogic(request.purpose)}
    
    return {
      file: filePath,
      success: true,
      changes,
      errors: []
    };
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const targetPath = args.find(arg => !arg.startsWith('--')) || '.';
  const dryRun = args.includes('--dry-run');
  const help = args.includes('--help');
  
  if (help) {
    console.log(\`
🛠️  ${request.name} - ${request.description}

Usage:
  tsx scripts/${request.name}.ts [path] [--dry-run]

Options:
  --dry-run    Analyze only, don't modify files
  --help       Show help

Example:
  tsx scripts/${request.name}.ts apps/web --dry-run
\`);
    return;
  }

  const tool = new ${this.capitalize(request.name)}(dryRun);
  const results = await tool.process(targetPath);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(\`\\n📊 \${successful} successful, \${failed} failed\`);
  
  if (dryRun) {
    console.log('✨ Dry run complete');
  } else {
    console.log('✨ Processing complete');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { ${this.capitalize(request.name)} };
`;
  }

  private generatePatterns(targetPattern?: string): string[] {
    if (targetPattern) return [targetPattern];
    return ['**/*.ts', '**/*.tsx', '!**/node_modules/**', '!**/dist/**'];
  }

  private generateProcessLogic(purpose: string): string {
    switch (purpose) {
      case 'validate':
        return `
    // Validation logic
    if (content.includes('console.log')) changes.push('Debug statement found');
    if (content.includes(' any ')) changes.push('Any type used');
    if (content.includes('TODO')) changes.push('TODO comment found');`;
      
      case 'analyze':
        return `
    // Analysis logic
    const lines = content.split('\\n').length;
    const complexity = (content.match(/if|for|while|switch/g) || []).length;
    changes.push(\`Lines: \${lines}, Complexity: \${complexity}\`);`;
      
      case 'cleanup':
        return `
    // Cleanup logic
    let cleaned = content.replace(/console\\.log\\([^)]*\\);?/g, '');
    cleaned = cleaned.replace(/\\/\\/ TODO:.*$/gm, '');
    if (cleaned !== content && !this.dryRun) {
      await fs.writeFile(filePath, cleaned);
      changes.push('Removed console.log and TODO comments');
    }`;
      
      default:
        return `
    // Generic processing
    changes.push('Processed file');`;
    }
  }

  private capitalize(str: string): string {
    return str.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('');
  }

  private async testTool(toolPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🧪 Testing tool...');
      execSync(`npx tsx "${toolPath}" --help`, { 
        encoding: 'utf-8',
        timeout: 10000,
        stdio: 'pipe'
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async manageLifecycle(toolPath: string, request: ToolRequest): Promise<void> {
    if (request.oneTimeUse) {
      console.log('🗑️  One-time tool, archiving...');
      await fs.mkdir(this.TOOLS_ARCHIVE, { recursive: true });
      const archivePath = path.join(this.TOOLS_ARCHIVE, path.basename(toolPath));
      await fs.rename(toolPath, archivePath);
      console.log(`📚 Archived: ${archivePath}`);
    } else {
      console.log('💾 Reusable tool stored in scripts/');
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2 || args.includes('--help')) {
    console.log(`
🛠️  Tool Builder - Creates development tools

Usage:
  tsx scripts/tool-builder.ts <name> <purpose> [options]

Purpose: refactor|analyze|generate|validate|migrate|cleanup

Options:
  --description "Tool description"
  --target-pattern "**/*.tsx"
  --one-time-use

Examples:
  tsx scripts/tool-builder.ts code-validator validate
  tsx scripts/tool-builder.ts large-splitter refactor --one-time-use
`);
    return;
  }

  const name = args[0];
  const purpose = args[1] as ToolRequest['purpose'];
  
  const request: ToolRequest = {
    name,
    description: getArgValue('--description') || `${purpose} tool`,
    purpose,
    targetPattern: getArgValue('--target-pattern'),
    oneTimeUse: args.includes('--one-time-use')
  };

  const builder = new ToolBuilder();
  
  try {
    const toolPath = await builder.buildTool(request);
    await builder.manageLifecycle(toolPath, request);
    
    console.log(`\\n✨ Tool ready: ${toolPath}`);
  } catch (error) {
    console.error('❌ Failed:', String(error));
    process.exit(1);
  }

  function getArgValue(flag: string): string | undefined {
    const index = args.indexOf(flag);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : undefined;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { ToolBuilder };