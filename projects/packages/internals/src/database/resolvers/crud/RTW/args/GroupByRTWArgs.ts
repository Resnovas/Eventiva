import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { RTWOrderByWithAggregationInput } from '../../../inputs/RTWOrderByWithAggregationInput';
import { RTWScalarWhereWithAggregatesInput } from '../../../inputs/RTWScalarWhereWithAggregatesInput';
import { RTWWhereInput } from '../../../inputs/RTWWhereInput';
import { RTWScalarFieldEnum } from '../../../../enums/RTWScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class GroupByRTWArgs {
  @TypeGraphQL.Field((_type) => RTWWhereInput, {
    nullable: true,
  })
  where?: RTWWhereInput | undefined;

  @TypeGraphQL.Field((_type) => [RTWOrderByWithAggregationInput], {
    nullable: true,
  })
  orderBy?: RTWOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field((_type) => [RTWScalarFieldEnum], {
    nullable: false,
  })
  by!: Array<
    | 'id'
    | 'name'
    | 'active'
    | 'startDate'
    | 'endDate'
    | 'accountId'
    | 'createdAt'
    | 'updatedAt'
    | 'deleted'
  >;

  @TypeGraphQL.Field((_type) => RTWScalarWhereWithAggregatesInput, {
    nullable: true,
  })
  having?: RTWScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
