import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIABadgeCreateWithoutSiaChecksInput } from "../inputs/SIABadgeCreateWithoutSiaChecksInput";
import { SIABadgeWhereUniqueInput } from "../inputs/SIABadgeWhereUniqueInput";

@TypeGraphQL.InputType("SIABadgeCreateOrConnectWithoutSiaChecksInput", {
  isAbstract: true
})
export class SIABadgeCreateOrConnectWithoutSiaChecksInput {
  @TypeGraphQL.Field(_type => SIABadgeWhereUniqueInput, {
    nullable: false
  })
  where!: SIABadgeWhereUniqueInput;

  @TypeGraphQL.Field(_type => SIABadgeCreateWithoutSiaChecksInput, {
    nullable: false
  })
  create!: SIABadgeCreateWithoutSiaChecksInput;
}
