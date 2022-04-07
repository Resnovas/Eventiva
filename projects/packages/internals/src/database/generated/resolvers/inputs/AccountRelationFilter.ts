import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountWhereInput } from "../inputs/AccountWhereInput";

@TypeGraphQL.InputType("AccountRelationFilter", {
  isAbstract: true
})
export class AccountRelationFilter {
  @TypeGraphQL.Field(_type => AccountWhereInput, {
    nullable: true
  })
  is?: AccountWhereInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereInput, {
    nullable: true
  })
  isNot?: AccountWhereInput | undefined;
}
