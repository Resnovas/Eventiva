import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutPrimaryAddressInput } from '../inputs/AccountCreateWithoutPrimaryAddressInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateOrConnectWithoutPrimaryAddressInput', {
  isAbstract: true,
})
export class AccountCreateOrConnectWithoutPrimaryAddressInput {
  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: false,
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutPrimaryAddressInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutPrimaryAddressInput;
}
