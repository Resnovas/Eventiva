import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateNestedOneWithoutAccountsInput } from '../inputs/AccountCreateNestedOneWithoutAccountsInput';

@TypeGraphQL.InputType('ManagersOnAccountCreateWithoutManagersInput', {
  isAbstract: true,
})
export class ManagersOnAccountCreateWithoutManagersInput {
  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateNestedOneWithoutAccountsInput, {
    nullable: false,
  })
  account!: AccountCreateNestedOneWithoutAccountsInput;
}
