import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FilesCreateWithoutRtwInput } from '../inputs/FilesCreateWithoutRtwInput';
import { FilesUpdateWithoutRtwInput } from '../inputs/FilesUpdateWithoutRtwInput';
import { FilesWhereUniqueInput } from '../inputs/FilesWhereUniqueInput';

@TypeGraphQL.InputType('FilesUpsertWithWhereUniqueWithoutRtwInput', {
  isAbstract: true,
})
export class FilesUpsertWithWhereUniqueWithoutRtwInput {
  @TypeGraphQL.Field((_type) => FilesWhereUniqueInput, {
    nullable: false,
  })
  where!: FilesWhereUniqueInput;

  @TypeGraphQL.Field((_type) => FilesUpdateWithoutRtwInput, {
    nullable: false,
  })
  update!: FilesUpdateWithoutRtwInput;

  @TypeGraphQL.Field((_type) => FilesCreateWithoutRtwInput, {
    nullable: false,
  })
  create!: FilesCreateWithoutRtwInput;
}
