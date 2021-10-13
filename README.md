# EVENTIVA

## Index

<!-- toc -->

- [Introduction](#introduction)
- [Why do we exist?](#why-do-we-exist)
- [Why open-source?](#why-open-source)
- [Repository Key Components](#repository-key-components)
- [How to get support 👨‍👩‍👧‍👦](#how-to-get-support-%F0%9F%91%A8%E2%80%8D%F0%9F%91%A9%E2%80%8D%F0%9F%91%A7%E2%80%8D%F0%9F%91%A6)
- [Repository Components](#repository-components)
  * [Applications](#applications)
    + [React Native Application](#react-native-application)
  * [Components](#components)
    + [React Component for rendering text](#react-component-for-rendering-text)
  * [SDK's](#sdks)
    + [Typescript SDK](#typescript-sdk)
- [Contributing](#contributing)
  * [Backlog](#backlog)
  * [Running Locally & Developing](#running-locally--developing)
    + [Prerequisities](#prerequisities)
    + [Developing](#developing)
    + [Running locally](#running-locally)
  * [Why the guidelines](#why-the-guidelines)
  * [Contributor License Agreement](#contributor-license-agreement)
  * [Responsibilities](#responsibilities)
  * [External Contributions Workflow](#external-contributions-workflow)
  * [Internal Contributions Workflow](#internal-contributions-workflow)
    + [Branch Names](#branch-names)
  * [Contribution Types](#contribution-types)
    + [Minor Contributions](#minor-contributions)
    + [Standard Contributions](#standard-contributions)
    + [Major Contributions](#major-contributions)
  * [Your First Contribution](#your-first-contribution)
  * [Your first project](#your-first-project)
  * [Creating a merge request](#creating-a-merge-request)
    + [Titling your request](#titling-your-request)
    + [Prefixes](#prefixes)
  * [Security Disclosures](#security-disclosures)
  * [Understanding Labels](#understanding-labels)
  * [Contributor Covenant Code of Conduct](#contributor-covenant-code-of-conduct)
    + [Our Pledge](#our-pledge)
    + [Our Standards](#our-standards)
    + [Our Responsibilities](#our-responsibilities)
    + [Scope](#scope)
    + [Enforcement](#enforcement)
    + [Attribution](#attribution)
  * [Code review process](#code-review-process)
  * [Signing Git with GPG using Keybase](#signing-git-with-gpg-using-keybase)
    + [Prerequisities](#prerequisities-1)
    + [Update the GPG Key](#update-the-gpg-key)
- [Security](#security)
  * [Security Policy](#security-policy)
    + [Supported Versions](#supported-versions)
    + [Reporting a Vulnerability](#reporting-a-vulnerability)

<!-- tocstop -->

## Introduction

Welcome to the Eventiva repository. Eventiva is an open-source platform for Event Planning and Production logistics. We have created a custom-built directory focused on indexing, marketing and connecting event specialist Vendors, Venues and professionals. We then connected this to our innovative tools for event production planning which include scheduling, itinerary, task management, contact management, warehousing ticket sales, interactive site maps, online and in-person sales solutions, accounting, payroll and human resources.

## Why do we exist?

When surveyed, the industry revealed that over fifty-five percent of events did not have a management tool of any form. The remaining forty percent are split across solutions designed and implemented for office environments. Software like Flock and Excel barely cover the toolset which managers require to be effective in the preproduction sections of their work. While fifty-five percent of events did not have management tools, a full eighty percent of individuals surveyed believed that schedulers, task lists and other management tools would be helpful to their ongoing operations.

## Why open-source?

We believe in the power of community development, while our tools are designed and marketted for event planning, they can be utilised by organisations planning all variations of projects, we believe that through keeping our tools open-source we can connect with amazing developers who can contribute in ways we simply cannot fathom. 
## Repository Key Components

- Interface & Application 
    - React Native Components
    - React Native Component Generator
    - React Native Application (Build with expo)
    - [Storybook](https://storybook.js.org/) Intergration
    - [Bit](https://bit.dev/) Intergration
- Networking & Infrastructure
    - Terraform Deployment
    - CI/CD
- SDK's
    - Typescript/Javascript
- Packages
    - Vendasta Typescript SDK

## How to get support 👨‍👩‍👧‍👦

For **Features Requests**, **Q&A**, **Show & Tell** and **Discussions** please use **[our discussion page](https://github.com/Videndum/Eventiva/discussions)** 🚑.

We have a **FAQ** label in our **[issues page](https://github.com/Videndum/Eventiva/issues)** where you can get quick answers, help with debugging weird issues, and general help.

Our extensive **documentation** can be found at **[here](https://github.com/Videndum/Eventiva)**.


## Repository Components

### Applications

#### React Native Application

### Components

#### React Component for rendering text
 

### SDK's

#### Typescript SDK

<!-- Contributing -->
## Contributing

Thank you for taking an interst in contributing. We have created development containers (`.devcontainer`) to allow you to jump straight in with coding. We even went through the hassle of setting up step by step guides using [CodeTour](https://github.com/vsls-contrib/codetour). Everything is configured and ready to go, all you need to do is use one of the supported platforms: [VSCode](https://code.visualstudio.com/docs/remote/containers) | [Github Codespaces](https://github.com/features/codespaces)

This project uses the [Universal GitActions Workflows](https://github.com/Videndum/workflow-mastermind) to automate our workflow, alongside provide templates for issues and pull requests. If you want to learn more about precisely what this workflow accomplishes, please check out the documentation [here](https://github.com/Videndum/workflow-mastermind).

For more information on contributing, please read the [contributing guidelines](docs/contributing/README.md).

### Backlog

Our backlog can be found on either our [Github Project](https://github.com/tmw-media/GGRadio-Discord/projects/1) or our website [Eventiva Backlog]()

### Running Locally & Developing

Setting up local running is simple, however we **MUST** warn that building / packaging while using local scripts can cause your GITHUB_TOKEN to be included within the package. To avoid this happening. you **MUST** follow the steps correctly. We will not be held responsible for any leeked personal tokens.

#### Prerequisities

1. Setup a secret on your repository named: `ACTIONS_STEP_DEBUG` value: `true`
2. Ensure the action has run once after you created this secret

#### Developing

3. Fork & Clone the [development repository](https://github.com/Videndum/action-masterminds)
4. Continue from step 4 of `Running Locally` then return to step 5 & 6.
5. Make changes, then rebuild using `npm run dev:run` or `yarn dev:run`
6. If uploading changes to Github
   - Delete `./context.json`, `./config`, `./lib`, `./dist`.
   - Run `yarn dev:all`.
   - Commit & push.

#### Running locally

3. Fork & Clone this repository
4. Run `yarn install` or `npm install`
5. From the action logs find `Context for local running` copy the output into a file named `./context.json` at the root of the project.
6. Modify the `./config.sample.json` to contain your `GITHUB_TOKEN` and rename to `./config.json`
7. Run the script using `yarn dev:run` or `npm run dev:run`

<details>
    <summary><b>Guide</b></summary>

- [Why the guidelines](#why-the-guidelines)
- [Contributor License Agreement](#contributor-license-agreement)
- [Responsibilities](#responsibilities)
- [External Contributions Workflow](#external-contributions-workflow)
- [Internal Contributions Workflow](#internal-contributions-workflow)
  - [Branch Names](#branch-names)
- [Contribution Types](#contribution-types)
  - [Minor Contributions](#minor-contributions)
  - [Standard Contributions](#standard-contributions)
  - [Major Contributions](#major-contributions)
- [Your First Contribution](#your-first-contribution)
- [Your first project](#your-first-project)
- [Creating a merge request](#creating-a-merge-request)
  - [Titling your request](#titling-your-request)
  - [Prefixes](#prefixes)
- [Security Disclosures](#security-disclosures)
- [Understanding Labels](#understanding-labels)

### Why the guidelines

Following these guidelines helps to communicate that you respect the time of the developers managing and creating this project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalise your pull requests. We created these guidelines to ensure that everyone has the same information when working on the project.

- Please don't use the issue tracker for support questions.
- Please check whether the FAQ can help with your issue.
- Please check the closed tickets & pull requests before opening a new one.

### Contributor License Agreement

We have a Contributor License Agreement which can be found at [`{root}/docs/getting-started/contributing/agreement.md`](./AGREEMENT.md). It is required for [Standard Contributions](contribution-types.md#std) and [Major Contributions](contribution-types.md#major).

### Responsibilities

- Ensure cross-platform compatibility for every change that's accepted.
- Ensure that code meets all [requirements](contribution-types.md)
- Create issues for any major changes and enhancements that you wish to make. Discuss things transparently and get community feedback.
- Ensure each contribution is created on its own branch to ensure we can follow [Semantic Versioning](http://semver.org/)
- Be welcoming to newcomers and encourage diverse new contributors from all backgrounds

### External Contributions Workflow

For all contributions you are required to do the following

1. Create your own fork of the latest development code
2. Do the changes in your fork
3. If you like the change and think the project could use it:
   - Be sure you have followed the code style for the project.
   - Be sure to have commented the code so others can follow.
   - Be sure to have checked your using the latest API changes within your code.
   - Be sure to have named your pull request according to our documentation.
   - Be sure to have included your information within the Pull Request.
4. Send a Pull Request.
5. Await confirmation & Make any changes that Maintainers request.
6. Get added to the list of contributors.

### Internal Contributions Workflow

For all contributions you are required to do the following

1. Create an issue for the feature / issue / improvement
2. Create your own branch of the latest development code (Normally automatically done by our bot)
3. Do the changes in your branch
4. If you like the change and think the project could use it:
   - Be sure you have followed the code style for the project.
   - Be sure to have commented the code so others can follow.
   - Be sure to have checked your using the latest API changes within your code.
   - Be sure to have named your pull request according to our documentation.
   - Be sure to have included your information within the Pull Request.
5. Send a Pull Request.
6. Await confirmation & Make any changes that Maintainers request.

#### Branch Names

A branch will be created by the automatic system for each issue, if not please follow the branch name configuration defined as follows:

- Chore: chore/
- Enhancement: enhance/
- Feature: feat/
- Documentation: docs/
- Bug: fix/
- Optimisation: opt/
- Deprecated: dep/
- Refactor: ref/
- Style: style/

### Contribution Types

#### Minor Contributions

Small contributions such as fixing spelling errors, where the content is small enough to not be considered intellectual property, can be submitted by a contributor as a minor patch, without a CLA.

As a rule of thumb, changes are obvious fixes if they do not introduce any new functionality or creative thinking. As long as the change does not affect functionality, some likely examples include the following:

- Spelling / grammar fixes
- Typo correction, white space and formatting changes
- Comment clean up
- Bug fixes that change default return values or error codes stored in constants
- Adding logging messages or debugging output
- Changes to �metadata� files like Gemfile, .gitignore, build scripts, etc.
- Moving source files from one directory or package to another

#### Standard Contributions

Standard contributions are contributions which are too large to be considered a minor contribution however, only address one feature or function. This can include, but is not limited to, tutorials, wiki pages, new features (e.g. small integrations) and feature enhancements. Our automation systems will automatically do all the hard work of labeling, assigning and reviewing your contribution.

You our required to sign the CLA and agree to it's terms. This will be automatically handled by our automation when you create a pull request, and once signed you will be able to submit without resigning.

#### Major Contributions

Major contributions are contributions which add, modify or remove multiple features or modules. We can not emphasise enough how much the community helps us every time they submit one of these.

You our required to sign the CLA and agree to it's terms. This will be automatically handled by our automation when you create a pull request, and once signed you will be able to submit without resigning.

### Your First Contribution

Unsure where to begin contributing? You can start by looking through these beginner and help-wanted issues:

- First Timers - issues specific for first time github users, designed and created to guide you through contributing.
- Beginner issues - issues which should only require a few lines of code, and a test or two.
- Help wanted - issues which should be a bit more involved than beginner issues.

### Your first project

Working on your first Pull Request? You can learn how from this _free_ series, [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first!

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge. Note that we do provide an automatic command for this which can be attempted through commenting `/rebase`.

### Creating a merge request

When you believe you have completed your contribution, you will need to make an pull request. This should be simple for most users, and we have provided some templates for you to get started, however if you choose to create your pull request from scratch, please ensure the following steps are followed.

#### Titling your request

We use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format when creating pull requests, this is so we can squash all pull requests when merging and automatically create our changelog and releases. To ensure that this convention is completed, our automation will fail if the title does not follow this standard.

#### Prefixes

If you are still working on your pull request, please ensure that you prefix it with `WIP:` to ensure that the pull isn't accidently merged before it's ready.

### Security Disclosures

In order to determine whether you are dealing with a security issue, ask yourself these two questions:

- Can I access something that's not mine, or something I shouldn't have access to?
- Can I disable something for other people?

If the answer to either of those two questions are "yes", then you're probably dealing with a security issue. Note that even if you answer "no" to both questions, you may still be dealing with a security issue, so if you're unsure, just email us.

### Understanding Labels

- **Statuses**

  - `Abandoned` - This issue / pull request has been abandon
  - `Available` - This issue is available for either Developers or Community contributors to develop
  - `Blocked` - Another issue is blocking the development of this issue
  - `Completed` - Development has finished and been merged for this issue
  - `In Progress` - Development is underway for this issue
  - `On Hold` - The developers have decided to hold the development of this request
  - `Pending` - The developers have approved development of this request.
  - `Review Needed` - This pull request is waiting on review
  - `Revision Needed` - This pull request has been reviewed and requires revision
  - `Do not develop` - This wont be worked on by DevOPS or Community contributor
  - `Stale` - This issue has been automatically marked as stale because it has not had recent activite

- **Types**

  - `Chore` - Changes to the build process or auxiliary tools and libraries such as documentation generation
  - `Bug` - A possible bug
  - `Maintenance` - Changes to maintain the project
  - `Discussion` - A conversation about something
  - `Documentation` - Changes to the documentation
  - `Feature` - A new feature
  - `Enhancement` - Improving a feature
  - `Question` - Question about this project
  - `Fix` - A bug fix
  - `Optimisation` - A code change that improves performance
  - `Refactor` - A code change that neither fixes a bug nor adds a feature
  - `Revert` - Removes & Discards a previous change as error
  - `Decrecated` - Removes previous functionality which is no longer needed
  - `Removal` - Removes previous functionality which is no longer needed
  - `Style` - Changes that do not affect the meaning of the code (white-space formatting missing semi-colons etc)

- **DevOps**

  - `Accepted` - DevOPS are planning
  - `Completed` - DevOPS have complete
  - `Deploying` - DevOPS are deploying to latest
  - `Developing` - DevOPS are Developing
  - `Rejected` - DevOPS wont continue
  - `Reviewing` - DevOPS awaiting review
  - `Staging` - DevOPS deployed to Staging
  - `Testing` - DevOPS deployed to Testing

- **ComOps**

  - `Accepted` - A community contributor is planning to work on this issue
  - `Completed` - The contributor has completed this issue and handed over to the developers to stage & deploy
  - `Developing` - The contributor is developing this issue
  - `Awaiting Review` - The contributor is awaiting review
  - `Testing` - The contributor is awaiting testing results

- **Bugs**

  - `Low` - This bug isn't a high priority for the next release
  - `Medium` - This bug affects more than 10% of users and should be patched before the next major release
  - `High` - This bug affects more than 25% of users and should be patched before the next minor release
  - `Critical` - This bug affects more than 50% of users and should be patched before any new features are added
  - `Confirmed` - This bug has been confirmed
  - `New` - This bug is new
  - `Fixed` - This bug has been fixed

- **Content types**

  - `Dependences` - Changes that affect the dependences
  - `Workflow & CI` - Changes that affect the workflow & CI
  - `UI / UX` - Changes that affect the UI / UX
  - `Backend` - Changes that affect the backend
  - `Frontend` - Changes that affect the fronted

- **Miscellaneous**
  - `security fix` - A Security Fix
  - `security vulnerability` - A Security vulnerability
  - `Duplicate` - A Duplicate of another issue/pull
  - `Help wanted` - Help is needed to continue
  - `Needs rebase` - This request needs to be rebased
  - `Work in progress` - This pull request is a wip
  - `Sponsor Request ❤️` - This request has come from a sponsor
  - `More information needed` - Requires more information before it can continue
  - `First Timers` - A Good issue for first time github users
  - `skip-changelog` - Skip the changelog
  - `automerge` - Automatically Merge this request
  - `good first issue` - What it says on the tin. This helps new people find stuff to work on, because [GitHub actively promotes it](https://help.github.com/articles/helping-new-contributors-find-your-project-with-labels/) and [initialises new repositories with that label](https://help.github.com/articles/about-labels/#using-default-labels).


</details>

<details>
    <summary><b>Code Of Conduct</b></summary>

### Contributor Covenant Code of Conduct

#### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, sex characteristics, gender identity and expression,
level of experience, education, socio-economic status, nationality, personal
appearance, race, religion, or sexual identity and orientation.

#### Our Standards

Examples of behaviour that contributes to creating a positive environment
include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behaviour by participants include:

- The use of sexualized language or imagery and unwelcome sexual attention or
  advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or electronic
  address, without explicit permission
- Other conduct which could reasonably be considered inappropriate in a
  professional setting

#### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behaviour and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behaviour.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviours that they deem inappropriate,
threatening, offensive, or harmful.

#### Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an appointed
representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

#### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behaviour may be
reported by contacting the project team at hello@smartcloud.gg. All
complaints will be reviewed and investigated and will result in a response that
is deemed necessary and appropriate to the circumstances. The project team is
obligated to maintain confidentiality with regard to the reporter of an incident.
Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good
faith may face temporary or permanent repercussions as determined by other
members of the project's leadership.

#### Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,
available at https://www.contributor-covenant.org/version/1/4/code-of-conduct.html

[homepage]: https://www.contributor-covenant.org

For answers to common questions about this code of conduct, see
https://www.contributor-covenant.org/faq


</details>

<details>
    <summary><b>Code Review Process</b></summary>

### Code review process


</details>

<details>
    <summary><b>GPG Key Guide</b></summary>

### Signing Git with GPG using Keybase

This tutorial was originally written by [Stephen Rees-Carter](https://stephenreescarter.net/signing-git-commits-with-a-keybase-gpg-key/)

We suggest using this method of GPG key setup to reduce the number of keys you need to maintain when working on your devices; however, it's not perfect for everyone. This tutorial assumes that you are working from a private machine.

#### Prerequisities

- [Keybase](https://keybase.io/inv/8353caa6be) installed
- GPG Key configured within Keybase
- GPG installed on your device ([Windows](https://www.gpg4win.org/) | [Linux](https://gnupg.org/download/) | [macOS](https://gpgtools.org/))

#### Update the GPG Key

1. First, export your public and private keys from Keybase using the `keybase pgp` command:

   "`shell
   keybase pgp export --outfile keybase-public.key
   keybase pgp export --secret --outfile keybase-private.key
   ```

   During the export process, Keybase will ask for your account password and prompt to set a new password for the private key file.

2. Next, you need to import the keys into GPG using the `gpg` command:

   "`shell
   gpg --allow-secret-key-import --import keybase-private.key
   gpg --import keybase-public.key
   ```

   The import process will ask for the password you just assigned to your private key, for obvious reasons.

3. Now that you've imported the key into GPG, you need to modify the key to include your email address. This is done by invoking the `gpg --edit-key` command, with a unique identifier for your key. I found using the `<username>@keybase.io` address worked nicely.

   "`shell
   gpg --edit-key <username>@keybase.io
   ```

   This command will get you into the `gpg>` prompt, and from there you need to run the `adduid` command. It will prompt for your `Real name` and `Email address` (feel free to leave `Comment` empty). Once you've provided your name and email, confirm using the `O' and then `save` to close the `gpg>` prompt.

4. Using `gpg --edit-key <key>` and selecting the `trust` option. I suggest using trust level `5 = I trust ultimately`, since it is your own key. After applying the change, use `save` to close the prompt.

5. Once that's done, you can push your updated key back into Keybase.

   "`shell
   keybase pgp update
   ```

6. Add key to [Github](https://github.com) ([follow this tutorial](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/adding-a-new-gpg-key-to-your-github-account))

7. Setup git signing on commits
   Use the `git config user.signingkey` option to specify the Key ID for git to use. You can get this from the GitHub GPG keys page if you're unsure what it is. You can also require Git to sign all commits with the `commit.gpgsign` option.

   "`shell
   git config --global user.signingkey <Key ID>
   git config --global commit.gpgsign true
   ```


</details>

## Security

<details>
    <summary><b>Current Status</b></summary>

### Security Policy

#### Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| < 1.0   | :white_check_mark: |

#### Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

Tell them where to go, how often they can expect to get an update on a
reported vulnerability, what to expect if the vulnerability is accepted or
declined, etc.


</details>
