import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureCreateOrConnectWithoutFeatureOfAddressInput } from "../inputs/FeatureCreateOrConnectWithoutFeatureOfAddressInput";
import { FeatureCreateWithoutFeatureOfAddressInput } from "../inputs/FeatureCreateWithoutFeatureOfAddressInput";
import { FeatureUpdateWithoutFeatureOfAddressInput } from "../inputs/FeatureUpdateWithoutFeatureOfAddressInput";
import { FeatureUpsertWithoutFeatureOfAddressInput } from "../inputs/FeatureUpsertWithoutFeatureOfAddressInput";
import { FeatureWhereUniqueInput } from "../inputs/FeatureWhereUniqueInput";

@TypeGraphQL.InputType("FeatureUpdateOneRequiredWithoutFeatureOfAddressInput", {
  isAbstract: true
})
export class FeatureUpdateOneRequiredWithoutFeatureOfAddressInput {
  @TypeGraphQL.Field(_type => FeatureCreateWithoutFeatureOfAddressInput, {
    nullable: true
  })
  create?: FeatureCreateWithoutFeatureOfAddressInput | undefined;

  @TypeGraphQL.Field(_type => FeatureCreateOrConnectWithoutFeatureOfAddressInput, {
    nullable: true
  })
  connectOrCreate?: FeatureCreateOrConnectWithoutFeatureOfAddressInput | undefined;

  @TypeGraphQL.Field(_type => FeatureUpsertWithoutFeatureOfAddressInput, {
    nullable: true
  })
  upsert?: FeatureUpsertWithoutFeatureOfAddressInput | undefined;

  @TypeGraphQL.Field(_type => FeatureWhereUniqueInput, {
    nullable: true
  })
  connect?: FeatureWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => FeatureUpdateWithoutFeatureOfAddressInput, {
    nullable: true
  })
  update?: FeatureUpdateWithoutFeatureOfAddressInput | undefined;
}
