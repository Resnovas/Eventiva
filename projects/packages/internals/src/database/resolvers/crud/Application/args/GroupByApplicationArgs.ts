import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ApplicationOrderByWithAggregationInput } from '../../../inputs/ApplicationOrderByWithAggregationInput';
import { ApplicationScalarWhereWithAggregatesInput } from '../../../inputs/ApplicationScalarWhereWithAggregatesInput';
import { ApplicationWhereInput } from '../../../inputs/ApplicationWhereInput';
import { ApplicationScalarFieldEnum } from '../../../../enums/ApplicationScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class GroupByApplicationArgs {
  @TypeGraphQL.Field((_type) => ApplicationWhereInput, {
    nullable: true,
  })
  where?: ApplicationWhereInput | undefined;

  @TypeGraphQL.Field((_type) => [ApplicationOrderByWithAggregationInput], {
    nullable: true,
  })
  orderBy?: ApplicationOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ApplicationScalarFieldEnum], {
    nullable: false,
  })
  by!: Array<
    'id' | 'name' | 'accountId' | 'createdAt' | 'updatedAt' | 'deleted'
  >;

  @TypeGraphQL.Field((_type) => ApplicationScalarWhereWithAggregatesInput, {
    nullable: true,
  })
  having?: ApplicationScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
