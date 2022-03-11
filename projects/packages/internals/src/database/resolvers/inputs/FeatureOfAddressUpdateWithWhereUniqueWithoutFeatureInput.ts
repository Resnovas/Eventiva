import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfAddressUpdateWithoutFeatureInput } from "../inputs/FeatureOfAddressUpdateWithoutFeatureInput";
import { FeatureOfAddressWhereUniqueInput } from "../inputs/FeatureOfAddressWhereUniqueInput";

@TypeGraphQL.InputType("FeatureOfAddressUpdateWithWhereUniqueWithoutFeatureInput", {
  isAbstract: true
})
export class FeatureOfAddressUpdateWithWhereUniqueWithoutFeatureInput {
  @TypeGraphQL.Field(_type => FeatureOfAddressWhereUniqueInput, {
    nullable: false
  })
  where!: FeatureOfAddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => FeatureOfAddressUpdateWithoutFeatureInput, {
    nullable: false
  })
  data!: FeatureOfAddressUpdateWithoutFeatureInput;
}
