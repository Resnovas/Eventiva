import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { VenueStyleOrderByWithAggregationInput } from '../../../inputs/VenueStyleOrderByWithAggregationInput';
import { VenueStyleScalarWhereWithAggregatesInput } from '../../../inputs/VenueStyleScalarWhereWithAggregatesInput';
import { VenueStyleWhereInput } from '../../../inputs/VenueStyleWhereInput';
import { VenueStyleScalarFieldEnum } from '../../../../enums/VenueStyleScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class GroupByVenueStyleArgs {
  @TypeGraphQL.Field((_type) => VenueStyleWhereInput, {
    nullable: true,
  })
  where?: VenueStyleWhereInput | undefined;

  @TypeGraphQL.Field((_type) => [VenueStyleOrderByWithAggregationInput], {
    nullable: true,
  })
  orderBy?: VenueStyleOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field((_type) => [VenueStyleScalarFieldEnum], {
    nullable: false,
  })
  by!: Array<'id' | 'createdAt' | 'updatedAt' | 'name' | 'details'>;

  @TypeGraphQL.Field((_type) => VenueStyleScalarWhereWithAggregatesInput, {
    nullable: true,
  })
  having?: VenueStyleScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
