import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { dnsType } from "../../enums/dnsType";

@TypeGraphQL.InputType("NestedEnumdnsTypeFilter", {
  isAbstract: true
})
export class NestedEnumdnsTypeFilter {
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
