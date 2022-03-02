import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FeatureOrderByWithAggregationInput } from '../../../inputs/FeatureOrderByWithAggregationInput';
import { FeatureScalarWhereWithAggregatesInput } from '../../../inputs/FeatureScalarWhereWithAggregatesInput';
import { FeatureWhereInput } from '../../../inputs/FeatureWhereInput';
import { FeatureScalarFieldEnum } from '../../../../enums/FeatureScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class GroupByFeatureArgs {
  @TypeGraphQL.Field((_type) => FeatureWhereInput, {
    nullable: true,
  })
  where?: FeatureWhereInput | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOrderByWithAggregationInput], {
    nullable: true,
  })
  orderBy?: FeatureOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FeatureScalarFieldEnum], {
    nullable: false,
  })
  by!: Array<'id' | 'name' | 'type' | 'createdAt' | 'updatedAt' | 'deleted'>;

  @TypeGraphQL.Field((_type) => FeatureScalarWhereWithAggregatesInput, {
    nullable: true,
  })
  having?: FeatureScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
