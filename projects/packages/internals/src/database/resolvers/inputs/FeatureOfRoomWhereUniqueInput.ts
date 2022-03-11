import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfRoomRoomIdFeatureIdCompoundUniqueInput } from "../inputs/FeatureOfRoomRoomIdFeatureIdCompoundUniqueInput";

@TypeGraphQL.InputType("FeatureOfRoomWhereUniqueInput", {
  isAbstract: true
})
export class FeatureOfRoomWhereUniqueInput {
  @TypeGraphQL.Field(_type => FeatureOfRoomRoomIdFeatureIdCompoundUniqueInput, {
    nullable: true
  })
  roomId_featureId?: FeatureOfRoomRoomIdFeatureIdCompoundUniqueInput | undefined;
}
