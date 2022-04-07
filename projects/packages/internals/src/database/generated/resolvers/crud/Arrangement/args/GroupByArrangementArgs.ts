import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ArrangementOrderByWithAggregationInput } from "../../../inputs/ArrangementOrderByWithAggregationInput";
import { ArrangementScalarWhereWithAggregatesInput } from "../../../inputs/ArrangementScalarWhereWithAggregatesInput";
import { ArrangementWhereInput } from "../../../inputs/ArrangementWhereInput";
import { ArrangementScalarFieldEnum } from "../../../../enums/ArrangementScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByArrangementArgs {
  @TypeGraphQL.Field(_type => ArrangementWhereInput, {
    nullable: true
  })
  where?: ArrangementWhereInput | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: ArrangementOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [ArrangementScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "createdAt" | "updatedAt" | "name" | "icon" | "details" | "deletedDate" | "deleted">;

  @TypeGraphQL.Field(_type => ArrangementScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: ArrangementScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
