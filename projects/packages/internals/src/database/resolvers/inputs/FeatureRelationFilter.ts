import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureWhereInput } from "../inputs/FeatureWhereInput";

@TypeGraphQL.InputType("FeatureRelationFilter", {
  isAbstract: true
})
export class FeatureRelationFilter {
  @TypeGraphQL.Field(_type => FeatureWhereInput, {
    nullable: true
  })
  is?: FeatureWhereInput | undefined;

  @TypeGraphQL.Field(_type => FeatureWhereInput, {
    nullable: true
  })
  isNot?: FeatureWhereInput | undefined;
}
