import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { StatusOnAccountOrderByRelationAggregateInput } from "../inputs/StatusOnAccountOrderByRelationAggregateInput";
import { StatusOrderByRelevanceInput } from "../inputs/StatusOrderByRelevanceInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("StatusOrderByWithRelationAndSearchRelevanceInput", {
  isAbstract: true
})
export class StatusOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  name?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => StatusOnAccountOrderByRelationAggregateInput, {
    nullable: true
  })
  account?: StatusOnAccountOrderByRelationAggregateInput | undefined;

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

  @TypeGraphQL.Field(_type => StatusOrderByRelevanceInput, {
    nullable: true
  })
  _relevance?: StatusOrderByRelevanceInput | undefined;
}
