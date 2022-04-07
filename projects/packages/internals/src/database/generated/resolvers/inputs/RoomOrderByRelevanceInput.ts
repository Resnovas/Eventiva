import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomOrderByRelevanceFieldEnum } from "../../enums/RoomOrderByRelevanceFieldEnum";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("RoomOrderByRelevanceInput", {
  isAbstract: true
})
export class RoomOrderByRelevanceInput {
  @TypeGraphQL.Field(_type => [RoomOrderByRelevanceFieldEnum], {
    nullable: false
  })
  fields!: Array<"id" | "addressId" | "name" | "floor" | "building" | "length" | "width" | "height">;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: false
  })
  sort!: "asc" | "desc";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  search!: string;
}
