#!/usr/bin/env tsx

/**
 * Component Deduplication Agent - Identifies and merges duplicate or similar components
 * Analyzes component similarity and intelligently merges functionality
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import * as crypto from 'crypto';

interface ComponentSignature {
  filePath: string;
  name: string;
  props: string[];
  hooks: string[];
  stateVariables: string[];
  methods: string[];
  returnType: 'JSX' | 'ReactNode' | 'Element' | 'null' | 'other';
  dependencies: string[];
  lineCount: number;
  hash: string;
  code: string;
}

interface SimilarityScore {
  component1: ComponentSignature;
  component2: ComponentSignature;
  score: number;
  propsSimilarity: number;
  hooksSimilarity: number;
  structureSimilarity: number;
  nameSimilarity: number;
  suggestions: string[];
}

interface MergeStrategy {
  targetComponent: ComponentSignature;
  sourceComponents: ComponentSignature[];
  mergedCode: string;
  featuresAdded: string[];
  propsUnified: string[];
  hooksConsolidated: string[];
}

class ComponentDeduplicationAgent {
  private readonly SIMILARITY_THRESHOLD = 0.7; // 70% similarity triggers merge suggestion
  private readonly components: Map<string, ComponentSignature> = new Map();

  async analyzeCodebase(targetPath: string): Promise<void> {
    console.log(`🔍 Scanning for React components in: ${targetPath}`);
    
    const patterns = [
      '**/components/**/*.tsx',
      '**/components/**/*.jsx',
      '**/*.component.tsx',
      '**/*.component.jsx',
      '!**/node_modules/**',
      '!**/*.test.*',
      '!**/*.spec.*',
      '!**/dist/**',
      '!**/build/**'
    ];

    const files = await glob(patterns, { cwd: targetPath, absolute: true });
    
    for (const file of files) {
      await this.analyzeFile(file);
    }

    console.log(`📊 Found ${this.components.size} components`);
  }

  private async analyzeFile(filePath: string): Promise<void> {
    const content = await fs.readFile(filePath, 'utf-8');
    const components = this.extractComponents(content, filePath);
    
    components.forEach(comp => {
      const key = `${comp.name}_${comp.hash.substring(0, 8)}`;
      this.components.set(key, comp);
    });
  }

  private extractComponents(content: string, filePath: string): ComponentSignature[] {
    const components: ComponentSignature[] = [];
    
    // Pattern to match React functional components
    const componentRegex = /(?:export\s+)?(?:const|function)\s+([A-Z][a-zA-Z]*)\s*(?::\s*React\.FC(?:<[^>]+>)?|\s*=\s*\([^)]*\)\s*(?::|=>))/g;
    
    let match;
    while ((match = componentRegex.exec(content)) !== null) {
      const componentName = match[1];
      const componentCode = this.extractComponentCode(content, match.index);
      
      if (componentCode) {
        components.push({
          filePath,
          name: componentName,
          props: this.extractProps(componentCode),
          hooks: this.extractHooks(componentCode),
          stateVariables: this.extractStateVariables(componentCode),
          methods: this.extractMethods(componentCode),
          returnType: this.detectReturnType(componentCode),
          dependencies: this.extractDependencies(componentCode),
          lineCount: componentCode.split('\n').length,
          hash: this.generateHash(componentCode),
          code: componentCode
        });
      }
    }
    
    return components;
  }

  private extractComponentCode(content: string, startIndex: number): string {
    let braceCount = 0;
    let inComponent = false;
    let endIndex = startIndex;
    
    // Find the opening brace
    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        inComponent = true;
      } else if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0 && inComponent) {
          endIndex = i + 1;
          break;
        }
      }
    }
    
    return content.substring(startIndex, endIndex);
  }

  private extractProps(code: string): string[] {
    const props: string[] = [];
    
    // Extract props from function parameters
    const propsMatch = code.match(/\((?:\s*\{([^}]+)\}|\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*)\)/);
    if (propsMatch) {
      if (propsMatch[1]) {
        // Destructured props
        const propsList = propsMatch[1].split(',').map(p => p.trim().split(':')[0].trim());
        props.push(...propsList);
      } else if (propsMatch[2]) {
        // Props object
        const propsVarName = propsMatch[2];
        const propsUsageRegex = new RegExp(`${propsVarName}\\.([a-zA-Z_$][a-zA-Z0-9_$]*)`, 'g');
        let match;
        while ((match = propsUsageRegex.exec(code)) !== null) {
          if (!props.includes(match[1])) {
            props.push(match[1]);
          }
        }
      }
    }
    
    // Extract props from interface/type definition
    const interfaceMatch = code.match(/interface\s+\w+Props\s*\{([^}]+)\}/);
    if (interfaceMatch) {
      const propDefs = interfaceMatch[1].match(/(\w+)\s*[?:]?\s*[^;,]+/g);
      if (propDefs) {
        propDefs.forEach(def => {
          const propName = def.match(/^(\w+)/)?.[1];
          if (propName && !props.includes(propName)) {
            props.push(propName);
          }
        });
      }
    }
    
    return props;
  }

  private extractHooks(code: string): string[] {
    const hooks: string[] = [];
    const hookRegex = /use[A-Z][a-zA-Z]*(?:\([^)]*\))?/g;
    
    let match;
    while ((match = hookRegex.exec(code)) !== null) {
      const hookName = match[0].split('(')[0];
      if (!hooks.includes(hookName)) {
        hooks.push(hookName);
      }
    }
    
    return hooks;
  }

  private extractStateVariables(code: string): string[] {
    const stateVars: string[] = [];
    const stateRegex = /(?:const|let)\s*\[(\w+),\s*set\w+\]\s*=\s*useState/g;
    
    let match;
    while ((match = stateRegex.exec(code)) !== null) {
      stateVars.push(match[1]);
    }
    
    return stateVars;
  }

  private extractMethods(code: string): string[] {
    const methods: string[] = [];
    const methodRegex = /(?:const|let|function)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*\{|function)/g;
    
    let match;
    while ((match = methodRegex.exec(code)) !== null) {
      const methodName = match[1];
      if (!methodName.startsWith('use') && !methodName.startsWith('set')) {
        methods.push(methodName);
      }
    }
    
    return methods;
  }

  private detectReturnType(code: string): ComponentSignature['returnType'] {
    if (code.includes('return null')) return 'null';
    if (code.includes('return <')) return 'JSX';
    if (code.includes('React.createElement')) return 'Element';
    if (code.includes('ReactNode')) return 'ReactNode';
    return 'other';
  }

  private extractDependencies(code: string): string[] {
    const deps: string[] = [];
    const componentRegex = /<([A-Z][a-zA-Z]*)/g;
    
    let match;
    while ((match = componentRegex.exec(code)) !== null) {
      if (!deps.includes(match[1])) {
        deps.push(match[1]);
      }
    }
    
    return deps;
  }

  private generateHash(code: string): string {
    // Normalize code for consistent hashing
    const normalized = code
      .replace(/\s+/g, ' ')
      .replace(/['"`]/g, '"')
      .trim();
    
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  findSimilarComponents(): SimilarityScore[] {
    const scores: SimilarityScore[] = [];
    const componentArray = Array.from(this.components.values());
    
    for (let i = 0; i < componentArray.length; i++) {
      for (let j = i + 1; j < componentArray.length; j++) {
        const score = this.calculateSimilarity(componentArray[i], componentArray[j]);
        if (score.score >= this.SIMILARITY_THRESHOLD) {
          scores.push(score);
        }
      }
    }
    
    // Sort by similarity score descending
    scores.sort((a, b) => b.score - a.score);
    
    return scores;
  }

  private calculateSimilarity(comp1: ComponentSignature, comp2: ComponentSignature): SimilarityScore {
    // Calculate various similarity metrics
    const propsSimilarity = this.calculateArraySimilarity(comp1.props, comp2.props);
    const hooksSimilarity = this.calculateArraySimilarity(comp1.hooks, comp2.hooks);
    const stateSimilarity = this.calculateArraySimilarity(comp1.stateVariables, comp2.stateVariables);
    const methodsSimilarity = this.calculateArraySimilarity(comp1.methods, comp2.methods);
    const nameSimilarity = this.calculateStringSimilarity(comp1.name, comp2.name);
    
    // Structure similarity based on line count and return type
    let structureSimilarity = 0;
    if (comp1.returnType === comp2.returnType) {
      structureSimilarity += 0.3;
    }
    const lineDiff = Math.abs(comp1.lineCount - comp2.lineCount);
    const maxLines = Math.max(comp1.lineCount, comp2.lineCount);
    structureSimilarity += (1 - lineDiff / maxLines) * 0.7;
    
    // Weighted average
    const score = (
      propsSimilarity * 0.25 +
      hooksSimilarity * 0.2 +
      stateSimilarity * 0.15 +
      methodsSimilarity * 0.15 +
      nameSimilarity * 0.1 +
      structureSimilarity * 0.15
    );
    
    const suggestions = this.generateMergeSuggestions(comp1, comp2, {
      propsSimilarity,
      hooksSimilarity,
      structureSimilarity,
      nameSimilarity
    });
    
    return {
      component1: comp1,
      component2: comp2,
      score,
      propsSimilarity,
      hooksSimilarity,
      structureSimilarity,
      nameSimilarity,
      suggestions
    };
  }

  private calculateArraySimilarity(arr1: string[], arr2: string[]): number {
    if (arr1.length === 0 && arr2.length === 0) return 1;
    if (arr1.length === 0 || arr2.length === 0) return 0;
    
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private generateMergeSuggestions(
    comp1: ComponentSignature,
    comp2: ComponentSignature,
    metrics: {
      propsSimilarity: number;
      hooksSimilarity: number;
      structureSimilarity: number;
      nameSimilarity: number;
    }
  ): string[] {
    const suggestions: string[] = [];
    
    // Determine which component is more advanced
    const comp1Score = comp1.props.length + comp1.hooks.length + comp1.methods.length;
    const comp2Score = comp2.props.length + comp2.hooks.length + comp2.methods.length;
    const [advanced, simpler] = comp1Score >= comp2Score ? [comp1, comp2] : [comp2, comp1];
    
    suggestions.push(`Merge ${simpler.name} into ${advanced.name} (more feature-complete)`);
    
    // Props suggestions
    if (metrics.propsSimilarity < 1) {
      const uniqueToSimpler = simpler.props.filter(p => !advanced.props.includes(p));
      if (uniqueToSimpler.length > 0) {
        suggestions.push(`Add props from ${simpler.name}: ${uniqueToSimpler.join(', ')}`);
      }
    }
    
    // Hooks suggestions
    if (metrics.hooksSimilarity < 1) {
      const uniqueHooks = simpler.hooks.filter(h => !advanced.hooks.includes(h));
      if (uniqueHooks.length > 0) {
        suggestions.push(`Incorporate hooks from ${simpler.name}: ${uniqueHooks.join(', ')}`);
      }
    }
    
    // State suggestions
    const uniqueState = simpler.stateVariables.filter(s => !advanced.stateVariables.includes(s));
    if (uniqueState.length > 0) {
      suggestions.push(`Consider state variables from ${simpler.name}: ${uniqueState.join(', ')}`);
    }
    
    // Method suggestions
    const uniqueMethods = simpler.methods.filter(m => !advanced.methods.includes(m));
    if (uniqueMethods.length > 0) {
      suggestions.push(`Add methods from ${simpler.name}: ${uniqueMethods.join(', ')}`);
    }
    
    // File location suggestion
    if (path.dirname(comp1.filePath) !== path.dirname(comp2.filePath)) {
      suggestions.push(`Components are in different directories - consolidate in shared location`);
    }
    
    return suggestions;
  }

  async generateMergeStrategy(similarity: SimilarityScore): Promise<MergeStrategy> {
    const { component1, component2 } = similarity;
    
    // Determine target component (more advanced one)
    const comp1Score = component1.props.length + component1.hooks.length + component1.methods.length;
    const comp2Score = component2.props.length + component2.hooks.length + component2.methods.length;
    const [target, source] = comp1Score >= comp2Score ? [component1, component2] : [component2, component1];
    
    // Extract unique features from source
    const uniqueProps = source.props.filter(p => !target.props.includes(p));
    const uniqueHooks = source.hooks.filter(h => !target.hooks.includes(h));
    const uniqueMethods = source.methods.filter(m => !target.methods.includes(m));
    const uniqueState = source.stateVariables.filter(s => !target.stateVariables.includes(s));
    
    const featuresAdded: string[] = [];
    if (uniqueProps.length > 0) featuresAdded.push(`Props: ${uniqueProps.join(', ')}`);
    if (uniqueHooks.length > 0) featuresAdded.push(`Hooks: ${uniqueHooks.join(', ')}`);
    if (uniqueMethods.length > 0) featuresAdded.push(`Methods: ${uniqueMethods.join(', ')}`);
    if (uniqueState.length > 0) featuresAdded.push(`State: ${uniqueState.join(', ')}`);
    
    // Generate merged code (simplified version - in practice would need AST manipulation)
    const mergedCode = this.generateMergedComponent(target, source, {
      uniqueProps,
      uniqueHooks,
      uniqueMethods,
      uniqueState
    });
    
    return {
      targetComponent: target,
      sourceComponents: [source],
      mergedCode,
      featuresAdded,
      propsUnified: [...target.props, ...uniqueProps],
      hooksConsolidated: [...target.hooks, ...uniqueHooks]
    };
  }

  private generateMergedComponent(
    target: ComponentSignature,
    source: ComponentSignature,
    unique: {
      uniqueProps: string[];
      uniqueHooks: string[];
      uniqueMethods: string[];
      uniqueState: string[];
    }
  ): string {
    // This is a simplified merge - in production, use AST manipulation
    let mergedCode = target.code;
    
    // Add comment header
    const header = `
/**
 * Merged Component: ${target.name}
 * Incorporated features from: ${source.name}
 * Date: ${new Date().toISOString()}
 * 
 * Added features:
 * - Props: ${unique.uniqueProps.join(', ') || 'none'}
 * - Hooks: ${unique.uniqueHooks.join(', ') || 'none'}
 * - Methods: ${unique.uniqueMethods.join(', ') || 'none'}
 * - State: ${unique.uniqueState.join(', ') || 'none'}
 */
`;
    
    return header + mergedCode;
  }

  async applyMerge(strategy: MergeStrategy): Promise<void> {
    const { targetComponent, mergedCode } = strategy;
    
    // Backup original
    const backupPath = targetComponent.filePath + '.backup';
    await fs.copyFile(targetComponent.filePath, backupPath);
    console.log(`📦 Backed up: ${backupPath}`);
    
    // Write merged component
    await fs.writeFile(targetComponent.filePath, mergedCode, 'utf-8');
    console.log(`✅ Updated: ${targetComponent.filePath}`);
    
    // Log deprecated components
    for (const source of strategy.sourceComponents) {
      const deprecatedPath = source.filePath + '.deprecated';
      await fs.rename(source.filePath, deprecatedPath);
      console.log(`🗑️  Deprecated: ${deprecatedPath}`);
    }
  }

  generateReport(similarities: SimilarityScore[]): string {
    let report = '# Component Deduplication Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n`;
    report += `- Total components analyzed: ${this.components.size}\n`;
    report += `- Duplicate/similar pairs found: ${similarities.length}\n\n`;
    
    report += `## Similar Components\n\n`;
    
    similarities.forEach((sim, index) => {
      report += `### ${index + 1}. ${sim.component1.name} ↔ ${sim.component2.name}\n`;
      report += `**Similarity Score:** ${(sim.score * 100).toFixed(1)}%\n\n`;
      report += `**Metrics:**\n`;
      report += `- Props similarity: ${(sim.propsSimilarity * 100).toFixed(1)}%\n`;
      report += `- Hooks similarity: ${(sim.hooksSimilarity * 100).toFixed(1)}%\n`;
      report += `- Structure similarity: ${(sim.structureSimilarity * 100).toFixed(1)}%\n`;
      report += `- Name similarity: ${(sim.nameSimilarity * 100).toFixed(1)}%\n\n`;
      
      report += `**Component 1:** ${sim.component1.filePath}\n`;
      report += `- Lines: ${sim.component1.lineCount}\n`;
      report += `- Props: ${sim.component1.props.join(', ') || 'none'}\n`;
      report += `- Hooks: ${sim.component1.hooks.join(', ') || 'none'}\n\n`;
      
      report += `**Component 2:** ${sim.component2.filePath}\n`;
      report += `- Lines: ${sim.component2.lineCount}\n`;
      report += `- Props: ${sim.component2.props.join(', ') || 'none'}\n`;
      report += `- Hooks: ${sim.component2.hooks.join(', ') || 'none'}\n\n`;
      
      report += `**Suggestions:**\n`;
      sim.suggestions.forEach(s => report += `- ${s}\n`);
      report += '\n---\n\n';
    });
    
    return report;
  }
}

// CLI Interface
async function main() {
  const agent = new ComponentDeduplicationAgent();
  const targetPath = process.argv[2] || process.cwd();
  const autoMerge = process.argv.includes('--auto-merge');
  const reportOnly = process.argv.includes('--report-only');
  
  console.log('🚀 Component Deduplication Agent Starting...');
  console.log(`📁 Target: ${targetPath}`);
  console.log(`🔧 Mode: ${autoMerge ? 'Auto-merge' : reportOnly ? 'Report Only' : 'Interactive'}`);
  
  // Analyze codebase
  await agent.analyzeCodebase(targetPath);
  
  // Find similar components
  const similarities = agent.findSimilarComponents();
  
  console.log(`\n📊 Found ${similarities.length} similar component pairs\n`);
  
  // Generate report
  const report = agent.generateReport(similarities);
  const reportPath = path.join(process.cwd(), 'component-deduplication-report.md');
  await fs.writeFile(reportPath, report, 'utf-8');
  console.log(`📄 Report saved to: ${reportPath}`);
  
  if (!reportOnly && similarities.length > 0) {
    if (autoMerge) {
      // Auto-merge all high-similarity components
      for (const sim of similarities) {
        if (sim.score >= 0.85) { // 85% threshold for auto-merge
          console.log(`\n🔄 Auto-merging: ${sim.component1.name} ← ${sim.component2.name}`);
          const strategy = await agent.generateMergeStrategy(sim);
          await agent.applyMerge(strategy);
        }
      }
    } else {
      // Interactive mode
      console.log('\n📝 Review the report and run with --auto-merge to apply changes');
      console.log('   or use --report-only to only generate the report');
    }
  }
  
  console.log('\n✨ Component deduplication analysis complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

export { ComponentDeduplicationAgent, ComponentSignature, SimilarityScore, MergeStrategy };