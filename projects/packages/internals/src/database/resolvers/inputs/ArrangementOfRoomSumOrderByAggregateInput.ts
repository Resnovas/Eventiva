import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('ArrangementOfRoomSumOrderByAggregateInput', {
  isAbstract: true,
})
export class ArrangementOfRoomSumOrderByAggregateInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  capacity?: 'asc' | 'desc' | undefined;
}
