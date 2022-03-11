import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIABadgeOrderByWithRelationAndSearchRelevanceInput } from "../inputs/SIABadgeOrderByWithRelationAndSearchRelevanceInput";
import { SIACheckOrderByRelevanceInput } from "../inputs/SIACheckOrderByRelevanceInput";
import { TransactionOrderByWithRelationAndSearchRelevanceInput } from "../inputs/TransactionOrderByWithRelationAndSearchRelevanceInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("SIACheckOrderByWithRelationAndSearchRelevanceInput", {
  isAbstract: true
})
export class SIACheckOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SIABadgeOrderByWithRelationAndSearchRelevanceInput, {
    nullable: true
  })
  badge?: SIABadgeOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  sia_id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  status?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  AuthUrl?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  pubUrl?: "asc" | "desc" | undefined;

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
  deleted?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  error?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => TransactionOrderByWithRelationAndSearchRelevanceInput, {
    nullable: true
  })
  transactions?: TransactionOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  transactionId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SIACheckOrderByRelevanceInput, {
    nullable: true
  })
  _relevance?: SIACheckOrderByRelevanceInput | undefined;
}
