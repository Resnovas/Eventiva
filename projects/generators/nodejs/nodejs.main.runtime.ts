import { MainRuntime } from '@teambit/cli';
import { GeneratorMain, GeneratorAspect, ComponentContext } from '@teambit/generator';
import { readPath } from './components';
import { NodejsAspect } from './nodejs.aspect';
import path from 'path'

export class NodejsMain {
  static slots = [];
  static dependencies = [GeneratorAspect];
  static runtime = MainRuntime;
  static async provider([generator]: [GeneratorMain]) {
  /**
  * Array of templates. Add as many templates as you want
  * Separate the templates to multiple files if you prefer
  * Modify, add or remove files as needed
  * See the docs file of this component for more info
  */

    generator.registerComponentTemplate([
      {
          name: 'serverless',
          description: 'Used to generate all our serverless functions',
          generateFiles: (context: ComponentContext) => {
            const res = readPath('./projects/generators/nodejs/template', context)
            console.log(res)
            return res
          }
      }
    ]);

    return new NodejsMain();
  }
}

NodejsAspect.addRuntime(NodejsMain);
