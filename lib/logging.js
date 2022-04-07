'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.Logger = exports.style = void 0
const tslib_1 = require('tslib')
const logging_1 = require('@google-cloud/logging')
const Sentry = tslib_1.__importStar(require('@sentry/node'))
const chalk_1 = tslib_1.__importDefault(require('chalk'))
const fs = tslib_1.__importStar(require('fs'))
const html_entities_1 = require('html-entities')
const os_1 = tslib_1.__importDefault(require('os'))
const _1 = require('.')
const localize_1 = require('./localize')
global.__rootdir__ = __dirname || process.cwd()
/**
 * Configures Chalk
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
exports.style = {
  brand: {
    videndumPurple: chalk_1.default.hex('4B428E')
  }
}
/**
 * Main class used for package
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
class Logger {
  constructor(options) {
    this.gcp = new logging_1.Logging()
    this.loglevel = 1
    this.sentry = Sentry
    this.loglevels = [
      {
        name: 'DEFAULT',
        chalk: chalk_1.default.inverse
      },
      {
        name: 'DEBUG',
        chalk: chalk_1.default.grey
      },
      {
        name: 'INFO',
        chalk: chalk_1.default.green
      },
      {
        name: 'NOTICE',
        chalk: chalk_1.default.greenBright
      },
      {
        name: 'WARN',
        chalk: chalk_1.default.white
      },
      {
        name: 'ERROR',
        chalk: chalk_1.default.yellow
      },
      {
        name: 'CRITICAL',
        chalk: chalk_1.default.yellow
      },
      {
        name: 'ALERT',
        chalk: chalk_1.default.red
      },
      {
        name: 'EMERGENCY',
        chalk: chalk_1.default.red
      }
    ]
    this.constructorLogs = []
    this.configured = false
    this.i18 = new localize_1.Localizer()
    this.main(options)
  }
  async main(options) {
    this.constructData = options.logger
    await this.i18.main(options.i18)
    if (options.logger.logLevel) this.setloglevel(options.logger.logLevel)
    else if (process.env.LOGLEVEL) this.loglevel = +process.env.LOGLEVEL
    this.configureLogger(options.logger)
  }
  async configureLogger(constructData) {
    var _a, _b, _c
    if (
      (_a = constructData.gcp) === null || _a === void 0 ? void 0 : _a.enabled
    )
      await this.configureGCP(constructData.gcp)
    if (
      (_b = constructData.sentry) === null || _b === void 0
        ? void 0
        : _b.enabled
    )
      await this.configureSentry(constructData.sentry)
    if (
      (_c = constructData.file) === null || _c === void 0 ? void 0 : _c.enabled
    )
      await this.configureFile(constructData.file)
    this.constructorLogs.forEach(log => {
      this.log(log.data)
    })
    this.configured = true
  }
  async configureGCP(gcpData) {
    this.constructorLogs.push({
      data: {
        name: '200',
        message: 'videndum:logging.gcp.constructor',
        translate: true
      },
      level: 1
    })
    this.gcp = new logging_1.Logging({ projectId: gcpData.projectid })
    this.gcpLogger = this.gcp.log(gcpData.logname)
  }
  async configureSentry(SentryData) {
    this.constructorLogs.push({
      data: {
        name: '200',
        message: 'videndum:logging.sentry.constructor',
        translate: true
      },
      level: 1
    })
    try {
      this.sentry.init(
        Object.assign(Object.assign({}, SentryData.config), {
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
      )
      await this.configureSentryScope()
    } catch (_) {
      this.constructorLogs.push({
        data: {
          name: '200',
          message: 'videndum:logging.sentry.error',
          errors: _,
          translate: true
        },
        level: 6
      })
    }
  }
  async configureSentryScope() {
    this.sentry.configureScope(scope => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q
      scope.clear()
      if (
        (_c =
          (_b =
            (_a = this.constructData) === null || _a === void 0
              ? void 0
              : _a.sentry) === null || _b === void 0
            ? void 0
            : _b.extras) === null || _c === void 0
          ? void 0
          : _c.user
      )
        scope.setUser(
          (_e =
            (_d = this.constructData) === null || _d === void 0
              ? void 0
              : _d.sentry) === null || _e === void 0
            ? void 0
            : _e.extras.user
        )
      if (
        (_h =
          (_g =
            (_f = this.constructData) === null || _f === void 0
              ? void 0
              : _f.sentry) === null || _g === void 0
            ? void 0
            : _g.extras) === null || _h === void 0
          ? void 0
          : _h.tags
      )
        scope.setTags(
          (_k =
            (_j = this.constructData) === null || _j === void 0
              ? void 0
              : _j.sentry) === null || _k === void 0
            ? void 0
            : _k.extras.tags
        )
      if (
        (_o =
          (_m =
            (_l = this.constructData) === null || _l === void 0
              ? void 0
              : _l.sentry) === null || _m === void 0
            ? void 0
            : _m.extras) === null || _o === void 0
          ? void 0
          : _o.context
      )
        (_q =
          (_p = this.constructData) === null || _p === void 0
            ? void 0
            : _p.sentry) === null || _q === void 0
          ? void 0
          : _q.extras.context.forEach(context => {
              scope.setContext(context.name, context.data)
            })
    })
  }
  /**
   * Sets up local logging to file
   * @author TGTGamer
   * @since 1.0.0-alpha
   */
  async configureFile(fileData) {
    this.constructorLogs.push({
      data: {
        name: '200',
        message: 'videndum:logging.file.constructor',
        translate: true
      },
      level: 1
    })
    fs.access(fileData.config.logDirectory, fs.constants.F_OK, err => {
      if (!err) {
        return
      } else {
        this.constructorLogs.push({
          data: {
            name: '200',
            message: 'videndum:errors.fileDirectory.caught',
            errors: err,
            translate: true
          },
          level: 6
        })
        fs.mkdir(
          fileData.config.logDirectory,
          { recursive: false },
          async err2 => {
            if (err2)
              this.constructorLogs.push({
                data: {
                  name: '200',
                  message: 'videndum:errors.fileDirectory.thrown',
                  errors: err2,
                  translate: true
                },
                level: 6
              })
            else
              this.constructorLogs.push({
                data: {
                  name: '200',
                  message: 'videndum:errors.fileDirectory.solved',
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
  async setloglevel(level) {
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
  async log(loggingData) {
    if (this.constructData == undefined)
      throw new Error('Logging Utility hasnt initialised')
    if (loggingData.translate)
      loggingData.message = this.i18.t(loggingData.message, loggingData.T)
    if (loggingData.decode)
      loggingData.message = html_entities_1.decode(loggingData.message)
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
        username: os_1.default.userInfo().username
      }
      loggingData.userData.platform = os_1.default.platform()
      loggingData.userData.arch = os_1.default.arch()
      loggingData.userData.release = os_1.default.release()
    }
    let result = {}
    // Defines log type
    let type = Number(loggingData.name) / 100
    result.gcp = await this.loggcp(loggingData)
    // Translate the metadata
    loggingData.name = this.loglevels[type].name.toLowerCase()
    loggingData.name = await this.translate(
      `videndum:logging.${loggingData.name}`
    )
    if (loggingData.name) loggingData.name = loggingData.name.toUpperCase()
    result.console = await this.logconsole(loggingData, type)
    result.file = await this.logfile(loggingData, type)
    result.sentry = await this.logsentry(loggingData, type)
    return result
  }
  async loggcp(loggingData) {
    var _a, _b
    // log to cloud logger
    if (
      (_b =
        (_a = this.constructData) === null || _a === void 0
          ? void 0
          : _a.gcp) === null || _b === void 0
        ? void 0
        : _b.enabled
    ) {
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
  async logfile(loggingData, type) {
    var _a, _b, _c, _d
    if (type >= this.loglevel || process.env.DEBUG == 'true') {
      // Log to local logger
      if (
        (_b =
          (_a = this.constructData) === null || _a === void 0
            ? void 0
            : _a.file) === null || _b === void 0
          ? void 0
          : _b.enabled
      ) {
        try {
          fs.appendFile(
            `${
              (_c = this.constructData.file) === null || _c === void 0
                ? void 0
                : _c.config.logDirectory
            }/${
              (_d = this.constructData.file) === null || _d === void 0
                ? void 0
                : _d.config.fileNamePattern
            }`,
            `[${loggingData.name}]  ` + loggingData.message + '\r\n',
            err => {
              if (err) throw err
            }
          )
          return {
            logged: true,
            success: true
          }
        } catch (err) {
          this.log(err)
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
  async logsentry(loggingData, type) {
    var _a, _b
    // Log to sentry
    if (
      type > 4 &&
      ((_b =
        (_a = this.constructData) === null || _a === void 0
          ? void 0
          : _a.sentry) === null || _b === void 0
        ? void 0
        : _b.enabled)
    ) {
      try {
        const data = loggingData
        data.name = loggingData.message
        this.sentry.configureScope(scope => {
          var _a, _b, _c, _d, _e, _f, _g
          scope.setUser({
            username:
              (_a = loggingData.userData) === null || _a === void 0
                ? void 0
                : _a.username,
            email:
              (_b = loggingData.userData) === null || _b === void 0
                ? void 0
                : _b.email
          })
          scope.setContext('device', {
            Platform:
              (_c = loggingData.userData) === null || _c === void 0
                ? void 0
                : _c.platform,
            Arch:
              (_d = loggingData.userData) === null || _d === void 0
                ? void 0
                : _d.arch,
            Release:
              (_e = loggingData.userData) === null || _e === void 0
                ? void 0
                : _e.release
          })
          scope.setTag(
            'Platform',
            (_f = loggingData.userData) === null || _f === void 0
              ? void 0
              : _f.platform
          )
          scope.setTag(
            'Arch',
            (_g = loggingData.userData) === null || _g === void 0
              ? void 0
              : _g.arch
          )
          if (loggingData.tags) scope.setTags(loggingData.tags)
          if (loggingData.context)
            loggingData.context.forEach(context =>
              scope.setContext(context.name, context.data)
            )
          if (type == 5) scope.setLevel(this.sentry.Severity.Error)
          else if (type == 6) scope.setLevel(this.sentry.Severity.Critical)
          else if (type >= 7) scope.setLevel(this.sentry.Severity.Fatal)
        })
        const returning = {
          logged: true,
          success: true,
          eventID: this.sentry.captureException(data)
        }
        await this.configureSentryScope()
        return returning
      } catch (_) {
        this.log(
          new _1.LoggingDataClass(
            _1.LoggingLevels.error,
            'Failed to log to sentry',
            {
              errors: _
            }
          )
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
  async logconsole(loggingData, type) {
    var _a, _b
    if (
      (_b =
        (_a = this.constructData) === null || _a === void 0
          ? void 0
          : _a.console) === null || _b === void 0
        ? void 0
        : _b.enabled
    ) {
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
  async translate(name) {
    return this.i18.t(name)
  }
  /**
   * Used to shutdown logging - to ensure that all logs are processed
   * @author TGTGamer
   * @since 1.0.0-alpha
   */
  async shutdown() {
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
exports.Logger = Logger
//# sourceMappingURL=logging.js.map
