// Synced from Resnovas/.github templates/tools/lint/security.mjs. Edit it there.
// Shared security lint (EVE-330). The agent skill security-checks explains each rule and its fix.

const publicPrefixes = ['EXPO_PUBLIC_', 'NEXT_PUBLIC_', 'VITE_', 'REACT_APP_', 'PUBLIC_']
const secretName = /(?:SECRET|TOKEN|PASSWORD|PASSWD|PRIVATE|CREDENTIAL|API_?KEY|ACCESS_?KEY|(?:^|_)KEY$|(?:^|_)DSN$|DATABASE_URL|CONNECTION_STRING|WEBHOOK_SIGNING)/
const credentialKey = /^(?:user(?:_?name)?|login|account|email|password|passw(?:or)?d|pwd|pass|secret|credentials?)$/i
const commonCredentials = new Set([
  'admin', 'administrator', 'root', 'toor', 'superuser', 'sa', 'sysadmin', 'password', 'password1', 'passw0rd', 'pass', 'test', 'tester', 'testing', 'test123',
  'guest', 'user', 'demo', 'default', 'changeme', 'letmein', 'welcome', 'secret', 'qwerty', 'abc123', 'admin123', '123456', '1234567', '12345678', '123456789', '111111',
])
const rawSqlMethods = new Set(['unsafe', 'raw'])
const queryMethods = new Set(['query', 'execute', 'exec', 'unsafe', 'raw', 'prepare', 'run', 'all', 'get'])
const sqlText = /^\s*(?:SELECT|INSERT|UPDATE|DELETE|WITH|CREATE|ALTER|DROP|TRUNCATE|MERGE|REPLACE|PRAGMA|GRANT|REVOKE)\b/i
const htmlSinks = new Set(['innerHTML', 'outerHTML'])
const requestInputs = new Set(['body', 'query', 'params', 'cookies', 'headers', 'json', 'text', 'formData', 'arrayBuffer', 'urlParamsBody', 'multipart', 'searchParams', 'url'])

const name = (node) => node?.type === 'Identifier' ? node.name : node?.type === 'Literal' ? String(node.value) : node?.type === 'TemplateLiteral' && node.expressions.length === 0 ? node.quasis[0].value.cooked : undefined
const property = (node) => node?.type === 'MemberExpression' ? (node.computed ? name(node.property) : node.property.name) : undefined
const staticString = (node) => (node?.type === 'Literal' && typeof node.value === 'string') || (node?.type === 'TemplateLiteral' && node.expressions.length === 0)
const calleeText = (node) => node?.type === 'Identifier' ? node.name : node?.type === 'MemberExpression' && !node.computed ? `${calleeText(node.object) ?? '?'}.${node.property.name}` : undefined
const keyOf = (node) => node.type === 'Property' ? name(node.key) : node.type === 'VariableDeclarator' ? name(node.id) : node.type === 'AssignmentExpression' ? (property(node.left) ?? name(node.left)) : node.type === 'JSXAttribute' ? node.name.name : undefined

/** Return the environment variable a member expression reads, for process.env and import.meta.env only. */
const envName = (node) => {
  if (node.type !== 'MemberExpression') return undefined
  const object = node.object
  const isEnv = object.type === 'MemberExpression' && property(object) === 'env' &&
    ((object.object.type === 'Identifier' && object.object.name === 'process') || object.object.type === 'MetaProperty')
  return isEnv ? property(node) : undefined
}

