import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ArrangementOfRoomOrderByWithAggregationInput } from "../../../inputs/ArrangementOfRoomOrderByWithAggregationInput";
import { ArrangementOfRoomScalarWhereWithAggregatesInput } from "../../../inputs/ArrangementOfRoomScalarWhereWithAggregatesInput";
import { ArrangementOfRoomWhereInput } from "../../../inputs/ArrangementOfRoomWhereInput";
import { ArrangementOfRoomScalarFieldEnum } from "../../../../enums/ArrangementOfRoomScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByArrangementOfRoomArgs {
  @TypeGraphQL.Field(_type => ArrangementOfRoomWhereInput, {
    nullable: true
  })
  where?: ArrangementOfRoomWhereInput | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: ArrangementOfRoomOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"roomId" | "arrangementId" | "capacity" | "details" | "createdAt" | "updatedAt" | "deletedDate" | "deleted">;

  @TypeGraphQL.Field(_type => ArrangementOfRoomScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: ArrangementOfRoomScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
