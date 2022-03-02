import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutAccountsInput } from '../inputs/AccountCreateOrConnectWithoutAccountsInput';
import { AccountCreateWithoutAccountsInput } from '../inputs/AccountCreateWithoutAccountsInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateNestedOneWithoutAccountsInput', {
  isAbstract: true,
})
export class AccountCreateNestedOneWithoutAccountsInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutAccountsInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutAccountsInput | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateOrConnectWithoutAccountsInput, {
    nullable: true,
  })
  connectOrCreate?: AccountCreateOrConnectWithoutAccountsInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;
}
