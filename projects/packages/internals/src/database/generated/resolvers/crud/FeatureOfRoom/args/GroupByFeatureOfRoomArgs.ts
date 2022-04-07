import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureOfRoomOrderByWithAggregationInput } from "../../../inputs/FeatureOfRoomOrderByWithAggregationInput";
import { FeatureOfRoomScalarWhereWithAggregatesInput } from "../../../inputs/FeatureOfRoomScalarWhereWithAggregatesInput";
import { FeatureOfRoomWhereInput } from "../../../inputs/FeatureOfRoomWhereInput";
import { FeatureOfRoomScalarFieldEnum } from "../../../../enums/FeatureOfRoomScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByFeatureOfRoomArgs {
  @TypeGraphQL.Field(_type => FeatureOfRoomWhereInput, {
    nullable: true
  })
  where?: FeatureOfRoomWhereInput | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfRoomOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: FeatureOfRoomOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfRoomScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"roomId" | "featureId" | "data" | "createdAt" | "updatedAt" | "deletedDate" | "deleted">;

  @TypeGraphQL.Field(_type => FeatureOfRoomScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: FeatureOfRoomScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
