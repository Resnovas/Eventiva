import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIABadgeUpdateWithoutAccountInput } from "../inputs/SIABadgeUpdateWithoutAccountInput";
import { SIABadgeWhereUniqueInput } from "../inputs/SIABadgeWhereUniqueInput";

@TypeGraphQL.InputType("SIABadgeUpdateWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class SIABadgeUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => SIABadgeWhereUniqueInput, {
    nullable: false
  })
  where!: SIABadgeWhereUniqueInput;

  @TypeGraphQL.Field(_type => SIABadgeUpdateWithoutAccountInput, {
    nullable: false
  })
  data!: SIABadgeUpdateWithoutAccountInput;
}
