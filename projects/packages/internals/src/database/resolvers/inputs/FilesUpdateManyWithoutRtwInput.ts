import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FilesCreateManyRtwInputEnvelope } from '../inputs/FilesCreateManyRtwInputEnvelope';
import { FilesCreateOrConnectWithoutRtwInput } from '../inputs/FilesCreateOrConnectWithoutRtwInput';
import { FilesCreateWithoutRtwInput } from '../inputs/FilesCreateWithoutRtwInput';
import { FilesScalarWhereInput } from '../inputs/FilesScalarWhereInput';
import { FilesUpdateManyWithWhereWithoutRtwInput } from '../inputs/FilesUpdateManyWithWhereWithoutRtwInput';
import { FilesUpdateWithWhereUniqueWithoutRtwInput } from '../inputs/FilesUpdateWithWhereUniqueWithoutRtwInput';
import { FilesUpsertWithWhereUniqueWithoutRtwInput } from '../inputs/FilesUpsertWithWhereUniqueWithoutRtwInput';
import { FilesWhereUniqueInput } from '../inputs/FilesWhereUniqueInput';

@TypeGraphQL.InputType('FilesUpdateManyWithoutRtwInput', {
  isAbstract: true,
})
export class FilesUpdateManyWithoutRtwInput {
  @TypeGraphQL.Field((_type) => [FilesCreateWithoutRtwInput], {
    nullable: true,
  })
  create?: FilesCreateWithoutRtwInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FilesCreateOrConnectWithoutRtwInput], {
    nullable: true,
  })
  connectOrCreate?: FilesCreateOrConnectWithoutRtwInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FilesUpsertWithWhereUniqueWithoutRtwInput], {
    nullable: true,
  })
  upsert?: FilesUpsertWithWhereUniqueWithoutRtwInput[] | undefined;

  @TypeGraphQL.Field((_type) => FilesCreateManyRtwInputEnvelope, {
    nullable: true,
  })
  createMany?: FilesCreateManyRtwInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [FilesWhereUniqueInput], {
    nullable: true,
  })
  connect?: FilesWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FilesWhereUniqueInput], {
    nullable: true,
  })
  set?: FilesWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FilesWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: FilesWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FilesWhereUniqueInput], {
    nullable: true,
  })
  delete?: FilesWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FilesUpdateWithWhereUniqueWithoutRtwInput], {
    nullable: true,
  })
  update?: FilesUpdateWithWhereUniqueWithoutRtwInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FilesUpdateManyWithWhereWithoutRtwInput], {
    nullable: true,
  })
  updateMany?: FilesUpdateManyWithWhereWithoutRtwInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FilesScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: FilesScalarWhereInput[] | undefined;
}
