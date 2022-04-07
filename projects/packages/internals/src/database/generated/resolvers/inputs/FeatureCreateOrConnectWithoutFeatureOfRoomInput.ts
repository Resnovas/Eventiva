import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureCreateWithoutFeatureOfRoomInput } from "../inputs/FeatureCreateWithoutFeatureOfRoomInput";
import { FeatureWhereUniqueInput } from "../inputs/FeatureWhereUniqueInput";

@TypeGraphQL.InputType("FeatureCreateOrConnectWithoutFeatureOfRoomInput", {
  isAbstract: true
})
export class FeatureCreateOrConnectWithoutFeatureOfRoomInput {
  @TypeGraphQL.Field(_type => FeatureWhereUniqueInput, {
    nullable: false
  })
  where!: FeatureWhereUniqueInput;

  @TypeGraphQL.Field(_type => FeatureCreateWithoutFeatureOfRoomInput, {
    nullable: false
  })
  create!: FeatureCreateWithoutFeatureOfRoomInput;
}
