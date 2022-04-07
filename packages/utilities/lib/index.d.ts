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
export declare type StringPair = {
  [key: string]: Primitive
}
export declare type SentryContext = {
  name: string
  data: Record<string, unknown>
}
export declare type constructPair = {
  data: LoggingDataClass
  level: number
}
export declare type userData = {
  id?: string
  email?: string
  username?: string
  platform?: string
  arch?: string
  release?: string
}
export declare enum LoggingLevels {
  unknown = 0,
  debug = 100,
  info = 200,
  notice = 300,
  warn = 400,
  error = 500,
  critical = 600,
  alert = 700,
  emergency = 800
}
export declare type T = {
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
export declare type interpolation = {
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
export declare class LoggingDataClass extends Error {
  errors?: Error
  translate?: boolean
  userData?: userData
  T?: T
  metadata?: LogEntry
  decode?: boolean
  tags?: StringPair
  context?: SentryContext[]
  constructor(name: LoggingLevels, message?: string, options?: LoggingOptions)
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
