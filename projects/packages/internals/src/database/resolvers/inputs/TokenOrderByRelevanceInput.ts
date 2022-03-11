import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SortOrder } from "../../enums/SortOrder";
import { TokenOrderByRelevanceFieldEnum } from "../../enums/TokenOrderByRelevanceFieldEnum";

@TypeGraphQL.InputType("TokenOrderByRelevanceInput", {
  isAbstract: true
})
export class TokenOrderByRelevanceInput {
  @TypeGraphQL.Field(_type => [TokenOrderByRelevanceFieldEnum], {
    nullable: false
  })
  fields!: Array<"id" | "value" | "apiToken">;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: false
  })
  sort!: "asc" | "desc";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  search!: string;
}
