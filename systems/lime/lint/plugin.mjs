import {readFileSync} from 'node:fs';

// Lime's lint rules, as an ESLint plugin. Plain ESM, no build step. Each rule flags one thing Lime's rules forbid
// and says what to use instead; its docs link points at the Lime rule it enforces.
//
// Classes are read where Tailwind reads them: className (and any *ClassName prop) and the arguments of cn, clsx,
// cva and the like. classes.json, written by the design.how registry build, lists every utility Lime's theme
// defines and the stock Tailwind vocabulary Lime leaves out, so nothing here loads Tailwind.

const vocab = JSON.parse(readFileSync(new URL('./classes.json', import.meta.url), 'utf8'));

const SITE = 'https://design.how/systems/lime';
const RULES_PAGE = {lime: SITE, 'anti-slop': `${SITE}/foundations/anti-slop`, color: `${SITE}/foundations/color`, typography: `${SITE}/foundations/typography`,
  motion: `${SITE}/foundations/motion`, iconography: `${SITE}/foundations/iconography`, spacing: `${SITE}/foundations/spacing`};
/** The page that holds a Lime rule id, such as lime-tokens-only or anti-slop-no-caps. */
const docsFor = id => RULES_PAGE[Object.keys(RULES_PAGE).find(prefix => id.startsWith(`${prefix}-`))] ?? SITE;

// ---- the vocabulary ---------------------------------------------------------------------------------------------

const set = list => new Set(list);
const lime = {static: set(vocab.static), colors: set(vocab.colors), colorRoots: set(vocab.colorRoots), numeric: set(vocab.numeric), fraction: set(vocab.fraction),
  values: Object.fromEntries(Object.entries(vocab.values).map(([k, v]) => [k, set(v)])), variants: vocab.variants};
const stock = {static: set(vocab.tailwind.static), colors: set(vocab.tailwind.colors), numeric: set(vocab.tailwind.numeric),
  values: Object.fromEntries(Object.entries(vocab.tailwind.values).map(([k, v]) => [k, set(v)])), variants: vocab.tailwind.variants};
// Class names Tailwind treats as markers rather than utilities.
for (const name of ['group', 'peer', 'dark', 'not-prose']) lime.static.add(name);
const ROOTS = [...new Set([...Object.keys(lime.values), ...lime.colorRoots, ...lime.numeric, ...lime.fraction, ...Object.keys(stock.values), ...stock.numeric])]
  .sort((a, b) => b.length - a.length);

const isNumber = value => /^\d+(?:\.\d+)?$/.test(value);
const onScale = value => Number.isInteger(Number(value) * 4);

/** Splits at `sep` outside brackets and parentheses. */
function splitTop(text, sep) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '[' || c === '(') depth++;
    else if (c === ']' || c === ')') depth = Math.max(0, depth - 1);
    else if (c === sep && depth === 0) { parts.push(text.slice(start, i)); start = i + 1; }
  }
  parts.push(text.slice(start));
  return parts;
}

/**
 * One class token, taken apart: variants (hover, sm, data-[open], [&>svg]), the utility without its important
 * mark, the base without its modifier (/50, /6), the root it is a value of (p, bg, rounded-t, -mt) and the value.
 */
