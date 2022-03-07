import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutEmailsInput } from '../inputs/AccountCreateWithoutEmailsInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateOrConnectWithoutEmailsInput', {
  isAbstract: true,
})
export class AccountCreateOrConnectWithoutEmailsInput {
  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: false,
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutEmailsInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutEmailsInput;
}
