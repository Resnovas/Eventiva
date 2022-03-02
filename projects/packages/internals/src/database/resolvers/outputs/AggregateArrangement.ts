import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementCountAggregate } from '../outputs/ArrangementCountAggregate';
import { ArrangementMaxAggregate } from '../outputs/ArrangementMaxAggregate';
import { ArrangementMinAggregate } from '../outputs/ArrangementMinAggregate';

@TypeGraphQL.ObjectType('AggregateArrangement', {
  isAbstract: true,
})
export class AggregateArrangement {
  @TypeGraphQL.Field((_type) => ArrangementCountAggregate, {
    nullable: true,
  })
  _count!: ArrangementCountAggregate | null;

  @TypeGraphQL.Field((_type) => ArrangementMinAggregate, {
    nullable: true,
  })
  _min!: ArrangementMinAggregate | null;

  @TypeGraphQL.Field((_type) => ArrangementMaxAggregate, {
    nullable: true,
  })
  _max!: ArrangementMaxAggregate | null;
}
