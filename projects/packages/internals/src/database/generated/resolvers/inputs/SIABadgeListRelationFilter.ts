import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIABadgeWhereInput } from "../inputs/SIABadgeWhereInput";

@TypeGraphQL.InputType("SIABadgeListRelationFilter", {
  isAbstract: true
})
export class SIABadgeListRelationFilter {
  @TypeGraphQL.Field(_type => SIABadgeWhereInput, {
    nullable: true
  })
  every?: SIABadgeWhereInput | undefined;

  @TypeGraphQL.Field(_type => SIABadgeWhereInput, {
    nullable: true
  })
  some?: SIABadgeWhereInput | undefined;

  @TypeGraphQL.Field(_type => SIABadgeWhereInput, {
    nullable: true
  })
  none?: SIABadgeWhereInput | undefined;
}
