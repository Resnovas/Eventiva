import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureOfRoomWhereUniqueInput } from "../../../inputs/FeatureOfRoomWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindUniqueFeatureOfRoomArgs {
  @TypeGraphQL.Field(_type => FeatureOfRoomWhereUniqueInput, {
    nullable: false
  })
  where!: FeatureOfRoomWhereUniqueInput;
}
