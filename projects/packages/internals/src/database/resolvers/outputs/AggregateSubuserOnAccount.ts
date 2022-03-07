import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubuserOnAccountCountAggregate } from '../outputs/SubuserOnAccountCountAggregate';
import { SubuserOnAccountMaxAggregate } from '../outputs/SubuserOnAccountMaxAggregate';
import { SubuserOnAccountMinAggregate } from '../outputs/SubuserOnAccountMinAggregate';

@TypeGraphQL.ObjectType('AggregateSubuserOnAccount', {
  isAbstract: true,
})
export class AggregateSubuserOnAccount {
  @TypeGraphQL.Field((_type) => SubuserOnAccountCountAggregate, {
    nullable: true,
  })
  _count!: SubuserOnAccountCountAggregate | null;

  @TypeGraphQL.Field((_type) => SubuserOnAccountMinAggregate, {
    nullable: true,
  })
  _min!: SubuserOnAccountMinAggregate | null;

  @TypeGraphQL.Field((_type) => SubuserOnAccountMaxAggregate, {
    nullable: true,
  })
  _max!: SubuserOnAccountMaxAggregate | null;
}
