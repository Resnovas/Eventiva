import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfAddressCreateManyAddressInputEnvelope } from "../inputs/FeatureOfAddressCreateManyAddressInputEnvelope";
import { FeatureOfAddressCreateOrConnectWithoutAddressInput } from "../inputs/FeatureOfAddressCreateOrConnectWithoutAddressInput";
import { FeatureOfAddressCreateWithoutAddressInput } from "../inputs/FeatureOfAddressCreateWithoutAddressInput";
import { FeatureOfAddressWhereUniqueInput } from "../inputs/FeatureOfAddressWhereUniqueInput";

@TypeGraphQL.InputType("FeatureOfAddressCreateNestedManyWithoutAddressInput", {
  isAbstract: true
})
export class FeatureOfAddressCreateNestedManyWithoutAddressInput {
  @TypeGraphQL.Field(_type => [FeatureOfAddressCreateWithoutAddressInput], {
    nullable: true
  })
  create?: FeatureOfAddressCreateWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfAddressCreateOrConnectWithoutAddressInput], {
    nullable: true
  })
  connectOrCreate?: FeatureOfAddressCreateOrConnectWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => FeatureOfAddressCreateManyAddressInputEnvelope, {
    nullable: true
  })
  createMany?: FeatureOfAddressCreateManyAddressInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfAddressWhereUniqueInput], {
    nullable: true
  })
  connect?: FeatureOfAddressWhereUniqueInput[] | undefined;
}
