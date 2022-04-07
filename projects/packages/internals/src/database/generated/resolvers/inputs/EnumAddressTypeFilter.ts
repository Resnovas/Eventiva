import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { NestedEnumAddressTypeFilter } from "../inputs/NestedEnumAddressTypeFilter";
import { AddressType } from "../../enums/AddressType";

@TypeGraphQL.InputType("EnumAddressTypeFilter", {
  isAbstract: true
})
export class EnumAddressTypeFilter {
  @TypeGraphQL.Field(_type => AddressType, {
    nullable: true
  })
  equals?: "PERSONAL" | "BUSINESS" | undefined;

  @TypeGraphQL.Field(_type => [AddressType], {
    nullable: true
  })
  in?: Array<"PERSONAL" | "BUSINESS"> | undefined;

  @TypeGraphQL.Field(_type => [AddressType], {
    nullable: true
  })
  notIn?: Array<"PERSONAL" | "BUSINESS"> | undefined;

  @TypeGraphQL.Field(_type => NestedEnumAddressTypeFilter, {
    nullable: true
  })
  not?: NestedEnumAddressTypeFilter | undefined;
}
