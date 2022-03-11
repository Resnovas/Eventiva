import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressWhereInput } from "../inputs/AddressWhereInput";

@TypeGraphQL.InputType("AddressRelationFilter", {
  isAbstract: true
})
export class AddressRelationFilter {
  @TypeGraphQL.Field(_type => AddressWhereInput, {
    nullable: true
  })
  is?: AddressWhereInput | undefined;

  @TypeGraphQL.Field(_type => AddressWhereInput, {
    nullable: true
  })
  isNot?: AddressWhereInput | undefined;
}
