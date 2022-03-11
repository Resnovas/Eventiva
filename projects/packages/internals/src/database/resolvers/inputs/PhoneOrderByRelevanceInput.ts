import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PhoneOrderByRelevanceFieldEnum } from "../../enums/PhoneOrderByRelevanceFieldEnum";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("PhoneOrderByRelevanceInput", {
  isAbstract: true
})
export class PhoneOrderByRelevanceInput {
  @TypeGraphQL.Field(_type => [PhoneOrderByRelevanceFieldEnum], {
    nullable: false
  })
  fields!: Array<"id" | "accountId" | "addressId" | "phone">;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: false
  })
  sort!: "asc" | "desc";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  search!: string;
}
