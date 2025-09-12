#!/usr/bin/env tsx

/**
 * code-validator - Validates TypeScript code quality
 * 
 * Purpose: validate
 * Target: TypeScript files
 * Generated from samples: scripts/tool-builder.ts: react,default-export,typescript,monorepo, scripts/refactor-agent.ts: react,typescript,large-file, scripts/component-dedup-agent.ts: react,typescript,large-file, scripts/check-users.ts: basic, packages/db/index.ts: basic
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

class CodeValidator {
  private dryRun: boolean;
  
  constructor(dryRun = false) {
    this.dryRun = dryRun;
  }

  async process(targetPath: string): Promise<ProcessResult[]> {
    console.log(`🚀 ${this.constructor.name} starting...`);
    
    // Git safety
    await this.ensureGitSafety();
    
    const files = await this.findFiles(targetPath);
    const results: ProcessResult[] = [];
    
    console.log(`📊 Processing ${files.length} files`);
    
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
        execSync(`git commit -m "Save before ${this.constructor.name}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"`);
      }
    } catch (error) {
      console.warn('⚠️  Git commit failed');
    }
  }

  private async findFiles(targetPath: string): Promise<string[]> {
    const patterns = ["**/*.ts","**/*.tsx","!**/node_modules/**","!**/dist/**"];
    return await glob(patterns, { cwd: targetPath, absolute: true });
  }

  private async processFile(filePath: string): Promise<ProcessResult> {
    const content = await fs.readFile(filePath, 'utf-8');
    const changes: string[] = [];
    
    
    // Validation logic
    if (content.includes('console.log')) changes.push('Debug statement found');
    if (content.includes(' any ')) changes.push('Any type used');
    if (content.includes('TODO')) changes.push('TODO comment found');
    
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
    console.log(`
🛠️  code-validator - Validates TypeScript code quality

Usage:
  tsx scripts/code-validator.ts [path] [--dry-run]

Options:
  --dry-run    Analyze only, don't modify files
  --help       Show help

Example:
  tsx scripts/code-validator.ts apps/web --dry-run
`);
    return;
  }

  const tool = new CodeValidator(dryRun);
  const results = await tool.process(targetPath);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(`\n📊 ${successful} successful, ${failed} failed`);
  
  if (dryRun) {
    console.log('✨ Dry run complete');
  } else {
    console.log('✨ Processing complete');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { CodeValidator };
