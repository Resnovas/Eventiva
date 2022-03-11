import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { VenueStyleCreateInput } from "../../../inputs/VenueStyleCreateInput";

@TypeGraphQL.ArgsType()
export class CreateVenueStyleArgs {
  @TypeGraphQL.Field(_type => VenueStyleCreateInput, {
    nullable: false
  })
  data!: VenueStyleCreateInput;
}
