'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.LoggingDataClass = exports.LoggingLevels = void 0
const tslib_1 = require('tslib')
tslib_1.__exportStar(require('html-entities'), exports)
tslib_1.__exportStar(require('./localize'), exports)
tslib_1.__exportStar(require('./logging'), exports)
var LoggingLevels
;(function (LoggingLevels) {
  LoggingLevels[(LoggingLevels['unknown'] = 0)] = 'unknown'
  LoggingLevels[(LoggingLevels['debug'] = 100)] = 'debug'
  LoggingLevels[(LoggingLevels['info'] = 200)] = 'info'
  LoggingLevels[(LoggingLevels['notice'] = 300)] = 'notice'
  LoggingLevels[(LoggingLevels['warn'] = 400)] = 'warn'
  LoggingLevels[(LoggingLevels['error'] = 500)] = 'error'
  LoggingLevels[(LoggingLevels['critical'] = 600)] = 'critical'
  LoggingLevels[(LoggingLevels['alert'] = 700)] = 'alert'
  LoggingLevels[(LoggingLevels['emergency'] = 800)] = 'emergency' //  One or more systems are unusable.
})((LoggingLevels = exports.LoggingLevels || (exports.LoggingLevels = {})))
class LoggingDataClass extends Error {
  constructor(name, message, options) {
    super(message)
    this.name = name.toString()
    this.errors =
      options === null || options === void 0 ? void 0 : options.errors
    this.translate =
      options === null || options === void 0 ? void 0 : options.translate
    this.userData =
      options === null || options === void 0 ? void 0 : options.userData
    this.T = options === null || options === void 0 ? void 0 : options.T
    this.metadata =
      options === null || options === void 0 ? void 0 : options.metadata
    this.decode =
      options === null || options === void 0 ? void 0 : options.decode
    this.tags = options === null || options === void 0 ? void 0 : options.tags
    this.context =
      options === null || options === void 0 ? void 0 : options.context
    // restore prototype chain
    // @ts-ignore
    const actualProto = new.target.prototype
    if (actualProto) Object.setPrototypeOf(this, actualProto)
  }
}
exports.LoggingDataClass = LoggingDataClass
//# sourceMappingURL=index.js.map
