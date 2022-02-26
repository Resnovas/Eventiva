import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementWhereInput } from '../inputs/ArrangementWhereInput';

@TypeGraphQL.InputType('ArrangementRelationFilter', {
  isAbstract: true,
})
export class ArrangementRelationFilter {
  @TypeGraphQL.Field((_type) => ArrangementWhereInput, {
    nullable: true,
  })
  is?: ArrangementWhereInput | undefined;

  @TypeGraphQL.Field((_type) => ArrangementWhereInput, {
    nullable: true,
  })
  isNot?: ArrangementWhereInput | undefined;
}
