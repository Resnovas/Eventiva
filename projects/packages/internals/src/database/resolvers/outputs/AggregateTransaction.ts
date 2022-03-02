import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { TransactionCountAggregate } from '../outputs/TransactionCountAggregate';
import { TransactionMaxAggregate } from '../outputs/TransactionMaxAggregate';
import { TransactionMinAggregate } from '../outputs/TransactionMinAggregate';

@TypeGraphQL.ObjectType('AggregateTransaction', {
  isAbstract: true,
})
export class AggregateTransaction {
  @TypeGraphQL.Field((_type) => TransactionCountAggregate, {
    nullable: true,
  })
  _count!: TransactionCountAggregate | null;

  @TypeGraphQL.Field((_type) => TransactionMinAggregate, {
    nullable: true,
  })
  _min!: TransactionMinAggregate | null;

  @TypeGraphQL.Field((_type) => TransactionMaxAggregate, {
    nullable: true,
  })
  _max!: TransactionMaxAggregate | null;
}
