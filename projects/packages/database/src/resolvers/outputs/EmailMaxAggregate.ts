import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';

@TypeGraphQL.ObjectType('EmailMaxAggregate', {
  isAbstract: true,
})
export class EmailMaxAggregate {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  domainId!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  email!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  accountId!: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  verified!: boolean | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  public!: boolean | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  primary!: boolean | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  path!: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  copy!: boolean | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  notifyFrom!: Date | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  imap_authUser!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  imap_authPass!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  imap_accessToken!: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  imap_authServer!: boolean | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  imap_host!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  imap_port!: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  imap_secure!: boolean | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  imap_tslRejectUnauthorized!: boolean | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  imap_tslMinVersion!: string | null;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  imap_resyncDelay!: number | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  smtp_authUser!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  smtp_authPass!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  smtp_accessToken!: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  smtp_authServer!: boolean | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  smtp_host!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  smtp_port!: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  smtp_secure!: boolean | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  smtp_tslRejectUnauthorized!: boolean | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  smtp_tslMinVersion!: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  oauth2_authorize!: boolean | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  oauth2_provider!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  oauth2_authUser!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  oauth2_accessToken!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  oauth2_refreshToken!: string | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  oauth2_expires!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted!: Date | null;
}
