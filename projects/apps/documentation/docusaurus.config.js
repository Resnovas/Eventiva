/**
 * File: docusaurus.config.js
 * Project: @eventiva/documentation
 * Created Date: Monday, January 24th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Fri Feb 25 2022
 * Modified By: Jonathan Stevens
 * -----
 * Copyright (c) 2022 Resnovas
 * -----
 * LICENSE: GNU General Public License v3.0 or later
 *
 * This program has been provided under confidence of the author and is licensed
 * under the terms of the GNU General Public License v3.0 or later as published as
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License v3.0 or later for more details.
 *
 * You should have received a copy of the GNU General Public License v3.0 or later
 * along with this program. If not, see http://www.gnu.org/licenses/gpl-3.0-standalone.html
 * -----
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const path = require('path');
const fs = require('fs');

/**
 * 
const TypeDoc = require("typedoc");

async function main() {
    const app = new TypeDoc.Application();

    // If you want TypeDoc to load tsconfig.json / typedoc.json files
    app.options.addReader(new TypeDoc.TSConfigReader());
    app.options.addReader(new TypeDoc.TypeDocReader());

    app.bootstrap({
        // typedoc options here
        entryPoints: ["src/index.ts"],
    });

    const project = app.convert();

    if (project) {
        // Project may not have converted correctly
        const outputDir = "docs";

        // Rendered docs
        await app.generateDocs(project, outputDir);
        // Alternatively generate JSON output
        await app.generateJson(project, outputDir + "/documentation.json");
    }
}

main().catch(console.error)
 * 
 */

const functions = [];

fs.readdirSync(path.join(__dirname, './../../functions')).forEach((folder) => {
  if (
    fs.existsSync(
      path.join(__dirname, './../../functions', folder, 'src/index.ts')
    )
  )
    functions.push(path.join(__dirname, './../../functions', folder));
});
const packages = [];

fs.readdirSync(path.join(__dirname, './../../packages')).forEach((folder) => {
  if (
    fs.existsSync(
      path.join(__dirname, './../../packages', folder, 'src/index.ts')
    )
  )
    packages.push(path.join(__dirname, './../../packages', folder));
});

const companyConfig = {
  organizationName: 'Resnovas',
  tagline: 'Modern Affordable Event Production Utilities',
  projectName: 'eventiva',
  favicon: 'img/favicon.ico',
  logo: 'img/logo.svg',
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: companyConfig.projectName,
  tagline: companyConfig.tagline,
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: companyConfig.favicon,
  organizationName: companyConfig.organizationName, // Usually your GitHub org/user name.
  projectName: companyConfig.projectName, // Usually your repo name.
  trailingSlash: false,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'es'],
  },

  presets: [
    [
      'redocusaurus',
      {
        specs: [
          {
            id: 'using-spec-url',
            specUrl: 'https://redocly.github.io/redoc/openapi.yaml',
            routePath: '/examples/using-spec-url/',
          },
          {
            id: 'using-relative-url',
            specUrl: `${process.env.DEPLOY_BASE_URL || '/'}swagger.json`,
            routePath: '/api/',
          },
        ],
        theme: {
          /**
           * Highlight color for docs
           */
          primaryColor: '#1890ff',
          /**
           * Options to pass to redoc
           * @see https://github.com/redocly/redoc#redoc-options-object
           */
          redocOptions: { hideDownloadButton: false, disableSearch: true },
        },
      },
    ],
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          remarkPlugins: [require('mdx-mermaid')],
          path: 'docs/operating',
          id: 'operating',
          editLocalizedFiles: true,
          sidebarPath: require.resolve('./docs/sidebars/default.js'),

          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/videndum/action-masterminds/edit/develop/docs/blog/',
          editLocalizedFiles: true,
          path: 'docs/blog',
        },
        theme: {
          customCss: require.resolve('./docs/src/css/custom.css'),
        },
        pages: {
          path: 'docs/src/pages',
        },
      }),
    ],
  ],

  plugins: [
    // "posthog-docusaurus",
    'docusaurus-plugin-moesif',
    // 'docusaurus-plugin-relative-paths',
    // 'docusaurus-plugin-react-native-web',
    // [
    //   'docusaurus-plugin-module-alias',
    //   {
    //       alias: {
    //           '@local/component': path.resolve(__dirname, '../src/index.js'),
    //       },
    //   },
    // ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'functions',
        out: 'developer/functions',
        entryPoints: functions,
        entryPointStrategy: 'packages',
        excludePrivate: false,
        exclude: ['**/node_modules/**', '**/__tests__/**'],
        sidebar: {
          fullNames: true,
        },
        readme: 'none',
        plugin: [], //"typedoc-plugin-merge-modules"
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'functions',
        path: 'docs/developer/functions',
        routeBasePath: 'developer/functions',
        editLocalizedFiles: true,
        sidebarPath: require.resolve('./docs/sidebars/functions.js'),
        includeCurrentVersion: true,
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'packages',
        out: 'developer/packages',
        entryPoints: packages,
        entryPointStrategy: 'packages',
        excludePrivate: false,
        exclude: ['**/node_modules/**', '**/__tests__/**'],
        sidebar: {
          fullNames: true,
        },
        readme: 'none',
        plugin: [],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'packages',
        path: 'docs/developer/packages',
        routeBasePath: 'developer/packages',
        editLocalizedFiles: true,
        sidebarPath: require.resolve('./docs/sidebars/packages.js'),
        includeCurrentVersion: true,
      },
    ],
    // [
    //   'docusaurus2-dotenv',
    //   {
    //       path: "./.env", // The path to your environment variables.
    //       safe: false, // If false ignore safe-mode, if true load './.env.example', if a string load that file as the sample
    //       systemvars: false, // Set to true if you would rather load all system variables as well (useful for CI purposes)
    //       silent: false, //  If true, all warnings will be suppressed
    //       expand: false, // Allows your variables to be "expanded" for reusability within your .env file
    //       defaults: false, //  Adds support for dotenv-defaults. If set to true, uses ./.env.defaults
    //   }
    // ],
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        // ... Your options.
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,
        // For Docs using Chinese, The `language` is recommended to set to:
        // ```
        // language: ["en", "zh"],
        // ```
        // When applying `zh` in language, please install `nodejieba` in your project.
      },
    ],
  ],

  // themes: [
  // '@saucelabs/theme-github-codeblock',
  // 'docusaurus-theme-redoc'
  // ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      liveCodeBlock: {
        playgroundPosition: 'bottom',
      },
      posthog: {
        apiKey: 'YOURAPIKEY',
        appUrl: 'https://app.posthog.com', // optional
        enableInDevelopment: false, // optional
        // other options are passed to posthog-js init as is
      },
      moesif: {
        applicationId: 'Your Moesif Application Id',
        // Add other Moesif options here.
      },
      navbar: {
        title: companyConfig.projectName,
        logo: {
          alt: companyConfig.projectName,
          src: companyConfig.logo,
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Operating',
            docsPluginId: 'operating',
          },
          {
            type: 'dropdown',
            label: 'Developer',
            position: 'left',
            items: [
              {
                type: 'doc',
                docId: 'index',
                label: 'Functions',
                docsPluginId: 'functions',
              },
              {
                type: 'doc',
                docId: 'index',
                label: 'Packages',
                docsPluginId: 'packages',
              },
            ],
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: `https://github.com/${companyConfig.organizationName}/${companyConfig.projectName}`,
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: `https://github.com/${companyConfig.organizationName}/${companyConfig.projectName}`,
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} ${
          companyConfig.organizationName
        } operating as ${companyConfig.projectName}.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
