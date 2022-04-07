import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfRoomWhereInput } from "../inputs/FeatureOfRoomWhereInput";

@TypeGraphQL.InputType("FeatureOfRoomListRelationFilter", {
  isAbstract: true
})
export class FeatureOfRoomListRelationFilter {
  @TypeGraphQL.Field(_type => FeatureOfRoomWhereInput, {
    nullable: true
  })
  every?: FeatureOfRoomWhereInput | undefined;

  @TypeGraphQL.Field(_type => FeatureOfRoomWhereInput, {
    nullable: true
  })
  some?: FeatureOfRoomWhereInput | undefined;

  @TypeGraphQL.Field(_type => FeatureOfRoomWhereInput, {
    nullable: true
  })
  none?: FeatureOfRoomWhereInput | undefined;
}
