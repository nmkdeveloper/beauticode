import { describe, it, expect } from 'vitest';
import { detectLanguage, LANGUAGES, getLanguageById } from '../constants/languages';

describe('Language Presets and Auto-detection', () => {
  it('has at least 20 supported languages', () => {
    expect(LANGUAGES.length).toBeGreaterThanOrEqual(20);
  });

  it('detects TypeScript code with types and interfaces', () => {
    const code = `interface UserProfile {\n  id: string;\n  isActive: boolean;\n}`;
    expect(detectLanguage(code)).toBe('typescript');
  });

  it('detects Python code with def and print', () => {
    const code = `def calculate_fibonacci(n):\n    if n <= 1:\n        return n\n    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)`;
    expect(detectLanguage(code)).toBe('python');
  });

  it('detects Rust code with fn and let mut', () => {
    const code = `fn main() {\n    let mut counter = 0;\n    println!("Value: {}", counter);\n}`;
    expect(detectLanguage(code)).toBe('rust');
  });

  it('detects Rust code with let statement without mistaking for JavaScript', () => {
    const code = `fn main() {\n    let answer = 42;\n    println!("Answer: {}", answer);\n}`;
    expect(detectLanguage(code)).toBe('rust');
  });

  it('detects Go code with package and func', () => {
    const code = `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello Go")\n}`;
    expect(detectLanguage(code)).toBe('go');
  });

  it('detects C++ code with iostream and std::cout', () => {
    const code = `#include <iostream>\nint main() {\n    std::cout << "Hello C++" << std::endl;\n    return 0;\n}`;
    expect(detectLanguage(code)).toBe('cpp');
  });

  it('detects SQL query code', () => {
    const code = `SELECT id, username, email FROM users WHERE active = 1 ORDER BY created_at DESC;`;
    expect(detectLanguage(code)).toBe('sql');
  });

  it('detects Dockerfile instructions', () => {
    const code = `FROM node:20-alpine\nWORKDIR /app\nRUN npm install\nEXPOSE 3000`;
    expect(detectLanguage(code)).toBe('dockerfile');
  });

  it('falls back to typescript for empty or whitespace-only code', () => {
    expect(detectLanguage('')).toBe('typescript');
    expect(detectLanguage('   \n  \t  ')).toBe('typescript');
  });

  it('returns valid language object for known id and fallback for unknown id', () => {
    const ts = getLanguageById('typescript');
    expect(ts.name).toBe('TypeScript');

    const unknown = getLanguageById('nonexistent-lang');
    expect(unknown).toBeDefined();
    expect(unknown.id).toBe('typescript');
  });
});
