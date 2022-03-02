import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RTWWhereInput } from '../inputs/RTWWhereInput';

@TypeGraphQL.InputType('RTWRelationFilter', {
  isAbstract: true,
})
export class RTWRelationFilter {
  @TypeGraphQL.Field((_type) => RTWWhereInput, {
    nullable: true,
  })
  is?: RTWWhereInput | undefined;

  @TypeGraphQL.Field((_type) => RTWWhereInput, {
    nullable: true,
  })
  isNot?: RTWWhereInput | undefined;
}
