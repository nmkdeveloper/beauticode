import { describe, it, expect } from 'vitest';
import { highlightCode } from '../services/highlighter';

describe('Shiki Syntax Highlighter Service', () => {
  it('highlights TypeScript code into Shiki HTML', async () => {
    const code = `const greeting: string = "Hello World";`;
    const html = await highlightCode(code, 'typescript', 'github-dark');

    expect(html).toContain('class="shiki github-dark"');
    expect(html).toContain('greeting');
    expect(html).toContain('Hello World');
  });

  it('highlights Python code correctly', async () => {
    const code = `def greet(name):\n    return f"Hello {name}"`;
    const html = await highlightCode(code, 'python', 'tokyo-night');

    expect(html).toContain('class="shiki tokyo-night"');
    expect(html).toContain('greet');
  });

  it('handles empty code strings without throwing', async () => {
    const html = await highlightCode('', 'javascript', 'github-dark');
    expect(html).toBeTruthy();
    expect(html).toContain('shiki');
  });

  it('handles special characters and Unicode in code strings', async () => {
    const code = `// Xin chào thế giới! 🚀\nconst sum = (a: number, b: number) => a + b;`;
    const html = await highlightCode(code, 'typescript', 'vitesse-dark');

    expect(html).toContain('Xin chào thế giới!');
    expect(html).toContain('🚀');
  });

  it('highlights competitive programming C++ code with 190+ lines', async () => {
    const cppSnippet = `#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
#define FOR(a, b, c) for (int a = (b); a <= (c); a++)
// $x \\rightarrow (x \\times mul + add) \\pmod{MOD}$
int main() {
    ios_base::sync_with_stdio(false);
    return 0;
}`;
    const html = await highlightCode(cppSnippet, 'cpp', 'github-dark');
    expect(html).toContain('bits/stdc++.h');
    expect(html).toContain('ios_base');
    expect(html).toContain('pmod');
  });
});