const noSecretEnv = {
  meta: {
    type: 'problem',
    schema: [{ type: 'object', additionalProperties: false, properties: { client: { type: 'boolean' }, publicPrefixes: { type: 'array', items: { type: 'string' } }, allow: { type: 'array', items: { type: 'string' } } } }],
    messages: {
      publicSecret: '{{name}} looks like a secret but uses the public prefix {{prefix}}, which inlines it into every client bundle. Keep the secret on the server and expose only a server endpoint that uses it. If the value is publishable by design, add it to the rule\'s allow list with the reason.',
      clientSecret: 'Client code reads {{name}}, which looks like a secret. Secrets live only on the server: move this call behind a server action and return only the result.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    const prefixes = options.publicPrefixes ?? publicPrefixes
    const allow = new Set(options.allow ?? [])
    return {
      MemberExpression(node) {
        const variable = envName(node)
        if (!variable || allow.has(variable)) return
        const prefix = prefixes.find((candidate) => variable.startsWith(candidate))
        const rest = prefix ? variable.slice(prefix.length) : variable
        if (!secretName.test(rest)) return
        if (prefix) context.report({ node, messageId: 'publicSecret', data: { name: variable, prefix } })
        else if (options.client) context.report({ node, messageId: 'clientSecret', data: { name: variable } })
      },
    }
  },
}

const serverModule = /(?:^server-only$|(?:^|[/.@-])server(?:$|[/.]))/
const noServerImport = {
  meta: {
    type: 'problem',
    schema: [{ type: 'object', additionalProperties: false, properties: { patterns: { type: 'array', items: { type: 'string' } } } }],
    messages: { serverImport: 'Client code imports the server-only module {{source}}. Its secrets and credentials would ship in the client bundle. Call a server action instead, or move shared types into a portable package.' },
  },
  create(context) {
    const extra = (context.options[0]?.patterns ?? []).map((pattern) => new RegExp(pattern))
    const check = (node, source) => {
      if (typeof source !== 'string') return
      if (serverModule.test(source) || extra.some((pattern) => pattern.test(source))) context.report({ node, messageId: 'serverImport', data: { source } })
    }
    return {
      ImportDeclaration: (node) => check(node, node.source.value),
      ExportNamedDeclaration: (node) => check(node, node.source?.value),
      ExportAllDeclaration: (node) => check(node, node.source.value),
      ImportExpression: (node) => check(node, name(node.source)),
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'require') check(node, name(node.arguments[0]))
      },
    }
  },
}

/** A literal credential is common when it is on the denylist, or an email whose local part is. */
const common = (value) => {
  const text = value.trim().toLowerCase()
  return commonCredentials.has(text) || (text.includes('@') && commonCredentials.has(text.split('@')[0]))
}
const noCommonCredentials = {
  meta: {
    type: 'problem',
    schema: [],
    messages: { common: 'The {{key}} "{{value}}" is a common default credential that attackers try first. Use the repository\'s unique fixed test identifier (for example a string of digits specific to Resnovas) and seed it only in local and test environments.' },
  },
  create(context) {
    const check = (holder, valueNode) => {
      const key = keyOf(holder)
      if (!key || !credentialKey.test(key)) return
      const node = valueNode?.type === 'JSXExpressionContainer' ? valueNode.expression : valueNode
      if (!staticString(node)) return
      const value = name(node)
      if (common(value)) context.report({ node, messageId: 'common', data: { key, value } })
    }
    return {
      Property: (node) => check(node, node.value),
      VariableDeclarator: (node) => check(node, node.init),
      AssignmentExpression: (node) => check(node, node.right),
      JSXAttribute: (node) => check(node, node.value),
    }
  },
}

