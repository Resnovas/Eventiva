import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SortOrder } from "../../enums/SortOrder";
import { VenueStyleOrderByRelevanceFieldEnum } from "../../enums/VenueStyleOrderByRelevanceFieldEnum";

@TypeGraphQL.InputType("VenueStyleOrderByRelevanceInput", {
  isAbstract: true
})
export class VenueStyleOrderByRelevanceInput {
  @TypeGraphQL.Field(_type => [VenueStyleOrderByRelevanceFieldEnum], {
    nullable: false
  })
  fields!: Array<"id" | "name" | "details">;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: false
  })
  sort!: "asc" | "desc";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  search!: string;
}
