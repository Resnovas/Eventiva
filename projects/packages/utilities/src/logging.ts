import { Log, Logging } from '@google-cloud/logging'
import * as Sentry from '@sentry/node'
import chalk from 'chalk'
import * as fs from 'fs'
import { decode } from 'html-entities'
import os from 'os'
import {
  ConstructData,
  constructPair,
  fileDataType,
  GCPData,
  LoggingDataClass,
  LoggingLevels,
  LogReturn,
  LogReturned,
  SentryDataType
} from '.'
import { i18, Localizer } from './localize'

global.__rootdir__ = __dirname || process.cwd()

/**
 * Configures Chalk
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
export const style = {
  brand: {
    videndumPurple: chalk.hex('4B428E')
  }
}
type logLevels = {
  name: logTypes
  chalk: chalk.Chalk
}[]
type logTypes =
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
export class Logger {
  private gcp: Logging = new Logging()
  protected constructData: ConstructData | undefined
  public loglevel: number = 1
  public readonly sentry = Sentry
  public readonly loglevels: logLevels = [
    {
      name: 'DEFAULT',
      chalk: chalk.inverse
    },
    {
      name: 'DEBUG',
      chalk: chalk.grey
    },
    {
      name: 'INFO',
      chalk: chalk.green
    },
    {
      name: 'NOTICE',
      chalk: chalk.greenBright
    },
    {
      name: 'WARN',
      chalk: chalk.white
    },
    {
      name: 'ERROR',
      chalk: chalk.yellow
    },
    {
      name: 'CRITICAL',
      chalk: chalk.yellow
    },
    {
      name: 'ALERT',
      chalk: chalk.red
    },
    {
      name: 'EMERGENCY',
      chalk: chalk.red
    }
  ]
  private constructorLogs: constructPair[] = []
  gcpLogger: Log | undefined
  public configured: boolean = false
  i18: Localizer = new Localizer()

  async init(options: { i18?: i18; logger: ConstructData }) {
    this.constructData = options.logger
    await this.i18.init(options.i18)
    if (options.logger.logLevel) this.setloglevel(options.logger.logLevel)
    else if (process.env.LOGLEVEL) this.loglevel = +process.env.LOGLEVEL
    this.configureLogger(options.logger)
  }

  async configureLogger(constructData: ConstructData) {
    this.constructorLogs.push({
      data: {
        name: '200',
        message: 'utilities:core.init',
        translate: true
      },
      level: 2,
    })
    if (process.env.NPM_PACKAGE_VERSION?.split("-")[1]) this.constructorLogs.push({
      data: {
        name: '200',
        message: 'utilities:core.version_dev',
        translate: true,
        T: {replace: {version: process.env.NPM_PACKAGE_VERSION?.split("-")[1]}}
      },
      level: 2,
    })
    this.constructorLogs.push({
      data: {
        name: '200',
        message: 'utilities:core.developer',
        translate: true,
        T: { replace: { developer: constructData.developer || "Resnovas" } }
      },
      level: 2,
    })
    if (constructData.gcp?.enabled) await this.configureGCP(constructData.gcp)
    if (constructData.sentry?.enabled)
      await this.configureSentry(constructData.sentry)
    if (constructData.file?.enabled)
      await this.configureFile(constructData.file)
    this.constructorLogs.forEach(log => {
      this.log(log.data)
    })
    this.configured = true
  }

  async configureGCP(gcpData: GCPData) {
    this.constructorLogs.push({
      data: {
        name: '200',
        message: 'utilities:logging.gcp.constructor',
        translate: true
      },
      level: 1
    })
    this.gcp = new Logging({ projectId: gcpData.projectid })
    this.gcpLogger = this.gcp.log(gcpData.logname)
  }

  async configureSentry(SentryData: SentryDataType) {
    this.constructorLogs.push({
      data: {
        name: '200',
        message: 'utilities:logging.sentry.constructor',
        translate: true
      },
      level: 1
    })
    try {
      this.sentry.init({
        ...SentryData.config,
        integrations: [
          new Sentry.Integrations.Console(),
          new Sentry.Integrations.Modules(),
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.OnUncaughtException(),
          new Sentry.Integrations.OnUnhandledRejection({ mode: 'warn' }),
          new Sentry.Integrations.FunctionToString()
        ],
        tracesSampleRate: 0.2
      })
      await this.configureSentryScope()
    } catch (_) {
      this.constructorLogs.push({
        data: {
          name: '200',
          message: 'utilities:logging.sentry.error',
          errors: _ as Error,
          translate: true
        },
        level: 6
      })
    }
  }

  async configureSentryScope() {
    this.sentry.configureScope(scope => {
      scope.clear()
      if (this.constructData?.sentry?.extras?.user)
        scope.setUser(this.constructData?.sentry?.extras.user)
      if (this.constructData?.sentry?.extras?.tags)
        scope.setTags(this.constructData?.sentry?.extras.tags)
      if (this.constructData?.sentry?.extras?.context)
        this.constructData?.sentry?.extras.context.forEach(context => {
          scope.setContext(context.name, context.data)
        })
    })
  }

  /**
   * Sets up local logging to file
   * @author TGTGamer
   * @since 1.0.0-alpha
   */
  async configureFile(fileData: fileDataType) {
    this.constructorLogs.push({
      data: {
        name: '200',
        message: 'utilities:logging.file.constructor',
        translate: true
      },
      level: 1
    })
    fs.access(fileData.config.logDirectory, fs.constants.F_OK, (err: any) => {
      if (!err) {
        return
      } else {
        this.constructorLogs.push({
          data: {
            name: '200',
            message: 'utilities:errors.fileDirectory.caught',
            errors: err,
            translate: true
          },
          level: 6
        })
        fs.mkdir(
          fileData.config.logDirectory,
          { recursive: false },
          async (err2: any) => {
            if (err2)
              this.constructorLogs.push({
                data: {
                  name: '200',
                  message: 'utilities:errors.fileDirectory.thrown',
                  errors: err2,
                  translate: true
                },
                level: 6
              })
            else
              this.constructorLogs.push({
                data: {
                  name: '200',
                  message: 'utilities:errors.fileDirectory.solved',
                  errors: err2,
                  translate: true
                },
                level: 3
              })
          }
        )
      }
    })
  }

  /**
   * Change the logging level.
   * @param {number | string} level - Logging level to use.
   */
  async setloglevel(level: LoggingLevels) {
    this.loglevel = Number(level) / 100
  }

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
  async log(loggingData: LoggingDataClass): Promise<LogReturn> {
    if (this.constructData == undefined)
      throw new Error('Logging Utility hasnt initialised')
    if (loggingData.translate)
      loggingData.message = this.i18.t(loggingData.message, loggingData.T)
    if (loggingData.decode) loggingData.message = decode(loggingData.message)
    if (loggingData.errors) {
      if (!Array.isArray(loggingData.errors))
        loggingData.message = loggingData.message + ' ' + loggingData.errors
      else {
        loggingData.errors.forEach(
          error => (loggingData.message = loggingData.message + ' ' + error)
        )
      }
    }
    if (!loggingData.userData) {
      loggingData.userData = {
        username: os.userInfo().username
      }
      loggingData.userData.platform = os.platform()
      loggingData.userData.arch = os.arch()
      loggingData.userData.release = os.release()
    }
    let result: LogReturn = {}
    // Defines log type
    let type = Number(loggingData.name) / 100
    result.gcp = await this.loggcp(loggingData)
    // Translate the metadata
    loggingData.name = this.loglevels[type].name.toLowerCase()
    loggingData.name = await this.translate(
      `utilities:logging.${loggingData.name}`
    )
    if (loggingData.name) loggingData.name = loggingData.name.toUpperCase()
    result.console = await this.logconsole(loggingData, type)
    result.file = await this.logfile(loggingData, type)
    result.sentry = await this.logsentry(loggingData, type)
    return result
  }
  async loggcp(loggingData: LoggingDataClass): Promise<LogReturned> {
    // log to cloud logger
    if (this.constructData?.gcp?.enabled) {
      try {
        if (!this.gcpLogger)
          return {
            logged: false
          }
        if (!loggingData.metadata)
          loggingData.metadata = {
            resource: {
              type: 'global'
            },
            severity: Number(loggingData.name)
          }
        let entry = this.gcpLogger.entry(
          loggingData.metadata,
          loggingData.message
        )
        const logged = await this.gcpLogger.write(entry)
        return {
          logged: true,
          success: true,
          response: logged
        }
      } catch (err) {
        console.log(err)
        this.constructData.gcp.enabled = false
        return {
          logged: true,
          success: false
        }
      }
    }
    return {
      logged: false
    }
  }

  async logfile(
    loggingData: LoggingDataClass,
    type: number
  ): Promise<LogReturned> {
    if (type >= this.loglevel || process.env.DEBUG == 'true') {
      // Log to local logger
      if (this.constructData?.file?.enabled) {
        try {
          fs.appendFile(
            `${this.constructData.file?.config.logDirectory}/${this.constructData.file?.config.fileNamePattern}`,
            `[${loggingData.name}]  ` + loggingData.message + '\r\n',
            err => {
              if (err) throw err
            }
          )
          return {
            logged: true,
            success: true
          }
        } catch (_) {
          console.log(_)
          this.constructData.file.enabled = false
          return {
            logged: true,
            success: false
          }
        }
      }
    }
    return {
      logged: false
    }
  }
  async logsentry(
    loggingData: LoggingDataClass,
    type: number
  ): Promise<LogReturned> {
    // Log to sentry
    if (type > 4 && this.constructData?.sentry?.enabled) {
      try {
        const data = loggingData
        data.name = loggingData.message
        this.sentry.configureScope(scope => {
          scope.setUser({
            username: loggingData.userData?.username,
            email: loggingData.userData?.email
          })
          scope.setContext('device', {
            Platform: loggingData.userData?.platform,
            Arch: loggingData.userData?.arch,
            Release: loggingData.userData?.release
          })
          scope.setTag('Platform', loggingData.userData?.platform)
          scope.setTag('Arch', loggingData.userData?.arch)
          if (loggingData.tags) scope.setTags(loggingData.tags)
          if (loggingData.context)
            loggingData.context.forEach(context =>
              scope.setContext(context.name, context.data)
            )
          if (type == 5) scope.setLevel(this.sentry.Severity.Error)
          else if (type == 6) scope.setLevel(this.sentry.Severity.Critical)
          else if (type >= 7) scope.setLevel(this.sentry.Severity.Fatal)
        })
        const returning: LogReturned = {
          logged: true,
          success: true,
          eventID: this.sentry.captureException(data)
        }
        await this.configureSentryScope()
        return returning
      } catch (_) {
        this.log(
          new LoggingDataClass(LoggingLevels.error, 'Failed to log to sentry', {
            errors: _ as Error
          })
        )
        this.constructData.sentry.enabled = false
        return {
          logged: true,
          success: false
        }
      }
    }
    return {
      logged: false
    }
  }

  async logconsole(
    loggingData: LoggingDataClass,
    type: number
  ): Promise<LogReturned> {
    if (this.constructData?.console?.enabled) {
      loggingData.name = this.loglevels[type].chalk(loggingData.name)
      // if (!!this.constructData?.console?.enabled)
      console.log(`[${loggingData.name}]  ` + loggingData.message)
      return {
        logged: true,
        success: true
      }
    } else
      return {
        logged: false
      }
  }

  async translate(name: string): Promise<string> {
    return this.i18.t(name)
  }

  /**
   * Used to shutdown logging - to ensure that all logs are processed
   * @author TGTGamer
   * @since 1.0.0-alpha
   */
  async shutdown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sentry
        .close(2000)
        .then(async () => {
          await this.log(
            new Error('Logger successfully shutdown - safe to end all process')
          )
          resolve()
        })
        .catch(_ => reject(_))
    })
  }
}
