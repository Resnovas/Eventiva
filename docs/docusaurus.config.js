// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const path = require('path');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Eventiva',
  tagline: 'Modern Affordable Event Production Utilities',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  presets: [
    [
      'redocusaurus',
      {
        specs: [
          {
            spec: '../openapi.json',
          },
        ],
      },
    ],
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          remarkPlugins: [require('mdx-mermaid')],
          path: 'docs/operating',
          sidebarPath: require.resolve('./sidebars.js'),

          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    "posthog-docusaurus",
    'docusaurus-plugin-moesif',
    // 'docusaurus-plugin-relative-paths',
    'docusaurus-plugin-react-native-web',
    // [
    //   'docusaurus-plugin-module-alias',
    //   {
    //       alias: {
    //           '@local/component': path.resolve(__dirname, '../src/index.js'),
    //       },
    //   },
    // ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'api',
        path: 'docs/api',
        routeBasePath: 'api',
        sidebarPath: require.resolve('./sidebarsFunctions.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'typescript',
        path: 'docs/typescript',
        routeBasePath: 'typescript',
        sidebarPath: require.resolve('./sidebarsTypescript.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'native',
        path: 'docs/native',
        routeBasePath: 'native',
        sidebarPath: require.resolve('./sidebarsNative.js'),
      },
    ],
    [
      'docusaurus2-dotenv',
      {
          path: "./.env", // The path to your environment variables.
          safe: false, // If false ignore safe-mode, if true load './.env.example', if a string load that file as the sample
          systemvars: false, // Set to true if you would rather load all system variables as well (useful for CI purposes)
          silent: false, //  If true, all warnings will be suppressed
          expand: false, // Allows your variables to be "expanded" for reusability within your .env file
          defaults: false, //  Adds support for dotenv-defaults. If set to true, uses ./.env.defaults
      }
    ],
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
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

  themes: [
    '@saucelabs/theme-github-codeblock'
  ],
  
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      posthog: {
        apiKey: "YOURAPIKEY",
        appUrl: "https://app.posthog.com",  // optional
        enableInDevelopment: false,  // optional
        // other options are passed to posthog-js init as is
      },
      moesif: {
        applicationId: 'Your Moesif Application Id',
        // Add other Moesif options here.
      },
      navbar: {
        title: 'Eventiva',
        logo: {
          alt: 'Eventiva Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Tutorial',
            // docsPluginId: 'android'
          },
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Applications',
            docsPluginId: 'native'
          },
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Packages',
            docsPluginId: 'typescript'
          },
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'API',
            docsPluginId: 'api'
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/facebook/docusaurus',
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
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Videndum Studios Ltd operating as Eventiva.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
