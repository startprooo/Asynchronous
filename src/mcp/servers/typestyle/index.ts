import * as ts from 'typescript';
import { googleTsStyleConfig } from './google-style-config';

interface TypeStyleRequest {
  code?: string;
  query?: string;
  rule?: string;
  format?: boolean;
  category?: string;
  groundSearch?: boolean;
}

interface TypeStyleResponse {
  suggestions: Array<{
    line: number;
    message: string;
    rule: string;
    category: string;
    fix?: string;
  }>;
  formattedCode?: string;
  explanation?: string;
}

export class TypeStyleServer {
  private config = googleTsStyleConfig;

  async analyze(request: TypeStyleRequest): Promise<TypeStyleResponse> {
    const { code, query, rule, format, category } = request;
    const response: TypeStyleResponse = { suggestions: [] };

    if (code) {
      // Parse TypeScript code
      const sourceFile = ts.createSourceFile(
        'temp.ts',
        code,
        ts.ScriptTarget.Latest,
        true
      );

      // Analyze code style
      this.analyzeNode(sourceFile, response.suggestions);

      // Format code if requested
      if (format) {
        response.formattedCode = this.formatCode(code);
      }
    }

    if (query || rule) {
      response.explanation = this.getStyleGuideExplanation(query || rule || '');
    }

    return response;
  }

  private analyzeNode(node: ts.Node, suggestions: TypeStyleResponse['suggestions']) {
    // Implement Google TypeScript Style Guide rules
    this.checkNaming(node, suggestions);
    this.checkFormatting(node, suggestions);
    this.checkBestPractices(node, suggestions);

    ts.forEachChild(node, child => this.analyzeNode(child, suggestions));
  }

  private checkNaming(node: ts.Node, suggestions: TypeStyleResponse['suggestions']) {
    if (ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
      const name = node.name?.getText();
      if (name) {
        if (ts.isClassDeclaration(node) && !this.isPascalCase(name)) {
          suggestions.push({
            line: this.getLineNumber(node),
            message: 'Class names should be in PascalCase',
            rule: 'naming.class',
            category: 'naming',
            fix: this.toPascalCase(name)
          });
        } else if (ts.isFunctionDeclaration(node) && !this.isCamelCase(name)) {
          suggestions.push({
            line: this.getLineNumber(node),
            message: 'Function names should be in camelCase',
            rule: 'naming.function',
            category: 'naming',
            fix: this.toCamelCase(name)
          });
        }
      }
    }
  }

  private checkFormatting(node: ts.Node, suggestions: TypeStyleResponse['suggestions']) {
    const text = node.getText();
    if (text.includes('  ')) { // Check for multiple spaces
      suggestions.push({
        line: this.getLineNumber(node),
        message: 'Use single spaces for indentation',
        rule: 'formatting.spaces',
        category: 'formatting'
      });
    }
  }

  private checkBestPractices(node: ts.Node, suggestions: TypeStyleResponse['suggestions']) {
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
      // Check function complexity
      const complexity = this.calculateComplexity(node);
      if (complexity > 10) {
        suggestions.push({
          line: this.getLineNumber(node),
          message: 'Function is too complex. Consider breaking it down.',
          rule: 'bestPractices.complexity',
          category: 'bestPractices'
        });
      }
    }
  }

  private calculateComplexity(node: ts.Node): number {
    let complexity = 1;
    ts.forEachChild(node, child => {
      if (ts.isIfStatement(child) || ts.isForStatement(child) || ts.isWhileStatement(child)) {
        complexity++;
      }
    });
    return complexity;
  }

  private formatCode(code: string): string {
    const options: ts.FormatCodeSettings = {
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
      insertSpaceAfterCommaDelimiter: true,
      insertSpaceAfterSemicolonInForStatements: true,
      insertSpaceBeforeAndAfterBinaryOperators: true,
      insertSpaceAfterKeywordsInControlFlowStatements: true,
    };

    return ts.formatDiagnosticsWithColorAndContext(
      ts.getPreEmitDiagnostics(
        ts.createProgram(['temp.ts'], {
          target: ts.ScriptTarget.Latest,
          module: ts.ModuleKind.CommonJS
        })
      ),
      {
        getCurrentDirectory: () => '',
        getCanonicalFileName: (f: string) => f,
        getNewLine: () => '\n'
      }
    );
  }

  private getStyleGuideExplanation(query: string): string {
    // Implement style guide explanations based on Google TypeScript Style Guide
    const explanations: Record<string, string> = {
      'naming': 'Google Style Guide recommends:\n- PascalCase for class names\n- camelCase for method names\n- UPPER_CASE for constants',
      'formatting': 'Google Style Guide recommends:\n- 2 spaces for indentation\n- No trailing whitespace\n- One statement per line',
      'bestPractices': 'Google Style Guide recommends:\n- Keep functions small and focused\n- Use type annotations\n- Prefer interfaces over type aliases'
    };

    return explanations[query.toLowerCase()] || 'No specific guidance found for this query';
  }

  private getLineNumber(node: ts.Node): number {
    const sourceFile = node.getSourceFile();
    const { line } = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart());
    return line + 1;
  }

  private isPascalCase(str: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
  }

  private isCamelCase(str: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
  }

  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
}
