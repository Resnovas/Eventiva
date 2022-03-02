import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../scalars';
import { Account } from '../models/Account';
import { SIACheck } from '../models/SIACheck';
import { TransactionCount } from '../resolvers/outputs/TransactionCount';

@TypeGraphQL.ObjectType('Transaction', {
  isAbstract: true,
})
export class Transaction {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

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

  account?: Account;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  accountId!: string;

  SIACheck?: SIACheck[];

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: false,
  })
  data!: Prisma.JsonValue;

  @TypeGraphQL.Field((_type) => TransactionCount, {
    nullable: true,
  })
  _count?: TransactionCount | null;
}
