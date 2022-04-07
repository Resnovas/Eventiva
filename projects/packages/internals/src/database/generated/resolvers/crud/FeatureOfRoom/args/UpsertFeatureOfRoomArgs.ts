import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureOfRoomCreateInput } from "../../../inputs/FeatureOfRoomCreateInput";
import { FeatureOfRoomUpdateInput } from "../../../inputs/FeatureOfRoomUpdateInput";
import { FeatureOfRoomWhereUniqueInput } from "../../../inputs/FeatureOfRoomWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertFeatureOfRoomArgs {
  @TypeGraphQL.Field(_type => FeatureOfRoomWhereUniqueInput, {
    nullable: false
  })
  where!: FeatureOfRoomWhereUniqueInput;

  @TypeGraphQL.Field(_type => FeatureOfRoomCreateInput, {
    nullable: false
  })
  create!: FeatureOfRoomCreateInput;

  @TypeGraphQL.Field(_type => FeatureOfRoomUpdateInput, {
    nullable: false
  })
  update!: FeatureOfRoomUpdateInput;
}
