import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmailAvgAggregate } from "../outputs/EmailAvgAggregate";
import { EmailCountAggregate } from "../outputs/EmailCountAggregate";
import { EmailMaxAggregate } from "../outputs/EmailMaxAggregate";
import { EmailMinAggregate } from "../outputs/EmailMinAggregate";
import { EmailSumAggregate } from "../outputs/EmailSumAggregate";

@TypeGraphQL.ObjectType("EmailGroupBy", {
  isAbstract: true
})
export class EmailGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  domainId!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  email!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  accountId!: string | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  verified!: boolean;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  public!: boolean;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  primary!: boolean;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  path!: string | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  copy!: boolean;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  notifyFrom!: Date | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  imap_authUser!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  imap_authPass!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  imap_accessToken!: string | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  imap_authServer!: boolean | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  imap_host!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  imap_port!: string | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  imap_secure!: boolean | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  imap_tslRejectUnauthorized!: boolean | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  imap_tslMinVersion!: string | null;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  imap_resyncDelay!: number;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  smtp_authUser!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  smtp_authPass!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  smtp_accessToken!: string | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  smtp_authServer!: boolean | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  smtp_host!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  smtp_port!: string | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  smtp_secure!: boolean | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  smtp_tslRejectUnauthorized!: boolean | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  smtp_tslMinVersion!: string | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  oauth2_authorize!: boolean;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  oauth2_provider!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  oauth2_authUser!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  oauth2_accessToken!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  oauth2_refreshToken!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  oauth2_expires!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  createdAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  updatedAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deleted!: Date | null;

  @TypeGraphQL.Field(_type => EmailCountAggregate, {
    nullable: true
  })
  _count!: EmailCountAggregate | null;

  @TypeGraphQL.Field(_type => EmailAvgAggregate, {
    nullable: true
  })
  _avg!: EmailAvgAggregate | null;

  @TypeGraphQL.Field(_type => EmailSumAggregate, {
    nullable: true
  })
  _sum!: EmailSumAggregate | null;

  @TypeGraphQL.Field(_type => EmailMinAggregate, {
    nullable: true
  })
  _min!: EmailMinAggregate | null;

  @TypeGraphQL.Field(_type => EmailMaxAggregate, {
    nullable: true
  })
  _max!: EmailMaxAggregate | null;
}