const requireDeclaration = {
  meta: {
    type: 'problem',
    schema: [{ type: 'array', items: { type: 'object', additionalProperties: false, required: ['callee', 'properties', 'message'], properties: {
      callee: { type: 'string' }, source: { type: 'string' }, argument: { type: 'integer', minimum: 0 }, properties: { type: 'array', minItems: 1, items: { type: 'string' } }, message: { type: 'string' },
    } } }],
    messages: {
      missing: '{{callee}} is registered without {{property}}. {{message}}',
      notLiteral: 'Pass the {{callee}} options as an object literal so the declaration of {{property}} can be reviewed and checked. {{message}}',
    },
  },
  create(context) {
    const declarations = context.options[0] ?? []
    /** Resolve an identifier to the definition of its binding in this file. */
    const definition = (node) => {
      let scope = context.sourceCode.getScope(node)
      while (scope) {
        const variable = scope.set.get(node.name)
        if (variable) return variable.defs[0]
        scope = scope.upper
      }
      return undefined
    }
    /** Unwrap type assertions and same-file const bindings to the object literal they hold, if any. */
    const literal = (node, seen = new Set()) => {
      while (node?.type === 'TSAsExpression' || node?.type === 'TSSatisfiesExpression') node = node.expression
      if (node?.type !== 'Identifier' || seen.has(node.name)) return node
      seen.add(node.name)
      const def = definition(node)
      return def?.type === 'Variable' && def.parent.kind === 'const' ? literal(def.node.init, seen) : node
    }
    /** Property names an object literal declares, following spreads of same-file const object literals. */
    const declared = (object, seen = new Set()) => object.properties.flatMap((entry) => {
      if (entry.type === 'Property') return [name(entry.key)]
      if (entry.type !== 'SpreadElement') return []
      const init = literal(entry.argument, seen)
      return init?.type === 'ObjectExpression' ? declared(init, seen) : []
    })
    /** Whether the callee's root identifier is imported from a module matching the configured source. */
    const imported = (callee, source) => {
      if (!source) return true
      let root = callee
      while (root.type === 'MemberExpression') root = root.object
      const def = root.type === 'Identifier' ? definition(root) : undefined
      return def?.type === 'ImportBinding' && new RegExp(source).test(def.parent.source.value)
    }
    return {
      CallExpression(node) {
        const callee = calleeText(node.callee)
        for (const declaration of declarations) {
          if (callee !== declaration.callee || !imported(node.callee, declaration.source)) continue
          const options = literal(node.arguments[declaration.argument ?? 0])
          const names = options?.type === 'ObjectExpression' ? declared(options) : []
          for (const required of declaration.properties) {
            const data = { callee, property: required, message: declaration.message }
            if (options?.type !== 'ObjectExpression') context.report({ node, messageId: 'notLiteral', data })
            else if (!names.includes(required)) context.report({ node: options, messageId: 'missing', data })
          }
        }
      },
    }
  },
}

/** Leftmost literal text of a template or concatenation, used to tell SQL from other strings. */
const leading = (node) => node?.type === 'TemplateLiteral' ? node.quasis[0].value.cooked : node?.type === 'BinaryExpression' ? leading(node.left) : node?.type === 'Literal' && typeof node.value === 'string' ? node.value : ''
/** A query argument is string-built when SQL text is concatenated or interpolated outside a tagged template. */
const stringBuilt = (node) => ((node?.type === 'TemplateLiteral' && node.expressions.length > 0) || (node?.type === 'BinaryExpression' && node.operator === '+')) && sqlText.test(leading(node))
const noRawSql = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      raw: '{{method}}() runs SQL text without bound parameters. Use the tagged sql template (or the query builder), which binds every value; use sql(identifier) for a trusted identifier. Only the allowlisted migration runner may execute raw statements.',
      built: 'This query is built from strings, so a value can change its meaning (SQL injection). Use the tagged sql template or the query builder so every value is a bound parameter.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const method = property(node.callee)
        if (!method) return
        const argument = node.arguments[0]
        if (rawSqlMethods.has(method) && argument && !staticString(argument)) context.report({ node, messageId: 'raw', data: { method } })
        else if (queryMethods.has(method) && stringBuilt(argument)) context.report({ node: argument, messageId: 'built' })
      },
    }
  },
}

