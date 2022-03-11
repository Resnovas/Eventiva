import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureCreateWithoutFeatureOfAddressInput } from "../inputs/FeatureCreateWithoutFeatureOfAddressInput";
import { FeatureUpdateWithoutFeatureOfAddressInput } from "../inputs/FeatureUpdateWithoutFeatureOfAddressInput";

@TypeGraphQL.InputType("FeatureUpsertWithoutFeatureOfAddressInput", {
  isAbstract: true
})
export class FeatureUpsertWithoutFeatureOfAddressInput {
  @TypeGraphQL.Field(_type => FeatureUpdateWithoutFeatureOfAddressInput, {
    nullable: false
  })
  update!: FeatureUpdateWithoutFeatureOfAddressInput;

  @TypeGraphQL.Field(_type => FeatureCreateWithoutFeatureOfAddressInput, {
    nullable: false
  })
  create!: FeatureCreateWithoutFeatureOfAddressInput;
}
