import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfAddressCreateWithoutFeatureInput } from "../inputs/FeatureOfAddressCreateWithoutFeatureInput";
import { FeatureOfAddressWhereUniqueInput } from "../inputs/FeatureOfAddressWhereUniqueInput";

@TypeGraphQL.InputType("FeatureOfAddressCreateOrConnectWithoutFeatureInput", {
  isAbstract: true
})
export class FeatureOfAddressCreateOrConnectWithoutFeatureInput {
  @TypeGraphQL.Field(_type => FeatureOfAddressWhereUniqueInput, {
    nullable: false
  })
  where!: FeatureOfAddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => FeatureOfAddressCreateWithoutFeatureInput, {
    nullable: false
  })
  create!: FeatureOfAddressCreateWithoutFeatureInput;
}
