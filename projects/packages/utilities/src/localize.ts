import fs, { PathLike } from 'fs';
import i18Next, { Resource } from 'i18next';
import path from 'path';
import { T } from '.';
const intervalPlural = require('i18next-intervalplural-postprocessor');
// const ReactPostprocessor = require('i18next-react-postprocessor')
export interface i18 {
  localesLocation?: { [namespace: string]: string };
  defaultNamespace?: string;
}
export class Localizer {
  public readonly localize = i18Next;

  async init(construct?: i18) {
    const resources = await this.createResources(construct?.localesLocation);
    this.localize.use(intervalPlural).init({
      lng: 'en',
      resources: resources,
      defaultNS: construct?.defaultNamespace || 'utilities',
      fallbackLng: {
        'de-CH': ['fr', 'it'],
        'zh-Hant': ['zh-Hans', 'en'],
        es: ['fr'],
        default: ['en'],
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
        'zh-Hans',
      ],
      returnEmptyString: false,
      returnNull: false,
      initImmediate: false,
    });
  }

  async createResources(construct?: i18['localesLocation']): Promise<Resource> {
    let resource: Resource = {};
    if (typeof construct == 'undefined') construct = {};
    construct['utilities'] = `${__dirname}/../locales`;
    for (let namespace in construct) {
      let location: PathLike = path.normalize(construct[namespace] + '/');
      const files = fs.readdirSync(location);
      files.forEach((file) => {
        file = file.split('.').shift() || file;
        let ResourceFile = resource[file];
        if (!ResourceFile) ResourceFile = {};
        ResourceFile[namespace] = require(path.join(location + file));
        let ResourceNamespace = ResourceFile[namespace];
        if (!ResourceNamespace)
          ResourceNamespace = require(path.join(location + file));
        if (ResourceNamespace)
          ResourceNamespace.concat(require(path.join(location + file)));
      });
    }
    return resource;
  }

  t = (input: string, options?: T): string => {
    return this.localize.t([input, 'utilities:errors.unspecific.localize'], {
      ...options,
      replace: {
        ...options?.replace,
        what: input,
      },
    });
  };
  exists = this.localize.exists;
  getFixedT = this.localize.getFixedT;
  changeLanguage = this.localize.changeLanguage;
  language = this.localize.language;
  languages = this.localize.languages;
  loadNamespaces = this.localize.loadNamespaces;
  loadlanguages = this.localize.loadLanguages;
  reloadResources = this.localize.reloadResources;
  setDefaultNamespace = this.localize.setDefaultNamespace;
  dir = this.localize.dir;
  format = this.localize.format;
}
