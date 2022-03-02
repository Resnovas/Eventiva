import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { VenueStyleCreateManyInput } from '../../../inputs/VenueStyleCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyVenueStyleArgs {
  @TypeGraphQL.Field((_type) => [VenueStyleCreateManyInput], {
    nullable: false,
  })
  data!: VenueStyleCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
