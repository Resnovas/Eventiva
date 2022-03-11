import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfRoomCreateManyRoomInputEnvelope } from "../inputs/FeatureOfRoomCreateManyRoomInputEnvelope";
import { FeatureOfRoomCreateOrConnectWithoutRoomInput } from "../inputs/FeatureOfRoomCreateOrConnectWithoutRoomInput";
import { FeatureOfRoomCreateWithoutRoomInput } from "../inputs/FeatureOfRoomCreateWithoutRoomInput";
import { FeatureOfRoomWhereUniqueInput } from "../inputs/FeatureOfRoomWhereUniqueInput";

@TypeGraphQL.InputType("FeatureOfRoomCreateNestedManyWithoutRoomInput", {
  isAbstract: true
})
export class FeatureOfRoomCreateNestedManyWithoutRoomInput {
  @TypeGraphQL.Field(_type => [FeatureOfRoomCreateWithoutRoomInput], {
    nullable: true
  })
  create?: FeatureOfRoomCreateWithoutRoomInput[] | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfRoomCreateOrConnectWithoutRoomInput], {
    nullable: true
  })
  connectOrCreate?: FeatureOfRoomCreateOrConnectWithoutRoomInput[] | undefined;

  @TypeGraphQL.Field(_type => FeatureOfRoomCreateManyRoomInputEnvelope, {
    nullable: true
  })
  createMany?: FeatureOfRoomCreateManyRoomInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfRoomWhereUniqueInput], {
    nullable: true
  })
  connect?: FeatureOfRoomWhereUniqueInput[] | undefined;
}
