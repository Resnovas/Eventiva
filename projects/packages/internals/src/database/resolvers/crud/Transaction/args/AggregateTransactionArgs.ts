import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { TransactionOrderByWithRelationAndSearchRelevanceInput } from '../../../inputs/TransactionOrderByWithRelationAndSearchRelevanceInput';
import { TransactionWhereInput } from '../../../inputs/TransactionWhereInput';
import { TransactionWhereUniqueInput } from '../../../inputs/TransactionWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class AggregateTransactionArgs {
  @TypeGraphQL.Field((_type) => TransactionWhereInput, {
    nullable: true,
  })
  where?: TransactionWhereInput | undefined;

  @TypeGraphQL.Field(
    (_type) => [TransactionOrderByWithRelationAndSearchRelevanceInput],
    {
      nullable: true,
    }
  )
  orderBy?: TransactionOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field((_type) => TransactionWhereUniqueInput, {
    nullable: true,
  })
  cursor?: TransactionWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
