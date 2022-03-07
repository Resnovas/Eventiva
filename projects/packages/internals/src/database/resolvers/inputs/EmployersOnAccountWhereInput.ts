import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountRelationFilter } from '../inputs/AccountRelationFilter';
import { DateTimeFilter } from '../inputs/DateTimeFilter';
import { StringFilter } from '../inputs/StringFilter';

@TypeGraphQL.InputType('EmployersOnAccountWhereInput', {
  isAbstract: true,
})
export class EmployersOnAccountWhereInput {
  @TypeGraphQL.Field((_type) => [EmployersOnAccountWhereInput], {
    nullable: true,
  })
  AND?: EmployersOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmployersOnAccountWhereInput], {
    nullable: true,
  })
  OR?: EmployersOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmployersOnAccountWhereInput], {
    nullable: true,
  })
  NOT?: EmployersOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  accountId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  employerId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => AccountRelationFilter, {
    nullable: true,
  })
  account?: AccountRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => AccountRelationFilter, {
    nullable: true,
  })
  employer?: AccountRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  updatedAt?: DateTimeFilter | undefined;
}
