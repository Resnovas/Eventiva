import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountOrderByWithRelationAndSearchRelevanceInput } from "../inputs/AccountOrderByWithRelationAndSearchRelevanceInput";
import { FilesOrderByRelationAggregateInput } from "../inputs/FilesOrderByRelationAggregateInput";
import { RTWOrderByRelevanceInput } from "../inputs/RTWOrderByRelevanceInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("RTWOrderByWithRelationAndSearchRelevanceInput", {
  isAbstract: true
})
export class RTWOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => FilesOrderByRelationAggregateInput, {
    nullable: true
  })
  files?: FilesOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  name?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  active?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  startDate?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  endDate?: "asc" | "desc" | undefined;

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

  @TypeGraphQL.Field(_type => RTWOrderByRelevanceInput, {
    nullable: true
  })
  _relevance?: RTWOrderByRelevanceInput | undefined;
}
