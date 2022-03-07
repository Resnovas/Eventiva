import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutTransactionsInput } from '../inputs/AccountCreateOrConnectWithoutTransactionsInput';
import { AccountCreateWithoutTransactionsInput } from '../inputs/AccountCreateWithoutTransactionsInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateNestedOneWithoutTransactionsInput', {
  isAbstract: true,
})
export class AccountCreateNestedOneWithoutTransactionsInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutTransactionsInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutTransactionsInput | undefined;

  @TypeGraphQL.Field(
    (_type) => AccountCreateOrConnectWithoutTransactionsInput,
    {
      nullable: true,
    }
  )
  connectOrCreate?: AccountCreateOrConnectWithoutTransactionsInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;
}
