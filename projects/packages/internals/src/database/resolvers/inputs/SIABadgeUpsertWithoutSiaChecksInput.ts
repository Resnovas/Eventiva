import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIABadgeCreateWithoutSiaChecksInput } from "../inputs/SIABadgeCreateWithoutSiaChecksInput";
import { SIABadgeUpdateWithoutSiaChecksInput } from "../inputs/SIABadgeUpdateWithoutSiaChecksInput";

@TypeGraphQL.InputType("SIABadgeUpsertWithoutSiaChecksInput", {
  isAbstract: true
})
export class SIABadgeUpsertWithoutSiaChecksInput {
  @TypeGraphQL.Field(_type => SIABadgeUpdateWithoutSiaChecksInput, {
    nullable: false
  })
  update!: SIABadgeUpdateWithoutSiaChecksInput;

  @TypeGraphQL.Field(_type => SIABadgeCreateWithoutSiaChecksInput, {
    nullable: false
  })
  create!: SIABadgeCreateWithoutSiaChecksInput;
}
