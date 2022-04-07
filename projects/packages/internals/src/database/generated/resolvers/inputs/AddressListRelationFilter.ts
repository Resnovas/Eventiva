import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressWhereInput } from "../inputs/AddressWhereInput";

@TypeGraphQL.InputType("AddressListRelationFilter", {
  isAbstract: true
})
export class AddressListRelationFilter {
  @TypeGraphQL.Field(_type => AddressWhereInput, {
    nullable: true
  })
  every?: AddressWhereInput | undefined;

  @TypeGraphQL.Field(_type => AddressWhereInput, {
    nullable: true
  })
  some?: AddressWhereInput | undefined;

  @TypeGraphQL.Field(_type => AddressWhereInput, {
    nullable: true
  })
  none?: AddressWhereInput | undefined;
}
