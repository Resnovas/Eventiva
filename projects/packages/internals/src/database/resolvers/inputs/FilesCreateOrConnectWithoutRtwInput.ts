import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FilesCreateWithoutRtwInput } from '../inputs/FilesCreateWithoutRtwInput';
import { FilesWhereUniqueInput } from '../inputs/FilesWhereUniqueInput';

@TypeGraphQL.InputType('FilesCreateOrConnectWithoutRtwInput', {
  isAbstract: true,
})
export class FilesCreateOrConnectWithoutRtwInput {
  @TypeGraphQL.Field((_type) => FilesWhereUniqueInput, {
    nullable: false,
  })
  where!: FilesWhereUniqueInput;

  @TypeGraphQL.Field((_type) => FilesCreateWithoutRtwInput, {
    nullable: false,
  })
  create!: FilesCreateWithoutRtwInput;
}
