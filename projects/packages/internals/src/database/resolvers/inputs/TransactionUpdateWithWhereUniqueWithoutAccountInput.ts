import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { TransactionUpdateWithoutAccountInput } from '../inputs/TransactionUpdateWithoutAccountInput';
import { TransactionWhereUniqueInput } from '../inputs/TransactionWhereUniqueInput';

@TypeGraphQL.InputType('TransactionUpdateWithWhereUniqueWithoutAccountInput', {
  isAbstract: true,
})
export class TransactionUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => TransactionWhereUniqueInput, {
    nullable: false,
  })
  where!: TransactionWhereUniqueInput;

  @TypeGraphQL.Field((_type) => TransactionUpdateWithoutAccountInput, {
    nullable: false,
  })
  data!: TransactionUpdateWithoutAccountInput;
}
