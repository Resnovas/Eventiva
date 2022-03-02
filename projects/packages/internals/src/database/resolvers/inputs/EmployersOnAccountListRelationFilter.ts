import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmployersOnAccountWhereInput } from '../inputs/EmployersOnAccountWhereInput';

@TypeGraphQL.InputType('EmployersOnAccountListRelationFilter', {
  isAbstract: true,
})
export class EmployersOnAccountListRelationFilter {
  @TypeGraphQL.Field((_type) => EmployersOnAccountWhereInput, {
    nullable: true,
  })
  every?: EmployersOnAccountWhereInput | undefined;

  @TypeGraphQL.Field((_type) => EmployersOnAccountWhereInput, {
    nullable: true,
  })
  some?: EmployersOnAccountWhereInput | undefined;

  @TypeGraphQL.Field((_type) => EmployersOnAccountWhereInput, {
    nullable: true,
  })
  none?: EmployersOnAccountWhereInput | undefined;
}
