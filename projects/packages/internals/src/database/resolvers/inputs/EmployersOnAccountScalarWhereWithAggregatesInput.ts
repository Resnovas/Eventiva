import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeWithAggregatesFilter } from '../inputs/DateTimeWithAggregatesFilter';
import { StringWithAggregatesFilter } from '../inputs/StringWithAggregatesFilter';

@TypeGraphQL.InputType('EmployersOnAccountScalarWhereWithAggregatesInput', {
  isAbstract: true,
})
export class EmployersOnAccountScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountScalarWhereWithAggregatesInput],
    {
      nullable: true,
    }
  )
  AND?: EmployersOnAccountScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountScalarWhereWithAggregatesInput],
    {
      nullable: true,
    }
  )
  OR?: EmployersOnAccountScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountScalarWhereWithAggregatesInput],
    {
      nullable: true,
    }
  )
  NOT?: EmployersOnAccountScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  accountId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  employerId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeWithAggregatesFilter, {
    nullable: true,
  })
  createdAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeWithAggregatesFilter, {
    nullable: true,
  })
  updatedAt?: DateTimeWithAggregatesFilter | undefined;
}
