import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusOnAccountWhereInput } from '../inputs/StatusOnAccountWhereInput';

@TypeGraphQL.InputType('StatusOnAccountListRelationFilter', {
  isAbstract: true,
})
export class StatusOnAccountListRelationFilter {
  @TypeGraphQL.Field((_type) => StatusOnAccountWhereInput, {
    nullable: true,
  })
  every?: StatusOnAccountWhereInput | undefined;

  @TypeGraphQL.Field((_type) => StatusOnAccountWhereInput, {
    nullable: true,
  })
  some?: StatusOnAccountWhereInput | undefined;

  @TypeGraphQL.Field((_type) => StatusOnAccountWhereInput, {
    nullable: true,
  })
  none?: StatusOnAccountWhereInput | undefined;
}
