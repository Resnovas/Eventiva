import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutAccountsInput } from '../inputs/AccountCreateWithoutAccountsInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateOrConnectWithoutAccountsInput', {
  isAbstract: true,
})
export class AccountCreateOrConnectWithoutAccountsInput {
  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: false,
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutAccountsInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutAccountsInput;
}
