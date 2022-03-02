import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmployersOnAccountCountAggregate } from '../outputs/EmployersOnAccountCountAggregate';
import { EmployersOnAccountMaxAggregate } from '../outputs/EmployersOnAccountMaxAggregate';
import { EmployersOnAccountMinAggregate } from '../outputs/EmployersOnAccountMinAggregate';

@TypeGraphQL.ObjectType('AggregateEmployersOnAccount', {
  isAbstract: true,
})
export class AggregateEmployersOnAccount {
  @TypeGraphQL.Field((_type) => EmployersOnAccountCountAggregate, {
    nullable: true,
  })
  _count!: EmployersOnAccountCountAggregate | null;

  @TypeGraphQL.Field((_type) => EmployersOnAccountMinAggregate, {
    nullable: true,
  })
  _min!: EmployersOnAccountMinAggregate | null;

  @TypeGraphQL.Field((_type) => EmployersOnAccountMaxAggregate, {
    nullable: true,
  })
  _max!: EmployersOnAccountMaxAggregate | null;
}
