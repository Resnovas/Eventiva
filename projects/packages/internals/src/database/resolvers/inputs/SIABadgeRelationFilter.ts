import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIABadgeWhereInput } from "../inputs/SIABadgeWhereInput";

@TypeGraphQL.InputType("SIABadgeRelationFilter", {
  isAbstract: true
})
export class SIABadgeRelationFilter {
  @TypeGraphQL.Field(_type => SIABadgeWhereInput, {
    nullable: true
  })
  is?: SIABadgeWhereInput | undefined;

  @TypeGraphQL.Field(_type => SIABadgeWhereInput, {
    nullable: true
  })
  isNot?: SIABadgeWhereInput | undefined;
}
