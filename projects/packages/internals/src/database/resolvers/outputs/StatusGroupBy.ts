import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusCountAggregate } from '../outputs/StatusCountAggregate';
import { StatusMaxAggregate } from '../outputs/StatusMaxAggregate';
import { StatusMinAggregate } from '../outputs/StatusMinAggregate';

@TypeGraphQL.ObjectType('StatusGroupBy', {
  isAbstract: true,
})
export class StatusGroupBy {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  name!: string;

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
  deleted!: Date | null;

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
