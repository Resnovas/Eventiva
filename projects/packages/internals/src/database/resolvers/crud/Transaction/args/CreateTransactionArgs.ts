import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { TransactionCreateInput } from '../../../inputs/TransactionCreateInput';

@TypeGraphQL.ArgsType()
export class CreateTransactionArgs {
  @TypeGraphQL.Field((_type) => TransactionCreateInput, {
    nullable: false,
  })
  data!: TransactionCreateInput;
}
