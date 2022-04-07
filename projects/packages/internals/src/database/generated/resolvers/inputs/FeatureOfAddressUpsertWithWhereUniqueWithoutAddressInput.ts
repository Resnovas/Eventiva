import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfAddressCreateWithoutAddressInput } from "../inputs/FeatureOfAddressCreateWithoutAddressInput";
import { FeatureOfAddressUpdateWithoutAddressInput } from "../inputs/FeatureOfAddressUpdateWithoutAddressInput";
import { FeatureOfAddressWhereUniqueInput } from "../inputs/FeatureOfAddressWhereUniqueInput";

@TypeGraphQL.InputType("FeatureOfAddressUpsertWithWhereUniqueWithoutAddressInput", {
  isAbstract: true
})
export class FeatureOfAddressUpsertWithWhereUniqueWithoutAddressInput {
  @TypeGraphQL.Field(_type => FeatureOfAddressWhereUniqueInput, {
    nullable: false
  })
  where!: FeatureOfAddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => FeatureOfAddressUpdateWithoutAddressInput, {
    nullable: false
  })
  update!: FeatureOfAddressUpdateWithoutAddressInput;

  @TypeGraphQL.Field(_type => FeatureOfAddressCreateWithoutAddressInput, {
    nullable: false
  })
  create!: FeatureOfAddressCreateWithoutAddressInput;
}
