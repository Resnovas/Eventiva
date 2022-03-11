import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("FeatureOfAddressAddressIdFeatureIdCompoundUniqueInput", {
  isAbstract: true
})
export class FeatureOfAddressAddressIdFeatureIdCompoundUniqueInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  addressId!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  featureId!: string;
}
