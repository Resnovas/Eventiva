import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureOfRoomUpdateManyMutationInput } from "../../../inputs/FeatureOfRoomUpdateManyMutationInput";
import { FeatureOfRoomWhereInput } from "../../../inputs/FeatureOfRoomWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyFeatureOfRoomArgs {
  @TypeGraphQL.Field(_type => FeatureOfRoomUpdateManyMutationInput, {
    nullable: false
  })
  data!: FeatureOfRoomUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => FeatureOfRoomWhereInput, {
    nullable: true
  })
  where?: FeatureOfRoomWhereInput | undefined;
}
