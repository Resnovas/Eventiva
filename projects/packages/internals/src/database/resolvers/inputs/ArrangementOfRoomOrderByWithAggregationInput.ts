import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementOfRoomAvgOrderByAggregateInput } from "../inputs/ArrangementOfRoomAvgOrderByAggregateInput";
import { ArrangementOfRoomCountOrderByAggregateInput } from "../inputs/ArrangementOfRoomCountOrderByAggregateInput";
import { ArrangementOfRoomMaxOrderByAggregateInput } from "../inputs/ArrangementOfRoomMaxOrderByAggregateInput";
import { ArrangementOfRoomMinOrderByAggregateInput } from "../inputs/ArrangementOfRoomMinOrderByAggregateInput";
import { ArrangementOfRoomSumOrderByAggregateInput } from "../inputs/ArrangementOfRoomSumOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ArrangementOfRoomOrderByWithAggregationInput", {
  isAbstract: true
})
export class ArrangementOfRoomOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  roomId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  arrangementId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  capacity?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  details?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  createdAt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  updatedAt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => ArrangementOfRoomCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: ArrangementOfRoomCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ArrangementOfRoomAvgOrderByAggregateInput, {
    nullable: true
  })
  _avg?: ArrangementOfRoomAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ArrangementOfRoomMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: ArrangementOfRoomMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ArrangementOfRoomMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: ArrangementOfRoomMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ArrangementOfRoomSumOrderByAggregateInput, {
    nullable: true
  })
  _sum?: ArrangementOfRoomSumOrderByAggregateInput | undefined;
}
