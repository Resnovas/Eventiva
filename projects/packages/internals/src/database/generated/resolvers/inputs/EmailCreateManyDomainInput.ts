import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("EmailCreateManyDomainInput", {
  isAbstract: true
})
export class EmailCreateManyDomainInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  id?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  email!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  accountId?: string | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  verified?: boolean | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  public?: boolean | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  primary?: boolean | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  path?: string | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  copy?: boolean | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  notifyFrom?: Date | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  imap_authUser?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  imap_authPass?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  imap_accessToken?: string | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  imap_authServer?: boolean | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  imap_host?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  imap_port?: string | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  imap_secure?: boolean | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  imap_tslRejectUnauthorized?: boolean | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  imap_tslMinVersion?: string | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  imap_resyncDelay?: number | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  smtp_authUser?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  smtp_authPass?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  smtp_accessToken?: string | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  smtp_authServer?: boolean | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  smtp_host?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  smtp_port?: string | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  smtp_secure?: boolean | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  smtp_tslRejectUnauthorized?: boolean | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  smtp_tslMinVersion?: string | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  oauth2_authorize?: boolean | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  oauth2_provider?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  oauth2_authUser?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  oauth2_accessToken?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  oauth2_refreshToken?: string | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  oauth2_expires?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate?: Date | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted?: boolean | undefined;
}
