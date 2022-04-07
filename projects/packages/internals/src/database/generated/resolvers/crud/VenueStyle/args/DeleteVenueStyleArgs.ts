import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { VenueStyleWhereUniqueInput } from "../../../inputs/VenueStyleWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteVenueStyleArgs {
  @TypeGraphQL.Field(_type => VenueStyleWhereUniqueInput, {
    nullable: false
  })
  where!: VenueStyleWhereUniqueInput;
}
