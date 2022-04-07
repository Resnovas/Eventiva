import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureCreateWithoutFeatureOfRoomInput } from "../inputs/FeatureCreateWithoutFeatureOfRoomInput";
import { FeatureUpdateWithoutFeatureOfRoomInput } from "../inputs/FeatureUpdateWithoutFeatureOfRoomInput";

@TypeGraphQL.InputType("FeatureUpsertWithoutFeatureOfRoomInput", {
  isAbstract: true
})
export class FeatureUpsertWithoutFeatureOfRoomInput {
  @TypeGraphQL.Field(_type => FeatureUpdateWithoutFeatureOfRoomInput, {
    nullable: false
  })
  update!: FeatureUpdateWithoutFeatureOfRoomInput;

  @TypeGraphQL.Field(_type => FeatureCreateWithoutFeatureOfRoomInput, {
    nullable: false
  })
  create!: FeatureCreateWithoutFeatureOfRoomInput;
}
