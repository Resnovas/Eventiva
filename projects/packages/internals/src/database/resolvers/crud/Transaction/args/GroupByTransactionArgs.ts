import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { TransactionOrderByWithAggregationInput } from '../../../inputs/TransactionOrderByWithAggregationInput';
import { TransactionScalarWhereWithAggregatesInput } from '../../../inputs/TransactionScalarWhereWithAggregatesInput';
import { TransactionWhereInput } from '../../../inputs/TransactionWhereInput';
import { TransactionScalarFieldEnum } from '../../../../enums/TransactionScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class GroupByTransactionArgs {
  @TypeGraphQL.Field((_type) => TransactionWhereInput, {
    nullable: true,
  })
  where?: TransactionWhereInput | undefined;

  @TypeGraphQL.Field((_type) => [TransactionOrderByWithAggregationInput], {
    nullable: true,
  })
  orderBy?: TransactionOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field((_type) => [TransactionScalarFieldEnum], {
    nullable: false,
  })
  by!: Array<
    'id' | 'createdAt' | 'updatedAt' | 'deleted' | 'accountId' | 'data'
  >;

  @TypeGraphQL.Field((_type) => TransactionScalarWhereWithAggregatesInput, {
    nullable: true,
  })
  having?: TransactionScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
