import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmailAvgAggregate } from '../outputs/EmailAvgAggregate';
import { EmailCountAggregate } from '../outputs/EmailCountAggregate';
import { EmailMaxAggregate } from '../outputs/EmailMaxAggregate';
import { EmailMinAggregate } from '../outputs/EmailMinAggregate';
import { EmailSumAggregate } from '../outputs/EmailSumAggregate';

@TypeGraphQL.ObjectType('AggregateEmail', {
  isAbstract: true,
})
export class AggregateEmail {
  @TypeGraphQL.Field((_type) => EmailCountAggregate, {
    nullable: true,
  })
  _count!: EmailCountAggregate | null;

  @TypeGraphQL.Field((_type) => EmailAvgAggregate, {
    nullable: true,
  })
  _avg!: EmailAvgAggregate | null;

  @TypeGraphQL.Field((_type) => EmailSumAggregate, {
    nullable: true,
  })
  _sum!: EmailSumAggregate | null;

  @TypeGraphQL.Field((_type) => EmailMinAggregate, {
    nullable: true,
  })
  _min!: EmailMinAggregate | null;

  @TypeGraphQL.Field((_type) => EmailMaxAggregate, {
    nullable: true,
  })
  _max!: EmailMaxAggregate | null;
}
