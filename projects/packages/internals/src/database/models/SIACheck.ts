import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../scalars';
import { SIABadge } from '../models/SIABadge';
import { Transaction } from '../models/Transaction';
import { BadgeStatus } from '../enums/BadgeStatus';

@TypeGraphQL.ObjectType('SIACheck', {
  isAbstract: true,
})
export class SIACheck {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  badge?: SIABadge | null;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  sia_id?: number | null;

  @TypeGraphQL.Field((_type) => BadgeStatus, {
    nullable: false,
  })
  status!: 'ACTIVE' | 'REVOKED' | 'SUSPENDED' | 'NON_ACTIVE';

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  AuthUrl?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  pubUrl?: string | null;

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

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  error?: string | null;

  transactions?: Transaction | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  transactionId?: string | null;
}
