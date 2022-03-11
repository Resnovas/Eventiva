import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { VenueStyleWhereInput } from "../../../inputs/VenueStyleWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyVenueStyleArgs {
  @TypeGraphQL.Field(_type => VenueStyleWhereInput, {
    nullable: true
  })
  where?: VenueStyleWhereInput | undefined;
}
