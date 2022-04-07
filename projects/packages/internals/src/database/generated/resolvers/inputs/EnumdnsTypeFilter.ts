import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { NestedEnumdnsTypeFilter } from "../inputs/NestedEnumdnsTypeFilter";
import { dnsType } from "../../enums/dnsType";

@TypeGraphQL.InputType("EnumdnsTypeFilter", {
  isAbstract: true
})
export class EnumdnsTypeFilter {
  @TypeGraphQL.Field(_type => dnsType, {
    nullable: true
  })
  equals?: "TXT" | "CNAME" | undefined;

  @TypeGraphQL.Field(_type => [dnsType], {
    nullable: true
  })
  in?: Array<"TXT" | "CNAME"> | undefined;

  @TypeGraphQL.Field(_type => [dnsType], {
    nullable: true
  })
  notIn?: Array<"TXT" | "CNAME"> | undefined;

  @TypeGraphQL.Field(_type => NestedEnumdnsTypeFilter, {
    nullable: true
  })
  not?: NestedEnumdnsTypeFilter | undefined;
}
