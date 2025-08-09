#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { Project, SyntaxKind, Node } from 'ts-morph';

/**
 * Usage:
 *   pnpm eslint . -f json -o .eslint-unused.json
 *   node scripts/fix-unused-from-eslint.mjs .eslint-unused.json
 */

const reportPath = process.argv[2] ?? '.eslint-unused.json';
if (!fs.existsSync(reportPath)) {
  console.error(`ESLint JSON report not found: ${reportPath}`);
  process.exit(1);
}

const includeSrcOnly = true;
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const project = new Project({
  tsConfigFilePath: path.resolve('tsconfig.json'),
  skipAddingFilesFromTsConfig: false,
});

let touched = 0;

const nameFromMsg = (msg) => {
  const m = msg?.match(/'([^']+)' is defined but never used/);
  return m?.[1];
};

function getStartLineSafe(node) {
  if (typeof node.getStartLineNumber === 'function') return node.getStartLineNumber();
  const sf = node.getSourceFile();
  const text = sf.getFullText();
  const start = node.getStart();
  let line = 1;
  for (let i = 0; i < start; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

for (const file of report) {
  const { filePath, messages } = file || {};
  if (!filePath) continue;

  const rel = path.relative(process.cwd(), filePath);
  if (includeSrcOnly && !rel.startsWith('src/')) continue;

  const sf = project.getSourceFile(filePath);
  if (!sf) continue;

  const unusedMsgs = (messages || []).filter(
    (m) => m && (m.ruleId === 'no-unused-vars' || m.ruleId === '@typescript-eslint/no-unused-vars')
  );

  for (const m of unusedMsgs) {
    const name = nameFromMsg(m.message);
    if (!name) continue;

    const targetLine = m.line ?? 0;
    const candidates = sf.getDescendantsOfKind(SyntaxKind.Identifier).filter((n) => n.getText() === name);
    if (candidates.length === 0) continue;

    let id = candidates.find((n) => getStartLineSafe(n) === targetLine);
    if (!id) {
      id = candidates[0];
      let bestDiff = Math.abs(getStartLineSafe(id) - targetLine);
      for (const n of candidates.slice(1)) {
        const diff = Math.abs(getStartLineSafe(n) - targetLine);
        if (diff < bestDiff) { id = n; bestDiff = diff; }
      }
    }
    if (!id) continue;

    const parent = id.getParent();
    if (!parent) continue;

    // 1) Function parameter
    if (Node.isParameterDeclaration(parent)) {
      const n = parent.getNameNode();
      if (Node.isIdentifier(n)) {
        const orig = n.getText();
        if (!orig.startsWith('_')) n.replaceWithText(`_${orig}`);
        touched++;
      } else if (Node.isBindingElement(n)) {
        const pn = n.getPropertyNameNode();
        const nn = n.getNameNode();
        if (Node.isIdentifier(nn)) {
          const propText = pn ? pn.getText() : nn.getText();
          n.replaceWithText(`${propText}: _${nn.getText()}`);
          touched++;
        }
      }
      continue;
    }

    // 2) Variable declaration
    if (Node.isVariableDeclaration(parent)) {
      const nameNode = parent.getNameNode();

      if (Node.isIdentifier(nameNode)) {
        const orig = nameNode.getText();
        if (!orig.startsWith('_')) nameNode.replaceWithText(`_${orig}`);
        touched++;
        continue;
      }

      if (Node.isArrayBindingPattern(nameNode)) {
        for (const elem of nameNode.getElements()) {
          if (!Node.isBindingElement(elem)) continue;
          const en = elem.getNameNode();
          if (Node.isIdentifier(en) && en.getText() === name) {
            if (!en.getText().startsWith('_')) elem.replaceWithText(`_${name}`);
            touched++;
            break;
          }
        }
        continue;
      }

      if (Node.isObjectBindingPattern(nameNode)) {
        const el = nameNode.getElements().find((e) => e.getName?.() === name);
        if (el) {
          const pn = el.getPropertyNameNode();
          const propText = pn ? pn.getText() : name;
          el.replaceWithText(`${propText}: _${name}`);
          touched++;
        }
        continue;
      }
    }

    // 3) Binding element inside any destructuring
    if (Node.isBindingElement(parent)) {
      const pn = parent.getPropertyNameNode();
      const nn = parent.getNameNode();
      if (Node.isIdentifier(nn) && nn.getText() === name) {
        const propText = pn ? pn.getText() : name;
        parent.replaceWithText(`${propText}: _${name}`);
        touched++;
      }
    }
  }
}

project.saveSync();
console.log(`✅ Prefixed ${touched} unused bindings with '_'`);
