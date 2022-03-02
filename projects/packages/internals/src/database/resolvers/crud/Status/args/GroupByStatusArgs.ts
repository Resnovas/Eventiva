import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { StatusOrderByWithAggregationInput } from '../../../inputs/StatusOrderByWithAggregationInput';
import { StatusScalarWhereWithAggregatesInput } from '../../../inputs/StatusScalarWhereWithAggregatesInput';
import { StatusWhereInput } from '../../../inputs/StatusWhereInput';
import { StatusScalarFieldEnum } from '../../../../enums/StatusScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class GroupByStatusArgs {
  @TypeGraphQL.Field((_type) => StatusWhereInput, {
    nullable: true,
  })
  where?: StatusWhereInput | undefined;

  @TypeGraphQL.Field((_type) => [StatusOrderByWithAggregationInput], {
    nullable: true,
  })
  orderBy?: StatusOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field((_type) => [StatusScalarFieldEnum], {
    nullable: false,
  })
  by!: Array<'id' | 'name' | 'createdAt' | 'updatedAt' | 'deleted'>;

  @TypeGraphQL.Field((_type) => StatusScalarWhereWithAggregatesInput, {
    nullable: true,
  })
  having?: StatusScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
