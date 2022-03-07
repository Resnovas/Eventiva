import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateNestedOneWithoutTransactionsInput } from '../inputs/AccountCreateNestedOneWithoutTransactionsInput';

@TypeGraphQL.InputType('TransactionCreateWithoutSIACheckInput', {
  isAbstract: true,
})
export class TransactionCreateWithoutSIACheckInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id?: string | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted?: Date | undefined;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: false,
  })
  data!: Prisma.InputJsonValue;

  @TypeGraphQL.Field(
    (_type) => AccountCreateNestedOneWithoutTransactionsInput,
    {
      nullable: false,
    }
  )
  account!: AccountCreateNestedOneWithoutTransactionsInput;
}
