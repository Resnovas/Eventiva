import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FilesCountAggregate } from '../outputs/FilesCountAggregate';
import { FilesMaxAggregate } from '../outputs/FilesMaxAggregate';
import { FilesMinAggregate } from '../outputs/FilesMinAggregate';

@TypeGraphQL.ObjectType('AggregateFiles', {
  isAbstract: true,
})
export class AggregateFiles {
  @TypeGraphQL.Field((_type) => FilesCountAggregate, {
    nullable: true,
  })
  _count!: FilesCountAggregate | null;

  @TypeGraphQL.Field((_type) => FilesMinAggregate, {
    nullable: true,
  })
  _min!: FilesMinAggregate | null;

  @TypeGraphQL.Field((_type) => FilesMaxAggregate, {
    nullable: true,
  })
  _max!: FilesMaxAggregate | null;
}
