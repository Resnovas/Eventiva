import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ContactAtAddressCountAggregate } from '../outputs/ContactAtAddressCountAggregate';
import { ContactAtAddressMaxAggregate } from '../outputs/ContactAtAddressMaxAggregate';
import { ContactAtAddressMinAggregate } from '../outputs/ContactAtAddressMinAggregate';

@TypeGraphQL.ObjectType('AggregateContactAtAddress', {
  isAbstract: true,
})
export class AggregateContactAtAddress {
  @TypeGraphQL.Field((_type) => ContactAtAddressCountAggregate, {
    nullable: true,
  })
  _count!: ContactAtAddressCountAggregate | null;

  @TypeGraphQL.Field((_type) => ContactAtAddressMinAggregate, {
    nullable: true,
  })
  _min!: ContactAtAddressMinAggregate | null;

  @TypeGraphQL.Field((_type) => ContactAtAddressMaxAggregate, {
    nullable: true,
  })
  _max!: ContactAtAddressMaxAggregate | null;
}
