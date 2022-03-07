import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutFilesInput } from '../inputs/AccountCreateOrConnectWithoutFilesInput';
import { AccountCreateWithoutFilesInput } from '../inputs/AccountCreateWithoutFilesInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateNestedManyWithoutFilesInput', {
  isAbstract: true,
})
export class AccountCreateNestedManyWithoutFilesInput {
  @TypeGraphQL.Field((_type) => [AccountCreateWithoutFilesInput], {
    nullable: true,
  })
  create?: AccountCreateWithoutFilesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AccountCreateOrConnectWithoutFilesInput], {
    nullable: true,
  })
  connectOrCreate?: AccountCreateOrConnectWithoutFilesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AccountWhereUniqueInput], {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput[] | undefined;
}
