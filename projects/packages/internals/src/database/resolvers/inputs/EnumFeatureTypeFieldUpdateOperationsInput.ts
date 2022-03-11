import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureType } from "../../enums/FeatureType";

@TypeGraphQL.InputType("EnumFeatureTypeFieldUpdateOperationsInput", {
  isAbstract: true
})
export class EnumFeatureTypeFieldUpdateOperationsInput {
  @TypeGraphQL.Field(_type => FeatureType, {
    nullable: true
  })
  set?: "STRING" | "BOOLEAN" | "NUMBER" | undefined;
}
