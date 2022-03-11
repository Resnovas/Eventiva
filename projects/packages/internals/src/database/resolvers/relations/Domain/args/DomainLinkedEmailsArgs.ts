import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EmailOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/EmailOrderByWithRelationAndSearchRelevanceInput";
import { EmailWhereInput } from "../../../inputs/EmailWhereInput";
import { EmailWhereUniqueInput } from "../../../inputs/EmailWhereUniqueInput";
import { EmailScalarFieldEnum } from "../../../../enums/EmailScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class DomainLinkedEmailsArgs {
  @TypeGraphQL.Field(_type => EmailWhereInput, {
    nullable: true
  })
  where?: EmailWhereInput | undefined;

  @TypeGraphQL.Field(_type => [EmailOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: EmailOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => EmailWhereUniqueInput, {
    nullable: true
  })
  cursor?: EmailWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [EmailScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"id" | "domainId" | "email" | "accountId" | "verified" | "public" | "primary" | "path" | "copy" | "notifyFrom" | "imap_authUser" | "imap_authPass" | "imap_accessToken" | "imap_authServer" | "imap_host" | "imap_port" | "imap_secure" | "imap_tslRejectUnauthorized" | "imap_tslMinVersion" | "imap_resyncDelay" | "smtp_authUser" | "smtp_authPass" | "smtp_accessToken" | "smtp_authServer" | "smtp_host" | "smtp_port" | "smtp_secure" | "smtp_tslRejectUnauthorized" | "smtp_tslMinVersion" | "oauth2_authorize" | "oauth2_provider" | "oauth2_authUser" | "oauth2_accessToken" | "oauth2_refreshToken" | "oauth2_expires" | "createdAt" | "updatedAt" | "deleted"> | undefined;
}
