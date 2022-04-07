import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIABadgeCreateOrConnectWithoutSiaChecksInput } from "../inputs/SIABadgeCreateOrConnectWithoutSiaChecksInput";
import { SIABadgeCreateWithoutSiaChecksInput } from "../inputs/SIABadgeCreateWithoutSiaChecksInput";
import { SIABadgeWhereUniqueInput } from "../inputs/SIABadgeWhereUniqueInput";

@TypeGraphQL.InputType("SIABadgeCreateNestedOneWithoutSiaChecksInput", {
  isAbstract: true
})
export class SIABadgeCreateNestedOneWithoutSiaChecksInput {
  @TypeGraphQL.Field(_type => SIABadgeCreateWithoutSiaChecksInput, {
    nullable: true
  })
  create?: SIABadgeCreateWithoutSiaChecksInput | undefined;

  @TypeGraphQL.Field(_type => SIABadgeCreateOrConnectWithoutSiaChecksInput, {
    nullable: true
  })
  connectOrCreate?: SIABadgeCreateOrConnectWithoutSiaChecksInput | undefined;

  @TypeGraphQL.Field(_type => SIABadgeWhereUniqueInput, {
    nullable: true
  })
  connect?: SIABadgeWhereUniqueInput | undefined;
}
