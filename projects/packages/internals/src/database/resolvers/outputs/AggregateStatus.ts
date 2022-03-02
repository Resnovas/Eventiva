import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusCountAggregate } from '../outputs/StatusCountAggregate';
import { StatusMaxAggregate } from '../outputs/StatusMaxAggregate';
import { StatusMinAggregate } from '../outputs/StatusMinAggregate';

@TypeGraphQL.ObjectType('AggregateStatus', {
  isAbstract: true,
})
export class AggregateStatus {
  @TypeGraphQL.Field((_type) => StatusCountAggregate, {
    nullable: true,
  })
  _count!: StatusCountAggregate | null;

  @TypeGraphQL.Field((_type) => StatusMinAggregate, {
    nullable: true,
  })
  _min!: StatusMinAggregate | null;

  @TypeGraphQL.Field((_type) => StatusMaxAggregate, {
    nullable: true,
  })
  _max!: StatusMaxAggregate | null;
}
