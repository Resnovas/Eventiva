import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutRtwInput } from '../inputs/AccountCreateWithoutRtwInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateOrConnectWithoutRtwInput', {
  isAbstract: true,
})
export class AccountCreateOrConnectWithoutRtwInput {
  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: false,
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutRtwInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutRtwInput;
}
