import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmailCreateNestedManyWithoutDomainInput } from '../inputs/EmailCreateNestedManyWithoutDomainInput';
import { dnsType } from '../../enums/dnsType';

@TypeGraphQL.InputType('DomainCreateInput', {
  isAbstract: true,
})
export class DomainCreateInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  domain!: string;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  verified?: boolean | undefined;

  @TypeGraphQL.Field((_type) => dnsType, {
    nullable: true,
  })
  dnsType?: 'TXT' | 'CNAME' | undefined;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: false,
  })
  data!: Prisma.InputJsonValue;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted?: Date | undefined;

  @TypeGraphQL.Field((_type) => EmailCreateNestedManyWithoutDomainInput, {
    nullable: true,
  })
  linkedEmails?: EmailCreateNestedManyWithoutDomainInput | undefined;
}
