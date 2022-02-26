import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutEmailsInput } from '../inputs/AccountCreateOrConnectWithoutEmailsInput';
import { AccountCreateWithoutEmailsInput } from '../inputs/AccountCreateWithoutEmailsInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateNestedOneWithoutEmailsInput', {
  isAbstract: true,
})
export class AccountCreateNestedOneWithoutEmailsInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutEmailsInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutEmailsInput | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateOrConnectWithoutEmailsInput, {
    nullable: true,
  })
  connectOrCreate?: AccountCreateOrConnectWithoutEmailsInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;
}
