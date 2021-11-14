#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const package_json_1 = require("./package.json");
const program = new commander_1.Command();
program.version(process.env.npm_package_version || package_json_1.version || '0.0.0');
program.command('build')
    .description('Build the application')
    .addOption(new commander_1.Option('-d, --debug', 'Builds in debug mode').env('DEBUG'))
    .addOption(new commander_1.Option('-p, --production', 'Builds in production mode').env('PRODUCTION'))
    .action(async (options) => {
    console.log(options);
});
program.parse(process.argv);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx5Q0FBNEM7QUFDNUMsaURBQXVDO0FBQ3ZDLE1BQU0sT0FBTyxHQUFHLElBQUksbUJBQU8sRUFBRSxDQUFDO0FBRTlCLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsSUFBSSxzQkFBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDO0FBRXZFLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0tBQ25CLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQztLQUNwQyxTQUFTLENBQUMsSUFBSSxrQkFBTSxDQUFDLGFBQWEsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN6RSxTQUFTLENBQUMsSUFBSSxrQkFBTSxDQUFDLGtCQUFrQixFQUFFLDJCQUEyQixDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ3hGLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7SUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QixDQUFDLENBQUMsQ0FBQztBQUdQLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBIn0=