import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFilter } from '../inputs/DateTimeFilter';
import { StringFilter } from '../inputs/StringFilter';

@TypeGraphQL.InputType('ManagersOnAccountScalarWhereInput', {
  isAbstract: true,
})
export class ManagersOnAccountScalarWhereInput {
  @TypeGraphQL.Field((_type) => [ManagersOnAccountScalarWhereInput], {
    nullable: true,
  })
  AND?: ManagersOnAccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ManagersOnAccountScalarWhereInput], {
    nullable: true,
  })
  OR?: ManagersOnAccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ManagersOnAccountScalarWhereInput], {
    nullable: true,
  })
  NOT?: ManagersOnAccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  accountId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  managersId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  updatedAt?: DateTimeFilter | undefined;
}
