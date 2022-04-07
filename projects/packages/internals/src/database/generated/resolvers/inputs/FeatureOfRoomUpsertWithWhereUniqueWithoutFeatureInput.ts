import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfRoomCreateWithoutFeatureInput } from "../inputs/FeatureOfRoomCreateWithoutFeatureInput";
import { FeatureOfRoomUpdateWithoutFeatureInput } from "../inputs/FeatureOfRoomUpdateWithoutFeatureInput";
import { FeatureOfRoomWhereUniqueInput } from "../inputs/FeatureOfRoomWhereUniqueInput";

@TypeGraphQL.InputType("FeatureOfRoomUpsertWithWhereUniqueWithoutFeatureInput", {
  isAbstract: true
})
export class FeatureOfRoomUpsertWithWhereUniqueWithoutFeatureInput {
  @TypeGraphQL.Field(_type => FeatureOfRoomWhereUniqueInput, {
    nullable: false
  })
  where!: FeatureOfRoomWhereUniqueInput;

  @TypeGraphQL.Field(_type => FeatureOfRoomUpdateWithoutFeatureInput, {
    nullable: false
  })
  update!: FeatureOfRoomUpdateWithoutFeatureInput;

  @TypeGraphQL.Field(_type => FeatureOfRoomCreateWithoutFeatureInput, {
    nullable: false
  })
  create!: FeatureOfRoomCreateWithoutFeatureInput;
}
