import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DomainCountOrderByAggregateInput } from "../inputs/DomainCountOrderByAggregateInput";
import { DomainMaxOrderByAggregateInput } from "../inputs/DomainMaxOrderByAggregateInput";
import { DomainMinOrderByAggregateInput } from "../inputs/DomainMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("DomainOrderByWithAggregationInput", {
  isAbstract: true
})
export class DomainOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  domain?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  verified?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  dnsType?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  data?: "asc" | "desc" | undefined;

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

  @TypeGraphQL.Field(_type => DomainCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: DomainCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => DomainMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: DomainMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => DomainMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: DomainMinOrderByAggregateInput | undefined;
}
