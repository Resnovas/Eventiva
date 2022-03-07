import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutEmployeesInput } from '../inputs/AccountCreateWithoutEmployeesInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateOrConnectWithoutEmployeesInput', {
  isAbstract: true,
})
export class AccountCreateOrConnectWithoutEmployeesInput {
  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: false,
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutEmployeesInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutEmployeesInput;
}
