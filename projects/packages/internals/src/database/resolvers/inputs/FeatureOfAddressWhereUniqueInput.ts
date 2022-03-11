import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfAddressAddressIdFeatureIdCompoundUniqueInput } from "../inputs/FeatureOfAddressAddressIdFeatureIdCompoundUniqueInput";

@TypeGraphQL.InputType("FeatureOfAddressWhereUniqueInput", {
  isAbstract: true
})
export class FeatureOfAddressWhereUniqueInput {
  @TypeGraphQL.Field(_type => FeatureOfAddressAddressIdFeatureIdCompoundUniqueInput, {
    nullable: true
  })
  addressId_featureId?: FeatureOfAddressAddressIdFeatureIdCompoundUniqueInput | undefined;
}
