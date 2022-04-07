import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmployersOnAccountOrderByRelevanceFieldEnum } from "../../enums/EmployersOnAccountOrderByRelevanceFieldEnum";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("EmployersOnAccountOrderByRelevanceInput", {
  isAbstract: true
})
export class EmployersOnAccountOrderByRelevanceInput {
  @TypeGraphQL.Field(_type => [EmployersOnAccountOrderByRelevanceFieldEnum], {
    nullable: false
  })
  fields!: Array<"accountId" | "employerId">;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: false
  })
  sort!: "asc" | "desc";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  search!: string;
}
