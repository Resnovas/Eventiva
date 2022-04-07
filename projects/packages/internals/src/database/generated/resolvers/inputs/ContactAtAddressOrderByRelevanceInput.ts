import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ContactAtAddressOrderByRelevanceFieldEnum } from "../../enums/ContactAtAddressOrderByRelevanceFieldEnum";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ContactAtAddressOrderByRelevanceInput", {
  isAbstract: true
})
export class ContactAtAddressOrderByRelevanceInput {
  @TypeGraphQL.Field(_type => [ContactAtAddressOrderByRelevanceFieldEnum], {
    nullable: false
  })
  fields!: Array<"accountId" | "addressId" | "jobTitle" | "phone" | "emailId">;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: false
  })
  sort!: "asc" | "desc";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  search!: string;
}
