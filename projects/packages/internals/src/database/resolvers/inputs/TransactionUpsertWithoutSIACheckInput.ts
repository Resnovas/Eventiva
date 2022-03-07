import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { TransactionCreateWithoutSIACheckInput } from '../inputs/TransactionCreateWithoutSIACheckInput';
import { TransactionUpdateWithoutSIACheckInput } from '../inputs/TransactionUpdateWithoutSIACheckInput';

@TypeGraphQL.InputType('TransactionUpsertWithoutSIACheckInput', {
  isAbstract: true,
})
export class TransactionUpsertWithoutSIACheckInput {
  @TypeGraphQL.Field((_type) => TransactionUpdateWithoutSIACheckInput, {
    nullable: false,
  })
  update!: TransactionUpdateWithoutSIACheckInput;

  @TypeGraphQL.Field((_type) => TransactionCreateWithoutSIACheckInput, {
    nullable: false,
  })
  create!: TransactionCreateWithoutSIACheckInput;
}
