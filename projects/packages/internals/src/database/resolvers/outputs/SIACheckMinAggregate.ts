import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { BadgeStatus } from '../../enums/BadgeStatus';

@TypeGraphQL.ObjectType('SIACheckMinAggregate', {
  isAbstract: true,
})
export class SIACheckMinAggregate {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id!: string | null;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  sia_id!: number | null;

  @TypeGraphQL.Field((_type) => BadgeStatus, {
    nullable: true,
  })
  status!: 'ACTIVE' | 'REVOKED' | 'SUSPENDED' | 'NON_ACTIVE' | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  AuthUrl!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  pubUrl!: string | null;

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

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  error!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  transactionId!: string | null;
}
