import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FilesCreateInput } from '../../../inputs/FilesCreateInput';
import { FilesUpdateInput } from '../../../inputs/FilesUpdateInput';
import { FilesWhereUniqueInput } from '../../../inputs/FilesWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertFilesArgs {
  @TypeGraphQL.Field((_type) => FilesWhereUniqueInput, {
    nullable: false,
  })
  where!: FilesWhereUniqueInput;

  @TypeGraphQL.Field((_type) => FilesCreateInput, {
    nullable: false,
  })
  create!: FilesCreateInput;

  @TypeGraphQL.Field((_type) => FilesUpdateInput, {
    nullable: false,
  })
  update!: FilesUpdateInput;
}
