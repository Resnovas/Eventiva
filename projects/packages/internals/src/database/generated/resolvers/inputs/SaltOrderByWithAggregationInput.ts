import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SaltCountOrderByAggregateInput } from "../inputs/SaltCountOrderByAggregateInput";
import { SaltMaxOrderByAggregateInput } from "../inputs/SaltMaxOrderByAggregateInput";
import { SaltMinOrderByAggregateInput } from "../inputs/SaltMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("SaltOrderByWithAggregationInput", {
  isAbstract: true
})
export class SaltOrderByWithAggregationInput {
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

  @TypeGraphQL.Field(_type => SaltCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: SaltCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => SaltMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: SaltMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => SaltMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: SaltMinOrderByAggregateInput | undefined;
}
