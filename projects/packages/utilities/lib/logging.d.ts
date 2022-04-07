import { Log } from '@google-cloud/logging'
import * as Sentry from '@sentry/node'
import chalk from 'chalk'
import {
  ConstructData,
  fileDataType,
  GCPData,
  LoggingDataClass,
  LoggingLevels,
  LogReturn,
  LogReturned,
  SentryDataType
} from '.'
import { i18, Localizer } from './localize'
/**
 * Configures Chalk
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
export declare const style: {
  brand: {
    videndumPurple: chalk.Chalk
  }
}
declare type logLevels = {
  name: logTypes
  chalk: chalk.Chalk
}[]
declare type logTypes =
  | 'DEFAULT'
  | 'DEBUG'
  | 'INFO'
  | 'NOTICE'
  | 'WARN'
  | 'ERROR'
  | 'CRITICAL'
  | 'ALERT'
  | 'EMERGENCY'
/**
 * Main class used for package
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
export declare class Logger {
  private gcp
  protected constructData: ConstructData | undefined
  loglevel: number
  readonly sentry: typeof Sentry
  readonly loglevels: logLevels
  private constructorLogs
  gcpLogger: Log | undefined
  configured: boolean
  i18: Localizer
  constructor(options: { i18?: i18; logger: ConstructData })
  main(options: { i18?: i18; logger: ConstructData }): Promise<void>
  configureLogger(constructData: ConstructData): Promise<void>
  configureGCP(gcpData: GCPData): Promise<void>
  configureSentry(SentryData: SentryDataType): Promise<void>
  configureSentryScope(): Promise<void>
  /**
   * Sets up local logging to file
   * @author TGTGamer
   * @since 1.0.0-alpha
   */
  configureFile(fileData: fileDataType): Promise<void>
  /**
   * Change the logging level.
   * @param {number | string} level - Logging level to use.
   */
  setloglevel(level: LoggingLevels): Promise<void>
  /**
   * Log your information or error to all platforms
   * @param  {loggingData} loggingData
   * @param  {number | string} type Optional types. Accepts both Numbers & String values. 1=debug, 2=info, 3=notice, 4=warn, 5=error, 6=critical, 7=alert, 8=emergency
   * @example
   * try {
   *  core.user.getUserID(core.license.license_holder_email)
   *  } catch(response){
   *    core.log(response, 1)
   *  }
   * @return logs data to console, sentry and log file as appropriate
   */
  log(loggingData: LoggingDataClass): Promise<LogReturn>
  loggcp(loggingData: LoggingDataClass): Promise<LogReturned>
  logfile(loggingData: LoggingDataClass, type: number): Promise<LogReturned>
  logsentry(loggingData: LoggingDataClass, type: number): Promise<LogReturned>
  logconsole(loggingData: LoggingDataClass, type: number): Promise<LogReturned>
  translate(name: string): Promise<string>
  /**
   * Used to shutdown logging - to ensure that all logs are processed
   * @author TGTGamer
   * @since 1.0.0-alpha
   */
  shutdown(): Promise<void>
}
export {}
