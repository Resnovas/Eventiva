import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { VenueStyleWhereInput } from "../inputs/VenueStyleWhereInput";

@TypeGraphQL.InputType("VenueStyleListRelationFilter", {
  isAbstract: true
})
export class VenueStyleListRelationFilter {
  @TypeGraphQL.Field(_type => VenueStyleWhereInput, {
    nullable: true
  })
  every?: VenueStyleWhereInput | undefined;

  @TypeGraphQL.Field(_type => VenueStyleWhereInput, {
    nullable: true
  })
  some?: VenueStyleWhereInput | undefined;

  @TypeGraphQL.Field(_type => VenueStyleWhereInput, {
    nullable: true
  })
  none?: VenueStyleWhereInput | undefined;
}
