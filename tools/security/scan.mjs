// Synced from Resnovas/.github templates/tools/security/scan.mjs. Edit it there.
// Dependency-free security scan (EVE-330): committed secrets, built client bundles,
// common credentials in data files, and SQL row-level security and sequential IDs.
// The agent skill security-checks explains every finding and how to fix it.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'
import { parseArgs } from 'node:util'
import { pathToFileURL } from 'node:url'

const help = `Usage: node tools/security/scan.mjs [--tracked [--exclude PREFIX ...]] [--bundle DIR ...]
  [--postgres DIR ...] [--sqlite DIR ...] [--baseline FILE]

--tracked        Scan every git-tracked file for committed secrets and common credentials.
--exclude PREFIX Skip tracked paths under PREFIX, only for vendored upstream sources and
                 immutable historical snapshots; repeatable.
--bundle DIR     Scan a built client bundle for secrets; repeatable. Run after the build.
--postgres DIR   Check PostgreSQL migrations: RLS enabled, forced and with a policy on every
                 table, no BYPASSRLS role, no sequential (serial/identity) keys; repeatable.
--sqlite DIR     Check SQLite migrations for sequential (AUTOINCREMENT) keys; repeatable.
--baseline FILE  JSON {"entries":[{"rule","path","subject","issue","reason"}]} of accepted
                 current violations, each tracked by its own follow-up issue. Entries that
                 no longer match fail, so the baseline only shrinks.

Exits 1 with a corrective message per finding. Never prints a matched secret value.`

