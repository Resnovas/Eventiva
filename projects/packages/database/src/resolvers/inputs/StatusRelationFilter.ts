import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusWhereInput } from '../inputs/StatusWhereInput';

@TypeGraphQL.InputType('StatusRelationFilter', {
  isAbstract: true,
})
export class StatusRelationFilter {
  @TypeGraphQL.Field((_type) => StatusWhereInput, {
    nullable: true,
  })
  is?: StatusWhereInput | undefined;

  @TypeGraphQL.Field((_type) => StatusWhereInput, {
    nullable: true,
  })
  isNot?: StatusWhereInput | undefined;
}
