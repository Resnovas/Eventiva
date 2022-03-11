import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountOrderByRelevanceFieldEnum } from "../../enums/ManagersOnAccountOrderByRelevanceFieldEnum";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ManagersOnAccountOrderByRelevanceInput", {
  isAbstract: true
})
export class ManagersOnAccountOrderByRelevanceInput {
  @TypeGraphQL.Field(_type => [ManagersOnAccountOrderByRelevanceFieldEnum], {
    nullable: false
  })
  fields!: Array<"accountId" | "managersId">;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: false
  })
  sort!: "asc" | "desc";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  search!: string;
}
