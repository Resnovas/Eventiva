#! /usr/bin/env node
import { Command, Option } from 'commander';

import { version } from './package.json';
const program = new Command();

program.version(process.env.npm_package_version || version || '0.0.0');

program
  .command('build')
  .description('Build the application')
  .addOption(new Option('-d, --debug', 'Builds in debug mode').env('DEBUG'))
  .addOption(
    new Option('-p, --production', 'Builds in production mode').env(
      'PRODUCTION'
    )
  )
  .action(async (options) => {
    console.log(options);
  });

program.parse(process.argv);
