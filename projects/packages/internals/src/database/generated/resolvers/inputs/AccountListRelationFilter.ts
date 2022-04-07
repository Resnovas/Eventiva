import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountWhereInput } from "../inputs/AccountWhereInput";

@TypeGraphQL.InputType("AccountListRelationFilter", {
  isAbstract: true
})
export class AccountListRelationFilter {
  @TypeGraphQL.Field(_type => AccountWhereInput, {
    nullable: true
  })
  every?: AccountWhereInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereInput, {
    nullable: true
  })
  some?: AccountWhereInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereInput, {
    nullable: true
  })
  none?: AccountWhereInput | undefined;
}
