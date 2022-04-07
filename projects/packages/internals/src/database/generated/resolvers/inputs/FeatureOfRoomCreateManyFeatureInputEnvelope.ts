import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfRoomCreateManyFeatureInput } from "../inputs/FeatureOfRoomCreateManyFeatureInput";

@TypeGraphQL.InputType("FeatureOfRoomCreateManyFeatureInputEnvelope", {
  isAbstract: true
})
export class FeatureOfRoomCreateManyFeatureInputEnvelope {
  @TypeGraphQL.Field(_type => [FeatureOfRoomCreateManyFeatureInput], {
    nullable: false
  })
  data!: FeatureOfRoomCreateManyFeatureInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
