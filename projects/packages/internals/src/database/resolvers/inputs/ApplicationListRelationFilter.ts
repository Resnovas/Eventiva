import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ApplicationWhereInput } from '../inputs/ApplicationWhereInput';

@TypeGraphQL.InputType('ApplicationListRelationFilter', {
  isAbstract: true,
})
export class ApplicationListRelationFilter {
  @TypeGraphQL.Field((_type) => ApplicationWhereInput, {
    nullable: true,
  })
  every?: ApplicationWhereInput | undefined;

  @TypeGraphQL.Field((_type) => ApplicationWhereInput, {
    nullable: true,
  })
  some?: ApplicationWhereInput | undefined;

  @TypeGraphQL.Field((_type) => ApplicationWhereInput, {
    nullable: true,
  })
  none?: ApplicationWhereInput | undefined;
}
