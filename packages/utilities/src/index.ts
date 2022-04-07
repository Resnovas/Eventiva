import { LogEntry } from '@google-cloud/logging/build/src/entry'
import { ApiResponse } from '@google-cloud/logging/build/src/log'
import { Primitive } from '@sentry/types'

export * from 'html-entities'
export * from './localize'
export * from './logging'

declare global {
  namespace NodeJS {
    interface Global {
      __rootdir__: string
      logging: any
    }
  }
}

export interface fileDataType {
  enabled: boolean
  config: {
    logDirectory: string
    fileNamePattern: string
    dateFormat?: string
  }
}
export interface consoleData {
  enabled: boolean
}
export interface GCPData {
  enabled: boolean
  projectid: string
  logname: string
}
export interface SentryDataType {
  enabled: boolean
  config: {
    dsn: string
    debug?: boolean
    release?: string
    environment?: string
    serverName?: string
    sampleRate?: number
    maxBreadcrumbs?: number
    attachStacktrace?: boolean
    tracesSampleRate?: number
    normalizeDepth?: number
  }
  extras?: {
    user?: {
      email?: string
    }
    tags?: StringPair
    context?: SentryContext[]
  }
}
export type StringPair = {
  [key: string]: Primitive
}
export type SentryContext = {
  name: string
  data: Record<string, unknown>
}

export type constructPair = {
  data: LoggingDataClass
  level: number
}

export type userData = {
  id?: string
  email?: string
  username?: string
  platform?: string
  arch?: string
  release?: string
}

export enum LoggingLevels {
  unknown = 0, // the log entry has no assigned severity level.
  debug = 100, //  Debug or trace information.
  info = 200, //  Routine information, such as ongoing status or performance.
  notice = 300, //  Normal but significant events, such as start up, shut down, or a configuration change.
  warn = 400, //  Warning events might cause problems.
  error = 500, //  Error events are likely to cause problems.
  critical = 600, //  Critical events cause more severe problems or outages.
  alert = 700, //  A person must take an action immediately.
  emergency = 800 //  One or more systems are unusable.
}

export type T = {
  defaultValue?: string[]
  count?: number
  context?: string
  replace?: any[] | {}
  lng?: string
  lngs?: string[]
  fallbackLng?: string
  ns?: string
  keySeparator?: string
  nsSeparator?: string
  returnObjects?: boolean
  joinArrays?: string
  postProcess?: string | string[]
  interpolation?: interpolation
  skipInterpolation?: boolean
}

export type interpolation = {
  format?: () => string
  formatSeparator?: string
  escape?: (str?: string) => string
  escapeValue?: boolean
  useRawValueToEscape?: boolean
  prefix?: string
  suffix?: string
  prefixEscaped?: string
  suffixEscaped?: string
  unescapeSuffix?: string
  unescapePrefix?: string
  nestingPrefix?: string
  nestingSuffix?: string
  nestingPrefixEscaped?: string
  nestingSuffixEscaped?: string
  nestingOptionsSeparator?: string
  defaultVariables?: any[] | {}
  maxReplaces?: number
  skipOnVariables?: boolean
}

export interface LoggingOptions {
  errors?: Error
  translate?: boolean
  userData?: userData
  T?: T
  metadata?: LogEntry
  decode?: boolean
  tags?: StringPair
  context?: SentryContext[]
}

export class LoggingDataClass extends Error {
  errors?: Error
  translate?: boolean
  userData?: userData
  T?: T
  metadata?: LogEntry
  decode?: boolean
  tags?: StringPair
  context?: SentryContext[]
  constructor(name: LoggingLevels, message?: string, options?: LoggingOptions) {
    super(message)
    this.name = name.toString()
    this.errors = options?.errors
    this.translate = options?.translate
    this.userData = options?.userData
    this.T = options?.T
    this.metadata = options?.metadata
    this.decode = options?.decode
    this.tags = options?.tags
    this.context = options?.context

    // restore prototype chain
    // @ts-ignore
    const actualProto = new.target.prototype
    if (actualProto) Object.setPrototypeOf(this, actualProto)
  }
}
export interface ConstructData {
  gcp?: GCPData
  sentry?: SentryDataType
  file?: fileDataType
  console?: consoleData
  logLevel?: LoggingLevels
}

export interface LogReturn {
  sentry?: LogReturned
  file?: LogReturned
  console?: LogReturned
  gcp?: LogReturned
}

export interface LogReturned {
  logged: boolean
  success?: boolean
  eventID?: string
  response?: ApiResponse
}
