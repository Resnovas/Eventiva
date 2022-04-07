import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountOrderByWithRelationAndSearchRelevanceInput } from "../inputs/AccountOrderByWithRelationAndSearchRelevanceInput";
import { SaltOrderByRelevanceInput } from "../inputs/SaltOrderByRelevanceInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("SaltOrderByWithRelationAndSearchRelevanceInput", {
  isAbstract: true
})
export class SaltOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  salt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  expiry?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => AccountOrderByWithRelationAndSearchRelevanceInput, {
    nullable: true
  })
  account?: AccountOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  accountID?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  deletedDate?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  deleted?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SaltOrderByRelevanceInput, {
    nullable: true
  })
  _relevance?: SaltOrderByRelevanceInput | undefined;
}
