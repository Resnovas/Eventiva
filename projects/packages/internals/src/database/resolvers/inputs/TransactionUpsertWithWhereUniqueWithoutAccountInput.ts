import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { TransactionCreateWithoutAccountInput } from '../inputs/TransactionCreateWithoutAccountInput';
import { TransactionUpdateWithoutAccountInput } from '../inputs/TransactionUpdateWithoutAccountInput';
import { TransactionWhereUniqueInput } from '../inputs/TransactionWhereUniqueInput';

@TypeGraphQL.InputType('TransactionUpsertWithWhereUniqueWithoutAccountInput', {
  isAbstract: true,
})
export class TransactionUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => TransactionWhereUniqueInput, {
    nullable: false,
  })
  where!: TransactionWhereUniqueInput;

  @TypeGraphQL.Field((_type) => TransactionUpdateWithoutAccountInput, {
    nullable: false,
  })
  update!: TransactionUpdateWithoutAccountInput;

  @TypeGraphQL.Field((_type) => TransactionCreateWithoutAccountInput, {
    nullable: false,
  })
  create!: TransactionCreateWithoutAccountInput;
}
