import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FilesCreateOrConnectWithoutAccountInput } from '../inputs/FilesCreateOrConnectWithoutAccountInput';
import { FilesCreateWithoutAccountInput } from '../inputs/FilesCreateWithoutAccountInput';
import { FilesWhereUniqueInput } from '../inputs/FilesWhereUniqueInput';

@TypeGraphQL.InputType('FilesCreateNestedManyWithoutAccountInput', {
  isAbstract: true,
})
export class FilesCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field((_type) => [FilesCreateWithoutAccountInput], {
    nullable: true,
  })
  create?: FilesCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FilesCreateOrConnectWithoutAccountInput], {
    nullable: true,
  })
  connectOrCreate?: FilesCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FilesWhereUniqueInput], {
    nullable: true,
  })
  connect?: FilesWhereUniqueInput[] | undefined;
}
