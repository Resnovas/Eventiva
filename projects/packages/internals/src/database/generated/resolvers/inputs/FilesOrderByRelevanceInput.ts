import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FilesOrderByRelevanceFieldEnum } from "../../enums/FilesOrderByRelevanceFieldEnum";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("FilesOrderByRelevanceInput", {
  isAbstract: true
})
export class FilesOrderByRelevanceInput {
  @TypeGraphQL.Field(_type => [FilesOrderByRelevanceFieldEnum], {
    nullable: false
  })
  fields!: Array<"id" | "name" | "rtwId">;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: false
  })
  sort!: "asc" | "desc";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  search!: string;
}
