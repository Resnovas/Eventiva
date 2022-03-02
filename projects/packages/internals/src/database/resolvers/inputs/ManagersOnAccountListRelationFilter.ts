import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ManagersOnAccountWhereInput } from '../inputs/ManagersOnAccountWhereInput';

@TypeGraphQL.InputType('ManagersOnAccountListRelationFilter', {
  isAbstract: true,
})
export class ManagersOnAccountListRelationFilter {
  @TypeGraphQL.Field((_type) => ManagersOnAccountWhereInput, {
    nullable: true,
  })
  every?: ManagersOnAccountWhereInput | undefined;

  @TypeGraphQL.Field((_type) => ManagersOnAccountWhereInput, {
    nullable: true,
  })
  some?: ManagersOnAccountWhereInput | undefined;

  @TypeGraphQL.Field((_type) => ManagersOnAccountWhereInput, {
    nullable: true,
  })
  none?: ManagersOnAccountWhereInput | undefined;
}
