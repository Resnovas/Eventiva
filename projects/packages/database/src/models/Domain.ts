import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../scalars';
import { Email } from '../models/Email';
import { dnsType } from '../enums/dnsType';
import { DomainCount } from '../resolvers/outputs/DomainCount';

@TypeGraphQL.ObjectType('Domain', {
  isAbstract: true,
})
export class Domain {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  domain!: string;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: false,
  })
  verified!: boolean;

  @TypeGraphQL.Field((_type) => dnsType, {
    nullable: false,
  })
  dnsType!: 'TXT' | 'CNAME';

  linkedEmails?: Email[];

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: false,
  })
  data!: Prisma.JsonValue;

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

  @TypeGraphQL.Field((_type) => DomainCount, {
    nullable: true,
  })
  _count?: DomainCount | null;
}
