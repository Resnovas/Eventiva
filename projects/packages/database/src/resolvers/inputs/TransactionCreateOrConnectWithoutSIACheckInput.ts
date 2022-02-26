import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { TransactionCreateWithoutSIACheckInput } from '../inputs/TransactionCreateWithoutSIACheckInput';
import { TransactionWhereUniqueInput } from '../inputs/TransactionWhereUniqueInput';

@TypeGraphQL.InputType('TransactionCreateOrConnectWithoutSIACheckInput', {
  isAbstract: true,
})
export class TransactionCreateOrConnectWithoutSIACheckInput {
  @TypeGraphQL.Field((_type) => TransactionWhereUniqueInput, {
    nullable: false,
  })
  where!: TransactionWhereUniqueInput;

  @TypeGraphQL.Field((_type) => TransactionCreateWithoutSIACheckInput, {
    nullable: false,
  })
  create!: TransactionCreateWithoutSIACheckInput;
}
