import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementOfRoomOrderByRelevanceFieldEnum } from "../../enums/ArrangementOfRoomOrderByRelevanceFieldEnum";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ArrangementOfRoomOrderByRelevanceInput", {
  isAbstract: true
})
export class ArrangementOfRoomOrderByRelevanceInput {
  @TypeGraphQL.Field(_type => [ArrangementOfRoomOrderByRelevanceFieldEnum], {
    nullable: false
  })
  fields!: Array<"roomId" | "arrangementId" | "details">;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: false
  })
  sort!: "asc" | "desc";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  search!: string;
}
