import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { TokenCountAggregate } from '../outputs/TokenCountAggregate';
import { TokenMaxAggregate } from '../outputs/TokenMaxAggregate';
import { TokenMinAggregate } from '../outputs/TokenMinAggregate';

@TypeGraphQL.ObjectType('AggregateToken', {
  isAbstract: true,
})
export class AggregateToken {
  @TypeGraphQL.Field((_type) => TokenCountAggregate, {
    nullable: true,
  })
  _count!: TokenCountAggregate | null;

  @TypeGraphQL.Field((_type) => TokenMinAggregate, {
    nullable: true,
  })
  _min!: TokenMinAggregate | null;

  @TypeGraphQL.Field((_type) => TokenMaxAggregate, {
    nullable: true,
  })
  _max!: TokenMaxAggregate | null;
}
