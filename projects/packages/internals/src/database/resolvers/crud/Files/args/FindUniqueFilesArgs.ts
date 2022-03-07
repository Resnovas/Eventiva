import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FilesWhereUniqueInput } from '../../../inputs/FilesWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class FindUniqueFilesArgs {
  @TypeGraphQL.Field((_type) => FilesWhereUniqueInput, {
    nullable: false,
  })
  where!: FilesWhereUniqueInput;
}