function parse(token) {
  const parts = splitTop(token, ':');
  let utility = parts.pop();
  utility = utility.replace(/^!/, '').replace(/!$/, '');
  const slash = splitTop(utility, '/');
  const base = slash.length > 1 ? slash.slice(0, -1).join('/') : utility;
  const modifier = slash.length > 1 ? slash.at(-1) : undefined;
  const arbitrary = /[[(]/.test(base);
  const root = arbitrary ? base.match(/^(-?[a-z][\w-]*?)-[[(]/)?.[1] : ROOTS.find(r => base === r || base.startsWith(`${r}-`));
  const value = root === undefined ? undefined : base === root ? '' : base.slice(root.length + 1);
  return {token, variants: parts, utility, base, modifier, root, value, arbitrary};
}

/** Whether Lime's theme has this utility: true, false, or undefined when it is not a Tailwind-shaped class at all. */
function limeHas(c) {
  if (lime.static.has(c.base) || lime.static.has(c.utility)) return true;
  if (c.root === undefined) return undefined;
  if (lime.values[c.root]?.has(c.value)) return true;
  if (lime.colorRoots.has(c.root) && lime.colors.has(c.value)) return true;
  if (lime.numeric.has(c.root) && isNumber(c.value) && onScale(c.value)) return true;
  if (lime.fraction.has(c.root) && isNumber(c.value) && c.modifier && isNumber(c.modifier)) return true;
  return false;
}

/** Whether a class Lime lacks still reads as Tailwind: a stock class, a color utility, or a number off the scale. */
function looksTailwind(c) {
  if (stock.static.has(c.base)) return true;
  if (c.root === undefined) return false;
  if (stock.values[c.root]?.has(c.value)) return true;
  if (lime.colorRoots.has(c.root) && /^[a-z][a-z0-9-]*$/.test(c.value)) return true;
  if (isNumber(c.value) && (lime.numeric.has(c.root) || stock.numeric.has(c.root))) return true;
  return false;
}

/** A stock variant Lime's theme does not define, such as 2xl: or max-2xl:. */
function unknownVariant(variant) {
  if (variant in lime.variants) return false;
  if (variant in stock.variants && !stock.variants[variant].length) return true;
  for (let i = 1; i < variant.length; i++) {
    const at = variant[0] === '@' && i === 1;
    if (variant[i] !== '-' && !at) continue;
    const name = at ? '@' : variant.slice(0, i);
    const value = at ? variant.slice(1) : variant.slice(i + 1);
    if (stock.variants[name]?.includes(value) && !lime.variants[name]?.includes(value)) return true;
  }
  return false;
}

const BREAKPOINTS = Object.keys(lime.variants).filter(name => ['sm', 'md', 'lg', 'xl', '2xl'].includes(name));
const WORDY = new Set(['', 'inherit', 'initial', 'none', 'current', 'transparent']);
const TEXT_SIZE = /^(?:xs|sm|base|lg|\d?xl)$/;

/** Color roles that fit a root, as class names: text gets the text roles, bg the surfaces, borders the lines. */
function roles(root) {
  const r = root.replace(/^-/, '');
  const names = r === 'text' || r === 'fill' || r === 'stroke' || r === 'decoration' || r === 'caret' || r === 'placeholder' ? ['fg', 'fg-2', 'fg-3']
    : r === 'bg' || r === 'from' || r === 'via' || r === 'to' ? ['page', 'surface', 'surface-2']
    : /^(?:border|divide|ring|outline|inset-ring)/.test(r) ? ['line', 'line-strong', 'accent-line'] : ['fg', 'surface', 'line'];
  return names.filter(name => lime.colors.has(name)).map(name => `${r}-${name}`).join(', ');
}

/** What Lime has in place of a class it lacks, for a message. */
function suggest(c) {
  const root = c.root.replace(/^-/, '');
  const stockNamed = stock.values[c.root]?.has(c.value);
  if (lime.colorRoots.has(c.root) && !stockNamed && !(root === 'text' && TEXT_SIZE.test(c.value ?? ''))) return `a color role such as ${roles(c.root)}`;
  if (root === 'font') return 'font-semibold for headings, font-medium for controls and labels, font-normal for the rest';
  if (root === 'text') return `a size from ${['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'].filter(v => lime.values.text?.has(v)).map(v => `text-${v}`).join(', ')}`;
  const named = [...(lime.values[c.root] ?? [])].filter(v => !WORDY.has(v) && !/^\[|\d%$/.test(v));
  if (lime.numeric.has(c.root)) return `the 4px scale (${root}-1 is 4px, ${root}-4 is 16px)${named.length && /^(?:max-|min-)?[wh]$|^size$/.test(root) ? ` or a size such as ${root}-${named.includes('md') ? 'md' : named[0]}` : ''}`;
  if (named.length) return named.slice(0, 8).map(v => `${root}-${v}`).join(', ');
  return undefined;
}

// ---- what each rule claims ----------------------------------------------------------------------------------------

const RAW = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\(/;
const NAMED = new Set(['white', 'black', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'gray', 'grey', 'silver', 'navy', 'teal', 'aqua',
  'cyan', 'magenta', 'fuchsia', 'lime', 'maroon', 'olive', 'brown', 'gold', 'indigo', 'violet', 'coral', 'salmon', 'tomato', 'crimson', 'beige', 'ivory',
  'khaki', 'lavender', 'turquoise', 'tan', 'whitesmoke', 'gainsboro', 'lightgray', 'lightgrey', 'darkgray', 'darkgrey', 'dimgray', 'slategray']);
const arbitraryValue = c => c.base.match(/\[(.*)\]/)?.[1];

/** A raw color in a class: a palette color (text-white, bg-gray-500) or a color value inside brackets. */
function rawColor(c) {
  if (c.root && lime.colorRoots.has(c.root) && stock.colors.has(c.value)) return c.value;
  const inside = arbitraryValue(c);
  if (inside === undefined) return undefined;
  const hit = inside.match(RAW);
  if (hit) return hit[0].replace(/\($/, '()');
  if (c.root && lime.colorRoots.has(c.root) && NAMED.has(inside.toLowerCase())) return inside;
  return undefined;
}
const GRADIENT_ROOTS = new Set(['bg-linear', '-bg-linear', 'bg-radial', 'bg-conic', '-bg-conic', 'from', 'via', 'to']);
const gradient = c => GRADIENT_ROOTS.has(c.root) || /^-?bg-gradient-/.test(c.base) || /gradient\(/.test(arbitraryValue(c) ?? '');
const caps = c => c.base === 'uppercase' || (/^-?tracking$/.test(c.root ?? '') && !['tight', 'normal'].includes(c.value) && !/^\(?--/.test(c.value ?? '') && !c.base.startsWith('-'))
  || /^\[(?:text-transform:uppercase|letter-spacing:)/.test(c.base);
const transitionAll = c => c.base === 'transition-all' || c.base === 'transition-[all]';
const outlineNone = c => ['outline-none', 'outline-hidden', 'outline-0'].includes(c.base);

/** The arbitrary value a hand-picked number makes; transition lists, keywords, proportions and var(--) are fine. */
function handPicked(c) {
  const inside = arbitraryValue(c);
  if (inside === undefined) return false;
  // A grid track list in fr (grid-cols-[1fr_auto]) is a proportion, not a size.
  if (/^transition-\[/.test(c.base) || !/\d/.test(inside.replace(/(?<![\w.])\d+(?:\.\d+)?fr(?![a-z0-9])/g, ''))) return false;
  if (/^-?\d+(?:\.\d+)?(?:%|d?vh|svh|lvh|d?vw|svw|lvw)$/.test(inside)) return false;
  return !/var\(--|--spacing\(/.test(inside);
}

// ---- reading classes out of the source -------------------------------------------------------------------------

const CLASS_FNS = new Set(['cn', 'clsx', 'cx', 'classnames', 'classNames', 'twMerge', 'twJoin', 'cva', 'tv']);
const isClassAttr = name => name === 'className' || name === 'class' || /ClassName$/.test(name);
const isClassCall = node => node?.type === 'CallExpression' && node.callee.type === 'Identifier' && CLASS_FNS.has(node.callee.name);
const attrName = attr => attr.type === 'JSXAttribute' ? (attr.name.type === 'JSXNamespacedName' ? `${attr.name.namespace.name}:${attr.name.name.name}` : attr.name.name) : undefined;

/** The static string pieces of a class expression, as {node, text, offset}. A class-function call is read by its own visitor unless `intoCalls`. */
function pieces(node, out = [], intoCalls = false) {
  if (!node) return out;
  switch (node.type) {
    case 'Literal': if (typeof node.value === 'string') out.push({node, text: node.value, offset: 1}); break;
    case 'TemplateLiteral': for (const q of node.quasis) out.push({node: q, text: q.value.cooked ?? q.value.raw, offset: 1}); break;
    case 'JSXExpressionContainer': pieces(node.expression, out, intoCalls); break;
    case 'ConditionalExpression': pieces(node.consequent, out, intoCalls); pieces(node.alternate, out, intoCalls); break;
    case 'LogicalExpression': pieces(node.left, out, intoCalls); pieces(node.right, out, intoCalls); break;
    case 'BinaryExpression': if (node.operator === '+') { pieces(node.left, out, intoCalls); pieces(node.right, out, intoCalls); } break;
    case 'ArrayExpression': for (const el of node.elements) pieces(el, out, intoCalls); break;
    case 'ObjectExpression':
      for (const p of node.properties) {
        if (p.type !== 'Property') continue;
        if (p.key.type === 'Literal') pieces(p.key, out, intoCalls);
        pieces(p.value, out, intoCalls);
      }
      break;
    case 'TSAsExpression': case 'TSSatisfiesExpression': case 'TSNonNullExpression': case 'ParenthesizedExpression': pieces(node.expression, out, intoCalls); break;
    case 'CallExpression': if (intoCalls && isClassCall(node)) for (const arg of node.arguments) pieces(arg, out, intoCalls); break;
    default: break;
  }
  return out;
}

/** Each class token in a piece, with its location. */
function* tokens(sourceCode, piece) {
  for (const m of piece.text.matchAll(/\S+/g)) {
    const start = piece.node.range[0] + piece.offset + m.index;
    yield {token: m[0], loc: {start: sourceCode.getLocFromIndex(start), end: sourceCode.getLocFromIndex(start + m[0].length)}};
  }
}

/**
 * A rule over every class token in the file. `check(c)` gets a parsed token and returns a message or nothing.
 * Tokens are read once per string, from className attributes and from class-function calls.
 */
function classRule(meta, check) {
  return {
    meta,
    create(context) {
      const sourceCode = context.sourceCode;
      const visit = piece => {
        for (const {token, loc} of tokens(sourceCode, piece)) {
          const message = check(parse(token));
          if (message) context.report({loc, message});
        }
      };
      return {
        JSXAttribute(node) { if (isClassAttr(attrName(node))) for (const piece of pieces(node.value)) visit(piece); },
        CallExpression(node) { if (isClassCall(node)) for (const arg of node.arguments) for (const piece of pieces(arg)) visit(piece); },
      };
    },
  };
}

const meta = (id, description, limeRule, type = 'problem') => ({type, docs: {description, url: docsFor(limeRule), limeRule}, schema: []});

// ---- imports ------------------------------------------------------------------------------------------------------

/** Lime's components, wherever the project's alias puts them: .../lime/ui/button, .../lime/ai/message. */
const isLimeComponent = source => /(?:^|\/)lime\/(?:ui|ai)\/[\w.-]+$/.test(source) || /^\.\.?\/(?:\.\.\/)*(?:ui|ai)\/[\w.-]+$/.test(source);

/** The local names a file imports from Lime's components, as local name to {imported, source}. */
function limeImports(context) {
  const names = new Map();
  for (const node of context.sourceCode.ast.body) {
    if (node.type !== 'ImportDeclaration' || !isLimeComponent(node.source.value)) continue;
    for (const s of node.specifiers) if (s.type === 'ImportSpecifier') names.set(s.local.name, {imported: s.imported.name ?? s.imported.value, source: node.source.value});
  }
  return names;
}

const elementName = opening => opening.name.type === 'JSXIdentifier' ? opening.name.name : undefined;
const attribute = (opening, name) => opening.attributes.find(a => attrName(a) === name);
const hasSpread = opening => opening.attributes.some(a => a.type === 'JSXSpreadAttribute');
const stringOf = attr => {
  const v = attr?.value;
  if (v?.type === 'Literal') return typeof v.value === 'string' ? v.value : undefined;
  if (v?.type === 'JSXExpressionContainer' && v.expression.type === 'Literal' && typeof v.expression.value === 'string') return v.expression.value;
  if (v?.type === 'JSXExpressionContainer' && v.expression.type === 'TemplateLiteral' && !v.expression.expressions.length) return v.expression.quasis[0].value.cooked;
  return undefined;
};

/** The class tokens on one JSX opening element, through cn() and conditionals, with their locations. */
function elementTokens(sourceCode, opening) {
  const out = [];
  for (const attr of opening.attributes) {
    if (!isClassAttr(attrName(attr))) continue;
    for (const piece of pieces(attr.value, [], true)) for (const t of tokens(sourceCode, piece)) out.push({...t, c: parse(t.token)});
  }
  return out;
}

/** The object literal a style attribute holds, through `as` casts, or undefined. */
function styleObject(attr) {
  let expr = attr.value?.type === 'JSXExpressionContainer' ? attr.value.expression : undefined;
  while (expr && /^TS(?:As|Satisfies|NonNull)Expression$/.test(expr.type)) expr = expr.expression;
  return expr?.type === 'ObjectExpression' ? expr : undefined;
}

/** The properties of an inline style object literal, as {key, value (static string or number), node}. */
function styleProps(attr) {
  const expr = styleObject(attr);
  if (expr?.type !== 'ObjectExpression') return [];
  return expr.properties.filter(p => p.type === 'Property').map(p => {
    const key = p.key.type === 'Identifier' ? p.key.name : typeof p.key.value === 'string' ? p.key.value : undefined;
    const v = p.value;
    const value = v.type === 'Literal' ? v.value : v.type === 'TemplateLiteral' && !v.expressions.length ? v.quasis[0].value.cooked : undefined;
    return {key, value, node: p};
  });
}

/** A rule over inline style objects: `check(key, value)` returns a message or nothing. */
function styleRule(check) {
  return context => ({
    JSXAttribute(node) {
      if (attrName(node) !== 'style') return;
      for (const {key, value, node: prop} of styleProps(node)) {
        if (key === undefined || value === undefined || value === null) continue;
        const message = check(key, String(value));
        if (message) context.report({node: prop, message});
      }
    },
  });
}

/** Runs several rule bodies as one: each returns a visitor map. */
function merge(...visitors) {
  const out = {};
  for (const v of visitors) for (const [key, fn] of Object.entries(v)) {
    const prev = out[key];
    out[key] = prev ? node => { prev(node); fn(node); } : fn;
  }
  return out;
}

const COLOR_PROPS = /^(?:color|background|backgroundColor|border\w*Color|borderColor|border|outline|outlineColor|fill|stroke|stopColor|floodColor|caretColor|accentColor|textDecorationColor|boxShadow|textShadow)$/;
const COLOR_ATTRS = new Set(['fill', 'stroke', 'color', 'stopColor', 'floodColor', 'lightingColor']);

// ---- the rules ----------------------------------------------------------------------------------------------------

const rules = {
  'unknown-class': classRule(meta('unknown-class', 'Use only classes Lime\'s theme defines.', 'lime-tokens-only'), c => {
    for (const variant of c.variants) {
      if (variant === 'dark' || !unknownVariant(variant)) continue;
      const bp = BREAKPOINTS.length && /\d?xl$|^(?:max|min)-/.test(variant) ? `; Lime's breakpoints are ${BREAKPOINTS.join(', ')}` : '';
      return `"${variant}:" is not a variant in Lime's theme${bp}.`;
    }
    if (c.arbitrary || rawColor(c) || gradient(c) || caps(c) || c.base.startsWith('[')) return undefined;
    const has = limeHas(c);
    if (has !== false || !looksTailwind(c)) return undefined;
    const hint = suggest(c);
    return `"${c.utility}" is not in Lime's theme${hint ? `; use ${hint}` : '; use a class from the Tokens list in the Lime skill'}.`;
  }),

  'no-raw-color': {
    meta: meta('no-raw-color', 'Use a Lime color role, never a raw or palette color.', 'lime-tokens-only'),
    create(context) {
      const classes = classRule({}, c => {
        const color = rawColor(c);
        if (!color) return undefined;
        const root = c.root ?? 'text';
        const white = /^white/.test(color) && root === 'text' ? '; text on lime is text-on-accent, on ink text-fg-inverse' : '';
        return `Raw color ${color} in "${c.utility}"; use a color role such as ${roles(root)}${white}.`;
      }).create(context);
      const styles = styleRule((key, value) => {
        const hit = value.match(RAW)?.[0] ?? (COLOR_PROPS.test(key) && value.toLowerCase().split(/[\s,]+/).find(word => NAMED.has(word)));
        return hit ? `Raw color ${hit.replace(/\($/, '()')} in style.${key}; use a color role class such as text-fg or bg-surface.` : undefined;
      })(context);
      const attrs = {
        JSXAttribute(node) {
          const name = attrName(node);
          if (!name || isClassAttr(name) || name === 'style') return;
          const value = stringOf(node)?.trim();
          if (!value) return;
          if (new RegExp(`^(?:${RAW.source})`).test(value) || (COLOR_ATTRS.has(name) && NAMED.has(value.toLowerCase()))) {
            context.report({node, message: `Raw color ${value} in ${name}; use currentColor and a color role class such as text-fg-3.`});
          }
        },
      };
      return merge(classes, styles, attrs);
    },
  },

  'no-arbitrary-value': classRule(meta('no-arbitrary-value', 'Use a token or a scale step, not an arbitrary value.', 'spacing-scale-only'), c => {
    if (!handPicked(c) || rawColor(c) || gradient(c) || caps(c)) return undefined;
    const hint = c.root ? suggest(c) : undefined;
    return `Arbitrary value "${c.utility}"; use ${hint ?? 'a scale step or a token'}, or var(--token) inside the brackets.`;
  }),

  'no-inline-style': {
    meta: meta('no-inline-style', 'Style with Lime\'s classes, not inline styles.', 'lime-tokens-only'),
    create(context) {
      return {
        JSXAttribute(node) {
          if (attrName(node) !== 'style') return;
          const expr = styleObject(node);
          if (!expr) return;
          // Setting a custom property for a class to read, as in style={{'--pct': '40%'}} with w-(--pct), is the way in.
          const plain = expr.properties.filter(p => p.type === 'Property' && !(p.key.type === 'Literal' && String(p.key.value).startsWith('--')));
          if (!plain.length) return;
          context.report({node, message: 'Inline style; use Lime\'s classes. For a value known only at runtime, set a custom property (style={{\'--pct\': value}}) and read it in a class (w-(--pct)).'});
        },
      };
    },
  },

  'no-dynamic-class': {
    meta: meta('no-dynamic-class', 'Write each class whole, so Tailwind can find it.', 'lime-tokens-only'),
    create(context) {
      // Whether every string an expression can give is whole classes at that edge: `text-sm${on ? ' text-fg' : ''}` is.
      const joins = (expr, edge) => {
        if (expr.type === 'Literal') return typeof expr.value === 'string' && edge.test(expr.value);
        if (expr.type === 'TemplateLiteral') return edge.test(expr.quasis.map(q => q.value.cooked).join(''));
        if (expr.type === 'ConditionalExpression') return joins(expr.consequent, edge) && joins(expr.alternate, edge);
        if (expr.type === 'LogicalExpression') return joins(expr.right, edge);
        return false;
      };
      const check = node => {
        if (!node) return;
        if (node.type === 'TemplateLiteral') {
          node.expressions.forEach((expr, i) => {
            const before = node.quasis[i].value.cooked ?? '';
            const after = node.quasis[i + 1].value.cooked ?? '';
            if ((/\S$/.test(before) && !joins(expr, /^(?:\s|$)/)) || (/^\S/.test(after) && !joins(expr, /(?:\s|^)$/))) context.report({node: expr, message: 'A class built from a value, as in `bg-${tone}`, is never generated; map each value to a whole class (const tones = {ok: \'bg-success-tint\'}) and pass it through cn().'});
          });
          return;
        }
        if (node.type === 'BinaryExpression' && node.operator === '+') {
          context.report({node, message: 'Classes joined with +; pass each whole class to cn() instead, as in cn(\'px-2\', active && \'bg-accent-wash\').'});
          return;
        }
        if (node.type === 'ConditionalExpression') { check(node.consequent); check(node.alternate); }
        if (node.type === 'LogicalExpression') check(node.right);
        if (node.type === 'ArrayExpression') node.elements.forEach(check);
      };
      return {
        JSXAttribute(node) {
          if (!isClassAttr(attrName(node)) || node.value?.type !== 'JSXExpressionContainer') return;
          check(node.value.expression);
        },
        CallExpression(node) { if (isClassCall(node) && node.callee.name !== 'cva' && node.callee.name !== 'tv') node.arguments.forEach(check); },
      };
    },
  },

  'no-dark-variant': classRule(meta('no-dark-variant', 'Lime flips its tokens for dark; never write dark:.', 'color-roles-only'), c =>
    c.variants.includes('dark') ? `"${c.token}" uses dark:; Lime's color roles change in the dark theme on their own, so use the role alone.` : undefined),

  'no-caps': {
    meta: meta('no-caps', 'Keep sentence case; no capitals or letter spacing.', 'anti-slop-no-caps'),
    create(context) {
      return merge(
        classRule({}, c => caps(c) ? `"${c.utility}" sets capitals or spreads letters; keep sentence case${c.base === 'uppercase' ? '' : ', and use tracking-tight only on text-xl and larger'}.` : undefined).create(context),
        styleRule((key, value) => {
          if (key === 'textTransform' && value === 'uppercase') return 'textTransform: uppercase; keep sentence case.';
          if (key === 'letterSpacing' && !/^(?:-|0(?:\D|$)|normal)/.test(value.trim())) return `letterSpacing: ${value}; Lime never tracks letters out.`;
          return undefined;
        })(context),
      );
    },
  },

  'no-transition-all': {
    meta: meta('no-transition-all', 'Name the properties a transition moves.', 'motion-properties'),
    create(context) {
      return merge(
        classRule({}, c => transitionAll(c) ? `"${c.utility}" animates every property; use transition-colors, transition-opacity or transition-transform with duration-(--dur-fast).` : undefined).create(context),
        styleRule((key, value) => ((key === 'transition' && /^\s*all\b/.test(value)) || (key === 'transitionProperty' && value.trim() === 'all'))
          ? `${key}: ${value}; name the properties, such as color, background-color and opacity.` : undefined)(context),
      );
    },
  },

  'no-outline-none': {
    meta: meta('no-outline-none', 'Keep the focus ring.', 'lime-focus'),
    create(context) {
      return merge(
        classRule({}, c => outlineNone(c) ? `"${c.token}" removes the focus ring; Lime's 2px olive :focus-visible ring is already on every element, so leave the outline alone.` : undefined).create(context),
        styleRule((key, value) => ((key === 'outline' || key === 'outlineStyle' || key === 'outlineWidth') && /^(?:none|0(?:px)?)$/.test(value.trim()))
          ? `${key}: ${value} removes the focus ring; leave the outline alone.` : undefined)(context),
      );
    },
  },

  'no-gradient': {
    meta: meta('no-gradient', 'No gradients; the glow is Lime\'s only one.', 'anti-slop-no-decoration'),
    create(context) {
      return merge(
        classRule({}, c => gradient(c) ? `"${c.utility}" draws a gradient; use a flat role such as bg-surface, and the Button primary variant for the one glow.` : undefined).create(context),
        styleRule((key, value) => /gradient\(/.test(value) ? `style.${key} draws a gradient; use a flat role such as bg-surface.` : undefined)(context),
      );
    },
  },

  'no-native-control': {
    meta: meta('no-native-control', 'Use Lime\'s components for controls.', 'lime-components-first'),
    create(context) {
      const use = {button: 'Button from \'@/components/lime/ui/button\'', textarea: 'Textarea from \'@/components/lime/ui/textarea\'',
        select: 'Select from \'@/components/lime/ui/select\'', dialog: 'Dialog, AlertDialog or Sheet from \'@/components/lime/ui/\'',
        checkbox: 'Checkbox from \'@/components/lime/ui/checkbox\'', radio: 'Radio from \'@/components/lime/ui/radio\'', range: 'Slider from \'@/components/lime/ui/slider\'',
        file: 'Dropzone from \'@/components/lime/ui/dropzone\'', input: 'Input from \'@/components/lime/ui/input\' inside a Field'};
      return {
        JSXOpeningElement(node) {
          const name = elementName(node);
          if (!['button', 'input', 'textarea', 'select', 'dialog'].includes(name)) return;
          const type = name === 'input' ? stringOf(attribute(node, 'type')) : undefined;
          if (type === 'hidden') return;
          context.report({node, message: `Native <${name}${type ? ` type="${type}"` : ''}>; use ${use[type] ?? use[name]}, which brings the focus ring, states and touch size.`});
        },
      };
    },
  },

  'field-label': {
    meta: meta('field-label', 'Every input sits in a Field with a label.', 'lime-field-label'),
    create(context) {
      let imports;
      const CONTROLS = new Set(['Input', 'Textarea', 'Select', 'Combobox']);
      const labelled = opening => ['aria-label', 'aria-labelledby'].some(name => attribute(opening, name));
      const isField = element => element.type === 'JSXElement' && imports.get(elementName(element.openingElement))?.imported === 'Field';
      // Select and Combobox take their name on a part: aria-label on SelectTrigger or ComboboxInput counts.
      const labelledInside = node => {
        const stack = [...(node.children ?? [])];
        while (stack.length) {
          const n = stack.pop();
          if (!n || typeof n !== 'object') continue;
          if (n.type === 'JSXElement' && labelled(n.openingElement)) return true;
          for (const [key, value] of Object.entries(n)) {
            if (key === 'parent' || key === 'loc' || key === 'range') continue;
            if (Array.isArray(value)) stack.push(...value); else if (value && typeof value === 'object' && value.type) stack.push(value);
          }
        }
        return false;
      };
      return {
        JSXElement(node) {
          imports ??= limeImports(context);
          const opening = node.openingElement;
          const info = imports.get(elementName(opening));
          if (!info || !CONTROLS.has(info.imported) || labelled(opening) || hasSpread(opening)) return;
          for (let p = node.parent; p; p = p.parent) if (isField(p)) return;
          if ((info.imported === 'Select' || info.imported === 'Combobox') && labelledInside(node)) return;
          context.report({node: opening, message: `<${elementName(opening)}> has no label; wrap it in <Field> with a <FieldLabel> above it, or give it aria-label when the words around it already name it.`});
        },
      };
    },
  },

  'no-restyle': {
    meta: meta('no-restyle', 'Place Lime\'s components; do not restyle them.', 'lime-components-first'),
    create(context) {
      let imports;
      // Components whose size is set by the caller: a Skeleton is shaped to the content it stands in for, a ScrollArea is as tall as its room.
      const SIZED = new Set(['Skeleton', 'ScrollArea']);
      // Controls have a fixed look: their height, padding, type and edge come from size and variant props. Every other
      // component (Card, TableCell, Empty ...) takes padding and type from the caller, but never a fill, radius or shadow.
      const CONTROLS = new Set(['Button', 'CopyButton', 'Input', 'Textarea', 'SelectTrigger', 'ComboboxInput', 'Chip', 'Badge', 'Avatar', 'Switch', 'Checkbox',
        'Radio', 'Segmented', 'SegmentedItem', 'Keypad', 'Slider', 'Amount', 'Balance', 'TabsList', 'TabsTrigger', 'ToolbarButton', 'ToolbarToggle', 'ChatInput', 'Progress']);
      const SURFACE = new Set(['glow', 'fill', 'radius', 'shadow']);
      const PADDING = /^-?(?:p|px|py|ps|pe|pt|pr|pb|pl|pbs|pbe)$/;
      const TEXT_SIZES = lime.values.text ?? new Set();
      const restyles = c => {
        const r = c.root;
        if (/^glow/.test(c.base)) return 'glow';
        if (r === undefined) return undefined;
        if (r === 'bg') return 'fill';
        if (r === 'h' || r === 'min-h' || r === 'max-h' || r === 'size') return 'height';
        if (/^rounded/.test(r)) return 'radius';
        if (PADDING.test(r)) return 'padding';
        if (r === 'shadow') return 'shadow';
        if (/^border/.test(r) && c.value !== undefined && (lime.colors.has(c.value) || c.value === '' || isNumber(c.value))) return 'border';
        if (r === 'text' && (lime.colors.has(c.value) || /^(?:xs|sm|base|lg|\d?xl)$/.test(c.value) || (TEXT_SIZES.has(c.value) && /xl|xs|sm|lg|base/.test(c.value)))) return 'text';
        if (r === 'font' && ['normal', 'medium', 'semibold', 'bold', 'light'].includes(c.value)) return 'weight';
        return undefined;
      };
      return {
        JSXOpeningElement(node) {
          imports ??= limeImports(context);
          const info = imports.get(elementName(node));
          if (!info || SIZED.has(info.imported)) return;
          const control = CONTROLS.has(info.imported);
          for (const {c, loc} of elementTokens(context.sourceCode, node)) {
            const what = restyles(c);
            if (what && (control || SURFACE.has(what))) context.report({loc, message: `"${c.utility}" restyles the ${what} of <${elementName(node)}>; use its variant and size props, and keep className for placement such as w-full, flex-1, self-start or mt-4.`});
          }
        },
      };
    },
  },

  'lime-scarce': {
    meta: meta('lime-scarce', 'Lime fills the one primary action, never a surface.', 'lime-lime-scarce'),
    create(context) {
      return {
        JSXOpeningElement(node) {
          const name = elementName(node);
          if (!name || !/^[a-z]/.test(name)) return;
          for (const {c, loc} of elementTokens(context.sourceCode, node)) {
            if (/^bg-accent(?:-hover|-active)?$/.test(c.base)) context.report({loc, message: `"${c.utility}" fills a <${name}> with lime; lime is for the primary Button. Use bg-accent-wash for a chosen row, bg-surface for a panel.`});
          }
        },
      };
    },
  },

  'section-heading': {
    meta: meta('section-heading', 'A section heading is a real heading at text-lg.', 'lime-section-heading'),
    create(context) {
      return {
        JSXOpeningElement(node) {
          const name = elementName(node);
          if (!/^h[2-6]$/.test(name ?? '')) return;
          for (const {c, loc} of elementTokens(context.sourceCode, node)) {
            if (c.variants.length || !['text-xs', 'text-sm', 'label', 'caption'].includes(c.base)) continue;
            context.report({loc, message: `<${name}> set at ${c.base} reads as a small label; head a section with an h2 at text-lg font-semibold in text-fg, or drop the heading.`});
          }
        },
      };
    },
  },

  'one-primary': {
    meta: meta('one-primary', 'One lime primary action per view.', 'lime-one-action', 'suggestion'),
    create(context) {
      let imports;
      const groups = new Map();
      const FN = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);
      // Buttons in different branches of a condition are different views; only those on the same path are counted together.
      const branchKey = node => {
        const path = [];
        let child = node;
        for (let p = node.parent; p; child = p, p = p.parent) {
          if (FN.has(p.type)) return {fn: p, key: path.join('|')};
          if (p.type === 'ConditionalExpression' && child !== p.test) path.push(`${p.range[0]}${child === p.consequent ? 'c' : 'a'}`);
          else if (p.type === 'LogicalExpression' && child === p.right) path.push(`${p.range[0]}r`);
          else if (p.type === 'IfStatement' && child !== p.test) path.push(`${p.range[0]}${child === p.consequent ? 'c' : 'a'}`);
          else if (p.type === 'SwitchCase') path.push(`${p.range[0]}s`);
        }
        return {fn: null, key: path.join('|')};
      };
      return {
        JSXOpeningElement(node) {
          imports ??= limeImports(context);
          if (imports.get(elementName(node))?.imported !== 'Button') return;
          const variant = attribute(node, 'variant');
          if (variant && stringOf(variant) !== 'primary') return;
          if (hasSpread(node) && !variant) return;
          const {fn, key} = branchKey(node);
          const id = `${fn?.range[0] ?? 'top'}:${key}`;
          if (!groups.has(id)) groups.set(id, []);
          groups.get(id).push(node);
        },
        'Program:exit'() {
          for (const nodes of groups.values()) for (const node of nodes.slice(1)) {
            context.report({node, message: 'A second primary Button in this view; keep one lime action and make the others solid, secondary, outline or ghost.'});
          }
        },
      };
    },
  },

  'no-emoji-or-em-dash': {
    meta: meta('no-emoji-or-em-dash', 'Write words: no emoji, no em dash.', 'lime-sentence-case', 'suggestion'),
    create(context) {
      const EMOJI = /(?![©®™‼⁉])\p{Extended_Pictographic}/u;
      const check = (node, text) => {
        if (typeof text !== 'string') return;
        if (EMOJI.test(text)) context.report({node, message: 'Emoji in UI copy; use words, and an Icon from \'@/components/lime/icon\' where a glyph helps.'});
        if (text.includes('—')) context.report({node, message: 'Em dash in UI copy; end the sentence or use a comma.'});
      };
      const inJsx = node => node.parent?.type === 'JSXExpressionContainer' || node.parent?.type === 'JSXAttribute';
      return {
        JSXText(node) { check(node, node.value); },
        Literal(node) { if (inJsx(node) && !(node.parent.type === 'JSXAttribute' && isClassAttr(attrName(node.parent)))) check(node, node.value); },
        TemplateLiteral(node) { if (node.parent?.type === 'JSXExpressionContainer') for (const q of node.quasis) check(q, q.value.cooked); },
      };
    },
  },

  'no-second-icon-set': {
    meta: meta('no-second-icon-set', 'One icon set, through Lime\'s icon file.', 'iconography-one-source'),
    create(context) {
      const ICON_PACKAGES = /^(?:lucide-react|lucide|react-icons|@heroicons\/[\w-]+|@radix-ui\/react-icons|@tabler\/icons(?:-react)?|@phosphor-icons\/[\w-]+|phosphor-react|@fortawesome\/[\w-]+|@mui\/icons-material|react-feather|feather-icons|@carbon\/icons-react|@carbon\/icons|iconoir-react|@iconify\/[\w-]+|@iconify-icon\/[\w-]+|@remixicon\/[\w-]+|remixicon|react-bootstrap-icons|@ant-design\/icons|ionicons|@primer\/octicons-react|@hugeicons\/[\w-]+|@untitled-ui\/icons-react|@expo\/vector-icons|@mdi\/[\w-]+|@icon-park\/[\w-]+|@geist-ui\/icons|@spectrum-icons\/[\w-]+)(?:\/|$)/;
      const check = (node, source) => {
        if (typeof source !== 'string' || /^[.~#]|^@\//.test(source)) return;
        if (ICON_PACKAGES.test(source) || /^(?:@[\w-]+\/)?[\w-]*-icons?(?:-react)?(?:\/|$)/.test(source)) {
          context.report({node, message: `Icons from ${source}; import Icon and the glyph from '@/components/lime/icon', and add a missing glyph to that file.`});
        }
      };
      return {
        ImportDeclaration(node) { check(node.source, node.source.value); },
        ImportExpression(node) { if (node.source.type === 'Literal') check(node.source, node.source.value); },
      };
    },
  },
};

const ids = Object.keys(rules);
const WARN = new Set(['one-primary', 'no-emoji-or-em-dash']);
/** Rules that guard app code only. Lime's own source builds the controls, so it may use what these forbid. */
const APP_ONLY = new Set(['no-raw-color', 'no-outline-none', 'no-arbitrary-value', 'no-inline-style', 'no-dynamic-class', 'no-native-control', 'field-label', 'no-restyle', 'lime-scarce', 'one-primary', 'no-second-icon-set']);

/**
 * Run alone (npx eslint -c lime.eslint.config.mjs), ESLint knows only Lime's rules, so an eslint-disable comment for
 * another plugin's rule would report that rule as missing. This processor drops those reports and nothing else.
 */
const standalone = {
  meta: {name: 'lime/standalone'},
  supportsAutofix: true,
  preprocess: text => [text],
  postprocess: messages => messages.flat().filter(m => !(m.ruleId && !m.ruleId.startsWith('lime/') && /^Definition for rule '.+' was not found/.test(m.message))),
};

const plugin = {
  meta: {name: 'lime', version: '1.0.0'},
  processors: {standalone},
  rules,
  configs: {
    app: {rules: Object.fromEntries(ids.map(id => [`lime/${id}`, WARN.has(id) ? 'warn' : 'error']))},
    source: {rules: Object.fromEntries(ids.filter(id => APP_ONLY.has(id)).map(id => [`lime/${id}`, 'off']))},
  },
};

export default plugin;
