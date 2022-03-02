import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FilesCreateManyInput } from '../../../inputs/FilesCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyFilesArgs {
  @TypeGraphQL.Field((_type) => [FilesCreateManyInput], {
    nullable: false,
  })
  data!: FilesCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
