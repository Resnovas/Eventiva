'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.Localizer = void 0
const tslib_1 = require('tslib')
const fs_1 = tslib_1.__importDefault(require('fs'))
const i18next_1 = tslib_1.__importDefault(require('i18next'))
const path_1 = tslib_1.__importDefault(require('path'))
const intervalPlural = require('i18next-intervalplural-postprocessor')
class Localizer {
  constructor() {
    this.localize = i18next_1.default
    this.t = (input, options) => {
      return this.localize.t(
        [input, 'videndum:errors.unspecific.localize'],
        Object.assign(Object.assign({}, options), {
          replace: Object.assign(
            Object.assign(
              {},
              options === null || options === void 0 ? void 0 : options.replace
            ),
            { what: input }
          )
        })
      )
    }
    this.exists = this.localize.exists
    this.getFixedT = this.localize.getFixedT
    this.changeLanguage = this.localize.changeLanguage
    this.language = this.localize.language
    this.languages = this.localize.languages
    this.loadNamespaces = this.localize.loadNamespaces
    this.loadlanguages = this.localize.loadLanguages
    this.reloadResources = this.localize.reloadResources
    this.setDefaultNamespace = this.localize.setDefaultNamespace
    this.dir = this.localize.dir
    this.format = this.localize.format
  }
  async main(construct) {
    const resources = await this.createResources(
      construct === null || construct === void 0
        ? void 0
        : construct.localesLocation
    )
    this.localize.use(intervalPlural).init({
      lng: 'en',
      resources: resources,
      defaultNS:
        construct === null || construct === void 0
          ? void 0
          : construct.defaultNamespace,
      fallbackLng: {
        'de-CH': ['fr', 'it'],
        'zh-Hant': ['zh-Hans', 'en'],
        es: ['fr'],
        default: ['en']
      },
      supportedLngs: [
        'es',
        'ja',
        'fr',
        'it',
        'en',
        'zh',
        'ko',
        'en-GB',
        'en-US',
        'de-CH',
        'zh-Hant',
        'zh-Hans'
      ],
      returnEmptyString: false,
      returnNull: false,
      initImmediate: false
    })
  }
  async createResources(construct) {
    let resource = {}
    if (typeof construct == 'undefined') construct = {}
    construct['videndum'] = `${__dirname}/../locales`
    for (let namespace in construct) {
      let location = path_1.default.normalize(construct[namespace] + '/')
      const files = fs_1.default.readdirSync(location)
      files.forEach(file => {
        file = file.split('.').shift() || file
        if (!resource[file]) {
          resource[file] = {}
          resource[file][namespace] = require(path_1.default.join(
            location + file
          ))
        } else if (!resource[file][namespace]) {
          resource[file][namespace] = require(path_1.default.join(
            location + file
          ))
        } else {
          resource[file][namespace].concat(
            require(path_1.default.join(location + file))
          )
        }
      })
    }
    return resource
  }
}
exports.Localizer = Localizer
//# sourceMappingURL=localize.js.map
