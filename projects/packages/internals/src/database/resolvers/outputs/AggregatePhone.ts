import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { PhoneCountAggregate } from '../outputs/PhoneCountAggregate';
import { PhoneMaxAggregate } from '../outputs/PhoneMaxAggregate';
import { PhoneMinAggregate } from '../outputs/PhoneMinAggregate';

@TypeGraphQL.ObjectType('AggregatePhone', {
  isAbstract: true,
})
export class AggregatePhone {
  @TypeGraphQL.Field((_type) => PhoneCountAggregate, {
    nullable: true,
  })
  _count!: PhoneCountAggregate | null;

  @TypeGraphQL.Field((_type) => PhoneMinAggregate, {
    nullable: true,
  })
  _min!: PhoneMinAggregate | null;

  @TypeGraphQL.Field((_type) => PhoneMaxAggregate, {
    nullable: true,
  })
  _max!: PhoneMaxAggregate | null;
}
