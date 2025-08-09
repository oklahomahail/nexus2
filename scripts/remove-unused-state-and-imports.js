/**
 * Codemod: Remove unused imports, unused locals, prune useState pairs, and prefix unused function params
 *
 * Usage:
 *   pnpm jscodeshift -t scripts/remove-unused-state-and-imports.js src --extensions=ts,tsx --parser=tsx
 *
 * Notes:
 * - Conservative: does NOT rewrite complex destructured parameters.
 * - Preserves types when prefixing params (e.g., `(_: Props)`).
 */

const isDeclId = (j, p) => {
  const parent = p.parent && p.parent.node;
  if (!parent) return false;

  // import Foo from 'x';  import { Foo as Bar } from 'x';
  if (j.ImportSpecifier.check(parent) || j.ImportDefaultSpecifier.check(parent) || j.ImportNamespaceSpecifier.check(parent)) return true;

  // const Foo = ...
  if (j.VariableDeclarator.check(parent) && parent.id === p.node) return true;

  // function Foo() {}
  if (j.FunctionDeclaration.check(parent) && parent.id === p.node) return true;

  // class Foo {}
  if (j.ClassDeclaration && j.ClassDeclaration.check(parent) && parent.id === p.node) return true;

  // function fn(Foo) {}
  if (j.Function.check(parent) && parent.params.includes(p.node)) return true;

  // catch (e) {}
  if (j.CatchClause.check(parent) && parent.param === p.node) return true;

  return false;
};

const collectUsed = (j, root) => {
  const used = new Set();
  root.find(j.Identifier).forEach(p => {
    if (!isDeclId(j, p)) used.add(p.node.name);
  });
  return used;
};

const removeUnusedImports = (j, root, used) => {
  root.find(j.ImportDeclaration).forEach(path => {
    const keepSpecs = [];
    for (const spec of path.node.specifiers || []) {
      const localName =
        (spec.local && spec.local.name) ||
        (spec.imported && spec.imported.name) ||
        null;
      if (!localName) continue;
      if (used.has(localName)) keepSpecs.push(spec);
    }
    if (keepSpecs.length === 0) {
      j(path).remove();
    } else {
      path.node.specifiers = keepSpecs;
    }
  });
};

const pruneUseStatePairs = (j, root, used) => {
  root.find(j.VariableDeclarator, {
    init: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'useState' },
    },
    id: { type: 'ArrayPattern' },
  }).forEach(path => {
    const arr = path.node.id.elements;
    if (!arr || arr.length < 2) return;

    const state = arr[0];
    const setter = arr[1];

    const stateName = state && state.type === 'Identifier' ? state.name : null;
    const setterName = setter && setter.type === 'Identifier' ? setter.name : null;

    const stateUsed = stateName ? used.has(stateName) : false;
    const setterUsed = setterName ? used.has(setterName) : false;

    if (!stateUsed && !setterUsed) {
      // remove entire declaration
      const parentDecl = path.parent && path.parent.node;
      if (parentDecl && parentDecl.declarations && parentDecl.declarations.length === 1) {
        j(path.parentPath.parentPath).remove(); // remove the full VariableDeclaration statement
      } else {
        j(path).remove();
      }
      return;
    }

    // keep only the used side(s)
    if (!stateUsed) path.node.id.elements[0] = null;
    if (!setterUsed) path.node.id.elements[1] = null;
  });
};

const removeUnusedSimpleLocals = (j, root, used) => {
  // Only simple `const foo = ...;` (not destructuring)
  root.find(j.VariableDeclarator, { id: { type: 'Identifier' } }).forEach(path => {
    const name = path.node.id.name;
    if (used.has(name)) return;

    const varDecl = path.parent && path.parent.node;
    // If this is the only declarator, remove entire statement
    if (varDecl && varDecl.declarations && varDecl.declarations.length === 1) {
      j(path.parentPath.parentPath).remove();
    } else {
      j(path).remove();
    }
  });
};

const prefixUnusedParams = (j, root) => {
  const fnLike = [
    j.FunctionDeclaration,
    j.FunctionExpression,
    j.ArrowFunctionExpression,
  ];

  fnLike.forEach(kind => {
    root.find(kind).forEach(fnPath => {
      const fnNode = fnPath.node;
      const body = fnNode.body;
      if (!body) return;

      // Gather used identifiers inside function body
      const usedInFn = new Set();
      j(body).find(j.Identifier).forEach(p => usedInFn.add(p.node.name));

      fnNode.params.forEach((param, idx) => {
        // Simple identifiers only (skip destructured params to be safe)
        if (param.type !== 'Identifier') return;

        const name = param.name;
        if (usedInFn.has(name)) return; // used somewhere

        if (name.startsWith('_')) return; // already prefixed

        // Preserve type annotation if any
        const hasType = !!param.typeAnnotation;
        const ta = hasType ? j.typeAnnotation.from({
          typeAnnotation: param.typeAnnotation.typeAnnotation
        }) : null;

        const newId = j.identifier(`_${name}`);
        if (hasType) newId.typeAnnotation = ta;

        fnNode.params[idx] = newId;
      });
    });
  });
};

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Short-circuit non TS/TSX
  const ext = (file.path.split('.').pop() || '').toLowerCase();
  if (!['ts', 'tsx'].includes(ext)) return null;

  const used = collectUsed(j, root);

  removeUnusedImports(j, root, used);
  pruneUseStatePairs(j, root, used);
  removeUnusedSimpleLocals(j, root, used);
  prefixUnusedParams(j, root);

  return root.toSource({ quote: 'single', trailingComma: true });
};