// Known key formats. Each name is shown instead of the value.
const keyFormats = [
  ['AWS access key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/],
  ['Stripe live key', /\b[rs]k_live_[A-Za-z0-9]{16,}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Anthropic key', /\bsk-ant-[A-Za-z0-9_-]{32,}\b/],
  ['OpenAI key', /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{40,}\b/],
  ['Private key', /-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED |PGP )?PRIVATE KEY(?: BLOCK)?-----/],
  ['Credential in URL', /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@'"`]+:[^\s:/@'"`$]{8,}@[^\s'"`]+/i],
]
const secretAssignment = /\b([A-Za-z0-9_]*(?:secret|token|password|passwd|api[_-]?key|access[_-]?key|private[_-]?key|client[_-]?secret)[A-Za-z0-9_]*)['"]?\s*[:=]\s*['"`]([^'"`\s]{20,})['"`]/gi
const credentialPair = /\b(user(?:_?name)?|login|password|passw(?:or)?d|pwd)['"]?\s*[:=]\s*['"]?([^'"\s,;}#]+)/gi
const commonCredentials = new Set([
  'admin', 'administrator', 'root', 'toor', 'superuser', 'sa', 'sysadmin', 'password', 'password1', 'passw0rd', 'pass', 'test', 'tester', 'testing', 'test123',
  'guest', 'user', 'demo', 'default', 'changeme', 'letmein', 'welcome', 'secret', 'qwerty', 'abc123', 'admin123', '123456', '1234567', '12345678', '123456789', '111111',
])
const dataFiles = new Set(['.json', '.jsonc', '.yaml', '.yml', '.toml', '.sql', '.env', '.ini', '.conf', '.csv'])
const binary = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.gz', '.woff', '.woff2', '.ttf', '.otf', '.mp4', '.webm', '.wasm', '.jar'])

/** Bits per character; random keys score high, words and placeholders low. */
export const entropy = (text) => {
  const counts = new Map()
  for (const character of text) counts.set(character, (counts.get(character) ?? 0) + 1)
  return [...counts.values()].reduce((sum, count) => sum - (count / text.length) * Math.log2(count / text.length), 0)
}
const placeholder = /^(?:\$\{|<|\{\{|x{6,}|\*{6,}|redacted|example|placeholder|changeme|dummy|fake|test|your[_-])/i

/** Report known key formats and high-entropy values assigned to secret-like names; never return the value. */
export const findSecrets = (text, path) => {
  const findings = []
  text.split('\n').forEach((line, index) => {
    for (const [kind, pattern] of keyFormats) if (pattern.test(line)) findings.push({ rule: 'secret', path, line: index + 1, subject: kind })
    for (const [, key, value] of line.matchAll(secretAssignment)) {
      if (!placeholder.test(value) && entropy(value) >= 3.5 && /\d/.test(value) && /[a-z]/i.test(value)) findings.push({ rule: 'secret', path, line: index + 1, subject: key })
    }
  })
  return findings
}

/** Report default usernames and passwords in seeds, fixtures and configuration data. */
export const findCredentials = (text, path) => {
  const findings = []
  text.split('\n').forEach((line, index) => {
    for (const [, key, value] of line.matchAll(credentialPair)) {
      const lower = value.toLowerCase()
      if (commonCredentials.has(lower) || (lower.includes('@') && commonCredentials.has(lower.split('@')[0]))) findings.push({ rule: 'common-credential', path, line: index + 1, subject: `${key}=${value}` })
    }
  })
  return findings
}

/** Blank SQL comments and string literals, keeping line numbers, so keywords inside them never match. */
export const stripSql = (sql) => sql
  .replace(/--[^\n]*/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
  .replace(/'(?:[^']|'')*'/g, "''")
  .replace(/\$([A-Za-z_]*)\$[\s\S]*?\$\1\$/g, (body) => body.replace(/[^\n]/g, ' '))

const identifier = '(?:"[^"]+"|[A-Za-z_][\\w$]*)(?:\\.(?:"[^"]+"|[A-Za-z_][\\w$]*))?'
const unquote = (name) => name.replaceAll('"', '').toLowerCase().replace(/^public\./, '')
const lineOf = (text, offset) => text.slice(0, offset).split('\n').length

/** Check PostgreSQL migrations, read in order, as one schema: every table needs enabled and forced RLS and a policy. */
export const checkPostgres = (files) => {
  const findings = []
  const tables = new Map()
  const enabled = new Set()
  const forced = new Set()
  const policies = new Set()
  for (const { path, text: raw } of files) {
    const text = stripSql(raw)
    for (const match of text.matchAll(new RegExp(`\\bCREATE\\s+(?:UNLOGGED\\s+)?TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(${identifier})`, 'gi'))) {
      const table = unquote(match[1])
      if (!tables.has(table)) tables.set(table, { path, line: lineOf(text, match.index) })
    }
    for (const match of text.matchAll(new RegExp(`\\bDROP\\s+TABLE\\s+(?:IF\\s+EXISTS\\s+)?(${identifier})`, 'gi'))) tables.delete(unquote(match[1]))
    for (const match of text.matchAll(new RegExp(`\\bALTER\\s+TABLE\\s+(?:ONLY\\s+)?(${identifier})\\s+(ENABLE|FORCE|DISABLE|NO\\s+FORCE)\\s+ROW\\s+LEVEL\\s+SECURITY`, 'gi'))) {
      const table = unquote(match[1])
      const action = match[2].toUpperCase().replace(/\s+/g, ' ')
      if (action === 'ENABLE') enabled.add(table)
      else if (action === 'FORCE') forced.add(table)
      else if (action === 'DISABLE') enabled.delete(table)
      else forced.delete(table)
    }
    for (const match of text.matchAll(new RegExp(`\\bCREATE\\s+POLICY\\s+${identifier}\\s+ON\\s+(${identifier})`, 'gi'))) policies.add(unquote(match[1]))
    for (const match of text.matchAll(/(?<!\bNO)\bBYPASSRLS\b/gi)) findings.push({ rule: 'bypassrls', path, line: lineOf(text, match.index), subject: 'BYPASSRLS' })
    findings.push(...sequential(text, path))
  }
  for (const [table, { path, line }] of tables) {
    if (!enabled.has(table)) findings.push({ rule: 'rls-enable', path, line, subject: table })
    if (!forced.has(table)) findings.push({ rule: 'rls-force', path, line, subject: table })
    if (!policies.has(table)) findings.push({ rule: 'rls-policy', path, line, subject: table })
  }
  return findings
}

/** Report serial, identity and autoincrement columns, which make neighbouring IDs guessable. */
export const sequential = (text, path) => [...stripSql(text).matchAll(/\b(SMALLSERIAL|BIGSERIAL|SERIAL[248]?|GENERATED\s+(?:ALWAYS|BY\s+DEFAULT)\s+AS\s+IDENTITY|AUTO_?INCREMENT)\b/gi)]
  .map((match) => ({ rule: 'sequential-id', path, line: lineOf(text, match.index), subject: match[1].toUpperCase().replace(/\s+/g, ' ') }))

const fixes = {
  'secret': 'A secret is committed. Revoke and rotate it now, remove it from the file, and load it on the server from the secret store or injected environment. Never commit or bundle credentials.',
  'bundle-secret': 'A secret reached the built client bundle. Revoke and rotate it, then keep it on the server and expose only a server endpoint that uses it.',
  'common-credential': 'A common default credential is committed. Use the unique fixed test identifier and seed it only in local and test environments.',
  'rls-enable': 'Add ALTER TABLE <table> ENABLE ROW LEVEL SECURITY in a forward migration.',
  'rls-force': 'Add ALTER TABLE <table> FORCE ROW LEVEL SECURITY so the table owner is also bound by policies.',
  'rls-policy': 'Add at least one CREATE POLICY ... ON <table> that admits only the current tenant and principal.',
  'bypassrls': 'The application role must not bypass row-level security. Create it with NOBYPASSRLS.',
  'sequential-id': 'Sequential keys make neighbouring IDs guessable. Use a random UUID (application UUIDv7 or gen_random_uuid()) for anything that can appear in a route or public API.',
}

/** Recursively list regular files below a directory, as repository-relative paths. */
const walk = (root, directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const path = join(directory, entry.name)
  return entry.isDirectory() ? walk(root, path) : entry.isFile() ? [relative(root, path).split(sep).join('/')] : []
})
const read = (root, path) => binary.has(extname(path).toLowerCase()) || statSync(join(root, path)).size > 5_000_000 ? undefined : readFileSync(join(root, path), 'utf8')
const isData = (path) => dataFiles.has(extname(path).toLowerCase()) || /(?:^|\/)\.env(?:\.|$)/.test(path)

/** Run the selected checks and return findings plus stale baseline entries. */
export const scan = ({ root = process.cwd(), tracked = false, exclude = [], bundles = [], postgres = [], sqlite = [], baseline } = {}) => {
  const findings = []
  if (tracked) {
    const paths = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: Infinity }).split('\0').filter((path) => path && !exclude.some((prefix) => path.startsWith(prefix)) && existsSync(join(root, path)) && statSync(join(root, path)).isFile())
    for (const path of paths) {
      const text = read(root, path)
      if (text === undefined) continue
      findings.push(...findSecrets(text, path))
      if (isData(path)) findings.push(...findCredentials(text, path))
    }
  }
  for (const bundle of bundles) for (const path of walk(root, join(root, bundle))) {
    const text = read(root, path)
    if (text !== undefined) findings.push(...findSecrets(text, path).map((finding) => ({ ...finding, rule: 'bundle-secret' })))
  }
  const sqlFiles = (directory) => walk(root, join(root, directory)).filter((path) => path.endsWith('.sql')).sort().map((path) => ({ path, text: readFileSync(join(root, path), 'utf8') }))
  for (const directory of postgres) findings.push(...checkPostgres(sqlFiles(directory)))
  for (const directory of sqlite) for (const { path, text } of sqlFiles(directory)) findings.push(...sequential(text, path))
  const entries = baseline?.entries ?? []
  for (const entry of entries) if (!/^(?:[A-Z][A-Z0-9]*-\d+|[\w.-]+\/[\w.-]+#\d+)$/.test(entry.issue ?? '') || !entry.reason) throw new Error(`Baseline entry ${entry.rule} ${entry.path} ${entry.subject} needs its own follow-up issue and a reason`)
  const key = (item) => `${item.rule}\0${item.path}\0${item.subject}`
  const accepted = new Set(entries.map(key))
  const seen = new Set(findings.map(key))
  return { findings: findings.filter((finding) => !accepted.has(key(finding))), stale: entries.filter((entry) => !seen.has(key(entry))) }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { values } = parseArgs({ options: {
    tracked: { type: 'boolean' }, exclude: { type: 'string', multiple: true }, bundle: { type: 'string', multiple: true }, postgres: { type: 'string', multiple: true },
    sqlite: { type: 'string', multiple: true }, baseline: { type: 'string' }, help: { type: 'boolean' },
  } })
  if (values.help) { console.log(help); process.exit(0) }
  const baseline = values.baseline ? JSON.parse(readFileSync(values.baseline, 'utf8')) : undefined
  const { findings, stale } = scan({ tracked: values.tracked, exclude: values.exclude, bundles: values.bundle, postgres: values.postgres, sqlite: values.sqlite, baseline })
  for (const finding of findings) console.error(`${finding.path}:${finding.line} [security/${finding.rule}] ${finding.subject}: ${fixes[finding.rule]}`)
  for (const entry of stale) console.error(`${values.baseline} [security/stale-baseline] ${entry.rule} ${entry.path} ${entry.subject} no longer occurs. Delete the entry and close or update ${entry.issue}.`)
  if (findings.length || stale.length) process.exit(1)
  console.log('security scan passed')
}
