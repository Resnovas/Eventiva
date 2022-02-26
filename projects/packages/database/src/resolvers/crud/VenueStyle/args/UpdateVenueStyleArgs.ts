import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { VenueStyleUpdateInput } from '../../../inputs/VenueStyleUpdateInput';
import { VenueStyleWhereUniqueInput } from '../../../inputs/VenueStyleWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpdateVenueStyleArgs {
  @TypeGraphQL.Field((_type) => VenueStyleUpdateInput, {
    nullable: false,
  })
  data!: VenueStyleUpdateInput;

  @TypeGraphQL.Field((_type) => VenueStyleWhereUniqueInput, {
    nullable: false,
  })
  where!: VenueStyleWhereUniqueInput;
}
