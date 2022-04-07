import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SaltOrderByRelevanceFieldEnum } from "../../enums/SaltOrderByRelevanceFieldEnum";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("SaltOrderByRelevanceInput", {
  isAbstract: true
})
export class SaltOrderByRelevanceInput {
  @TypeGraphQL.Field(_type => [SaltOrderByRelevanceFieldEnum], {
    nullable: false
  })
  fields!: Array<"id" | "salt" | "accountID">;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: false
  })
  sort!: "asc" | "desc";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  search!: string;
}
