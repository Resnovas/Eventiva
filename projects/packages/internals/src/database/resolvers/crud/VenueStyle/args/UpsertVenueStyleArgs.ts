import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { VenueStyleCreateInput } from '../../../inputs/VenueStyleCreateInput';
import { VenueStyleUpdateInput } from '../../../inputs/VenueStyleUpdateInput';
import { VenueStyleWhereUniqueInput } from '../../../inputs/VenueStyleWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertVenueStyleArgs {
  @TypeGraphQL.Field((_type) => VenueStyleWhereUniqueInput, {
    nullable: false,
  })
  where!: VenueStyleWhereUniqueInput;

  @TypeGraphQL.Field((_type) => VenueStyleCreateInput, {
    nullable: false,
  })
  create!: VenueStyleCreateInput;

  @TypeGraphQL.Field((_type) => VenueStyleUpdateInput, {
    nullable: false,
  })
  update!: VenueStyleUpdateInput;
}
