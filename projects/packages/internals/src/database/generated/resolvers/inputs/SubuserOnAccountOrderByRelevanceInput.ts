import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SortOrder } from "../../enums/SortOrder";
import { SubuserOnAccountOrderByRelevanceFieldEnum } from "../../enums/SubuserOnAccountOrderByRelevanceFieldEnum";

@TypeGraphQL.InputType("SubuserOnAccountOrderByRelevanceInput", {
  isAbstract: true
})
export class SubuserOnAccountOrderByRelevanceInput {
  @TypeGraphQL.Field(_type => [SubuserOnAccountOrderByRelevanceFieldEnum], {
    nullable: false
  })
  fields!: Array<"accountId" | "subuserId">;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: false
  })
  sort!: "asc" | "desc";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  search!: string;
}