const noRawHtml = {
  meta: {
    type: 'problem',
    schema: [{ type: 'object', additionalProperties: false, properties: { sanitizers: { type: 'array', items: { type: 'string' } } } }],
    messages: { html: 'Rendering raw HTML here allows cross-site scripting when any part of it comes from a user. Render text through components, or pass the HTML through an approved sanitiser ({{sanitizers}}) first.' },
  },
  create(context) {
    const sanitizers = new Set(context.options[0]?.sanitizers ?? [])
    const data = { sanitizers: sanitizers.size ? [...sanitizers].join(', ') : 'none approved yet' }
    const sanitized = (node) => node?.type === 'CallExpression' && sanitizers.has(calleeText(node.callee))
    return {
      JSXAttribute(node) {
        if (node.name.name !== 'dangerouslySetInnerHTML') return
        const value = node.value?.expression
        const html = value?.type === 'ObjectExpression' ? value.properties.find((entry) => entry.type === 'Property' && name(entry.key) === '__html')?.value : undefined
        if (!sanitized(html)) context.report({ node, messageId: 'html', data })
      },
      AssignmentExpression(node) {
        if (htmlSinks.has(property(node.left)) && !sanitized(node.right)) context.report({ node, messageId: 'html', data })
      },
      CallExpression(node) {
        const method = calleeText(node.callee)
        const sink = ['document.write', 'document.writeln'].includes(method) ? node.arguments[0]
          : property(node.callee) === 'insertAdjacentHTML' ? node.arguments[1]
          : property(node.callee) === 'createContextualFragment' ? node.arguments[0] : undefined
        if (sink && !sanitized(sink)) context.report({ node, messageId: 'html', data })
      },
    }
  },
}

/** Whether a function body calls a schema decoder, so the request input it reads is validated in the same scope. */
const decodes = (fn, decoder) => {
  let found = false
  const visit = (node) => {
    if (found || !node || typeof node.type !== 'string') return
    if (node.type === 'CallExpression' && decoder.test(calleeText(node.callee) ?? property(node.callee) ?? '')) { found = true; return }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'parent') continue
      if (Array.isArray(value)) value.forEach(visit)
      else if (value && typeof value === 'object') visit(value)
    }
  }
  visit(fn.body)
  return found
}
const requireInputDecode = {
  meta: {
    type: 'problem',
    schema: [{ type: 'object', additionalProperties: false, properties: { decoders: { type: 'string' }, requests: { type: 'string' } } }],
    messages: { decode: 'This reads untrusted request input ({{input}}) in a function that never decodes it. Decode every public input with the shared Effect Schema boundary (for example Schema.decodeUnknown or HttpServerRequest.schemaBodyJson) before use; client-side checks are convenience only.' },
  },
  create(context) {
    const options = context.options[0] ?? {}
    const decoder = new RegExp(options.decoders ?? '(?:^|\\.)(?:decode\\w*|schema\\w+)$')
    const requests = new RegExp(options.requests ?? '^(?:req|request)$')
    return {
      MemberExpression(node) {
        const input = property(node)
        if (!requestInputs.has(input)) return
        const object = node.object
        const target = object.type === 'Identifier' ? object.name : property(object)
        if (!target || !requests.test(target)) return
        const fn = context.sourceCode.getAncestors(node).findLast((ancestor) => ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(ancestor.type))
        if (!fn || !decodes(fn, decoder)) context.report({ node, messageId: 'decode', data: { input } })
      },
    }
  },
}

const plugins = { 'house-security': { rules: {
  'no-secret-env': noSecretEnv,
  'no-server-import': noServerImport,
  'no-common-credentials': noCommonCredentials,
  'require-declaration': requireDeclaration,
  'no-raw-sql': noRawSql,
  'no-raw-html': noRawHtml,
  'require-input-decode': requireInputDecode,
} } }

/** Every editable source: public secret names, common credentials, raw SQL and raw HTML. */
export const security = {
  plugins,
  rules: {
    'house-security/no-secret-env': 'error',
    'house-security/no-common-credentials': 'error',
    'house-security/no-raw-sql': 'error',
    'house-security/no-raw-html': 'error',
  },
}

/** Client bundles (web, Android, iOS): additionally no secret env reads and no server-only imports. */
export const securityClient = {
  plugins,
  rules: {
    'house-security/no-secret-env': ['error', { client: true }],
    'house-security/no-server-import': 'error',
  },
}

/** Server entry points: every read of public request input must be decoded in the same function. */
export const securityServer = {
  plugins,
  rules: { 'house-security/require-input-decode': 'error' },
}

/**
 * Registration declarations, configured per repository because callee names differ.
 * For example: [{ callee: 'Action.define', argument: 1, properties: ['permission', 'rateLimit'], message: '...' }].
 */
export const securityDeclarations = (declarations) => ({
  plugins,
  rules: { 'house-security/require-declaration': ['error', declarations] },
})
