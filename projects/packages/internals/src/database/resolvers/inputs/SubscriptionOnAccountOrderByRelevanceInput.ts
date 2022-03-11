import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SortOrder } from "../../enums/SortOrder";
import { SubscriptionOnAccountOrderByRelevanceFieldEnum } from "../../enums/SubscriptionOnAccountOrderByRelevanceFieldEnum";

@TypeGraphQL.InputType("SubscriptionOnAccountOrderByRelevanceInput", {
  isAbstract: true
})
export class SubscriptionOnAccountOrderByRelevanceInput {
  @TypeGraphQL.Field(_type => [SubscriptionOnAccountOrderByRelevanceFieldEnum], {
    nullable: false
  })
  fields!: Array<"subscriptionId" | "accountId">;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: false
  })
  sort!: "asc" | "desc";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  search!: string;
}
