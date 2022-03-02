import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { dnsType } from '../../enums/dnsType';

@TypeGraphQL.ObjectType('DomainMaxAggregate', {
  isAbstract: true,
})
export class DomainMaxAggregate {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  domain!: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  verified!: boolean | null;

  @TypeGraphQL.Field((_type) => dnsType, {
    nullable: true,
  })
  dnsType!: 'TXT' | 'CNAME' | null;

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
