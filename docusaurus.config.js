// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const path = require('path');
const fs = require('fs');

const functions = []
fs.readdirSync(path.join(__dirname, './src/functions')).forEach(folder => {
    if (fs.existsSync(path.join(__dirname, './src/functions', folder, 'index.ts'))) functions.push(path.join(__dirname, 'src/functions', folder, "index.ts"))
});

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Eventiva',
  tagline: 'Modern Affordable Event Production Utilities',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'Videndum', // Usually your GitHub org/user name.
  projectName: 'eventiva', // Usually your repo name.
  trailingSlash: false,
	i18n: {
		defaultLocale: "en",
		locales: ["en", "fr", "es"]
	},

  presets: [
    [
      'redocusaurus',
      {
        specs: [
          {
            spec: '.schemas/openapi.json',
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
						"https://github.com/videndum/action-masterminds/edit/develop/docs/blog/",
					editLocalizedFiles: true,
          path: "docs/blog"
        },
        theme: {
          customCss: require.resolve('./docs/src/css/custom.css'),
        },
        pages: {
          path: "docs/src/pages"
        }
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
      "docusaurus-plugin-typedoc",
			{
				out: "functions",
				entryPoints: functions,
				tsconfig: ".tsconfig/tsconfig.main.functions.json",
				excludePrivate: true,
				readme: "none"
			}
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'functions',
        path: 'docs/functions',
        routeBasePath: 'functions',
        editLocalizedFiles: true,
        sidebarPath: require.resolve('./docs/sidebars/functions.js'),
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
      liveCodeBlock: {
        playgroundPosition: "bottom"
      },
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
            label: 'Operating',
            docsPluginId: 'operating'
          },
          {
            type: 'doc',
            docId: 'index',
            position: 'left',
            label: 'Functions',
            docsPluginId: 'functions'
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/videndum/eventiva',
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
                href: 'https://github.com/videndum/eventiva',
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
