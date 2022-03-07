import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { VenueStyleUpdateManyMutationInput } from '../../../inputs/VenueStyleUpdateManyMutationInput';
import { VenueStyleWhereInput } from '../../../inputs/VenueStyleWhereInput';

@TypeGraphQL.ArgsType()
export class UpdateManyVenueStyleArgs {
  @TypeGraphQL.Field((_type) => VenueStyleUpdateManyMutationInput, {
    nullable: false,
  })
  data!: VenueStyleUpdateManyMutationInput;

  @TypeGraphQL.Field((_type) => VenueStyleWhereInput, {
    nullable: true,
  })
  where?: VenueStyleWhereInput | undefined;
}
