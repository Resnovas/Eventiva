import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfAddressCreateManyAddressInput } from "../inputs/FeatureOfAddressCreateManyAddressInput";

@TypeGraphQL.InputType("FeatureOfAddressCreateManyAddressInputEnvelope", {
  isAbstract: true
})
export class FeatureOfAddressCreateManyAddressInputEnvelope {
  @TypeGraphQL.Field(_type => [FeatureOfAddressCreateManyAddressInput], {
    nullable: false
  })
  data!: FeatureOfAddressCreateManyAddressInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
