import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../scalars';
import { Account } from '../models/Account';
import { ContactAtAddress } from '../models/ContactAtAddress';
import { Domain } from '../models/Domain';
import { EmailCount } from '../resolvers/outputs/EmailCount';

@TypeGraphQL.ObjectType('Email', {
  isAbstract: true,
})
export class Email {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  associatedContact?: ContactAtAddress[];

  domain?: Domain | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  domainId?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  email!: string;

  account?: Account | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  accountId?: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: false,
  })
  verified!: boolean;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: false,
  })
  public!: boolean;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: false,
  })
  primary!: boolean;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  path?: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: false,
  })
  copy!: boolean;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  notifyFrom?: Date | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  imap_authUser?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  imap_authPass?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  imap_accessToken?: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  imap_authServer?: boolean | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  imap_host?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  imap_port?: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  imap_secure?: boolean | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  imap_tslRejectUnauthorized?: boolean | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  imap_tslMinVersion?: string | null;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  imap_resyncDelay!: number;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  smtp_authUser?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  smtp_authPass?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  smtp_accessToken?: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  smtp_authServer?: boolean | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  smtp_host?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  smtp_port?: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  smtp_secure?: boolean | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  smtp_tslRejectUnauthorized?: boolean | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  smtp_tslMinVersion?: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: false,
  })
  oauth2_authorize!: boolean;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  oauth2_provider!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  oauth2_authUser?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  oauth2_accessToken?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  oauth2_refreshToken?: string | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  oauth2_expires?: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted?: Date | null;

  @TypeGraphQL.Field((_type) => EmailCount, {
    nullable: true,
  })
  _count?: EmailCount | null;
}
