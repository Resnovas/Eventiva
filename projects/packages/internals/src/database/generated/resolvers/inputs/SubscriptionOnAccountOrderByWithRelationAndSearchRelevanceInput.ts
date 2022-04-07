import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountOrderByWithRelationAndSearchRelevanceInput } from "../inputs/AccountOrderByWithRelationAndSearchRelevanceInput";
import { SubscriptionOnAccountOrderByRelevanceInput } from "../inputs/SubscriptionOnAccountOrderByRelevanceInput";
import { SubscriptionOrderByWithRelationAndSearchRelevanceInput } from "../inputs/SubscriptionOrderByWithRelationAndSearchRelevanceInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("SubscriptionOnAccountOrderByWithRelationAndSearchRelevanceInput", {
  isAbstract: true
})
export class SubscriptionOnAccountOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  subscriptionId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SubscriptionOrderByWithRelationAndSearchRelevanceInput, {
    nullable: true
  })
  subscription?: SubscriptionOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field(_type => AccountOrderByWithRelationAndSearchRelevanceInput, {
    nullable: true
  })
  account?: AccountOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  accountId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  active?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  deactivated?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  activated?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  startedAt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  createdAt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  updatedAt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  deletedDate?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  deleted?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountOrderByRelevanceInput, {
    nullable: true
  })
  _relevance?: SubscriptionOnAccountOrderByRelevanceInput | undefined;
}
