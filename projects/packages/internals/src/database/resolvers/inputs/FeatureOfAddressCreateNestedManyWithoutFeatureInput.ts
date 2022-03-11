import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfAddressCreateManyFeatureInputEnvelope } from "../inputs/FeatureOfAddressCreateManyFeatureInputEnvelope";
import { FeatureOfAddressCreateOrConnectWithoutFeatureInput } from "../inputs/FeatureOfAddressCreateOrConnectWithoutFeatureInput";
import { FeatureOfAddressCreateWithoutFeatureInput } from "../inputs/FeatureOfAddressCreateWithoutFeatureInput";
import { FeatureOfAddressWhereUniqueInput } from "../inputs/FeatureOfAddressWhereUniqueInput";

@TypeGraphQL.InputType("FeatureOfAddressCreateNestedManyWithoutFeatureInput", {
  isAbstract: true
})
export class FeatureOfAddressCreateNestedManyWithoutFeatureInput {
  @TypeGraphQL.Field(_type => [FeatureOfAddressCreateWithoutFeatureInput], {
    nullable: true
  })
  create?: FeatureOfAddressCreateWithoutFeatureInput[] | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfAddressCreateOrConnectWithoutFeatureInput], {
    nullable: true
  })
  connectOrCreate?: FeatureOfAddressCreateOrConnectWithoutFeatureInput[] | undefined;

  @TypeGraphQL.Field(_type => FeatureOfAddressCreateManyFeatureInputEnvelope, {
    nullable: true
  })
  createMany?: FeatureOfAddressCreateManyFeatureInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfAddressWhereUniqueInput], {
    nullable: true
  })
  connect?: FeatureOfAddressWhereUniqueInput[] | undefined;
}
