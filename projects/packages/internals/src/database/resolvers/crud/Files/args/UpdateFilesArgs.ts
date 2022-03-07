import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FilesUpdateInput } from '../../../inputs/FilesUpdateInput';
import { FilesWhereUniqueInput } from '../../../inputs/FilesWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpdateFilesArgs {
  @TypeGraphQL.Field((_type) => FilesUpdateInput, {
    nullable: false,
  })
  data!: FilesUpdateInput;

  @TypeGraphQL.Field((_type) => FilesWhereUniqueInput, {
    nullable: false,
  })
  where!: FilesWhereUniqueInput;
}
