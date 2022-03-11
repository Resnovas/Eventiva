import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmailOrderByRelevanceFieldEnum } from "../../enums/EmailOrderByRelevanceFieldEnum";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("EmailOrderByRelevanceInput", {
  isAbstract: true
})
export class EmailOrderByRelevanceInput {
  @TypeGraphQL.Field(_type => [EmailOrderByRelevanceFieldEnum], {
    nullable: false
  })
  fields!: Array<"id" | "domainId" | "email" | "accountId" | "path" | "imap_authUser" | "imap_authPass" | "imap_accessToken" | "imap_host" | "imap_port" | "imap_tslMinVersion" | "smtp_authUser" | "smtp_authPass" | "smtp_accessToken" | "smtp_host" | "smtp_port" | "smtp_tslMinVersion" | "oauth2_provider" | "oauth2_authUser" | "oauth2_accessToken" | "oauth2_refreshToken">;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: false
  })
  sort!: "asc" | "desc";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  search!: string;
}
