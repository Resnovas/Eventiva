import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SortOrder } from "../../enums/SortOrder";
import { StatusOnAccountOrderByRelevanceFieldEnum } from "../../enums/StatusOnAccountOrderByRelevanceFieldEnum";

@TypeGraphQL.InputType("StatusOnAccountOrderByRelevanceInput", {
  isAbstract: true
})
export class StatusOnAccountOrderByRelevanceInput {
  @TypeGraphQL.Field(_type => [StatusOnAccountOrderByRelevanceFieldEnum], {
    nullable: false
  })
  fields!: Array<"statusId" | "accountId">;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: false
  })
  sort!: "asc" | "desc";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  search!: string;
}
