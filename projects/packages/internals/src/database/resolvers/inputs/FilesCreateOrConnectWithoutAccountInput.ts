import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FilesCreateWithoutAccountInput } from '../inputs/FilesCreateWithoutAccountInput';
import { FilesWhereUniqueInput } from '../inputs/FilesWhereUniqueInput';

@TypeGraphQL.InputType('FilesCreateOrConnectWithoutAccountInput', {
  isAbstract: true,
})
export class FilesCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field((_type) => FilesWhereUniqueInput, {
    nullable: false,
  })
  where!: FilesWhereUniqueInput;

  @TypeGraphQL.Field((_type) => FilesCreateWithoutAccountInput, {
    nullable: false,
  })
  create!: FilesCreateWithoutAccountInput;
}
