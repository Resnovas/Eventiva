import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountRelationFilter } from '../inputs/AccountRelationFilter';
import { DateTimeFilter } from '../inputs/DateTimeFilter';
import { StringFilter } from '../inputs/StringFilter';

@TypeGraphQL.InputType('SubuserOnAccountWhereInput', {
  isAbstract: true,
})
export class SubuserOnAccountWhereInput {
  @TypeGraphQL.Field((_type) => [SubuserOnAccountWhereInput], {
    nullable: true,
  })
  AND?: SubuserOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SubuserOnAccountWhereInput], {
    nullable: true,
  })
  OR?: SubuserOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SubuserOnAccountWhereInput], {
    nullable: true,
  })
  NOT?: SubuserOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  accountId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  subuserId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => AccountRelationFilter, {
    nullable: true,
  })
  account?: AccountRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => AccountRelationFilter, {
    nullable: true,
  })
  subuser?: AccountRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  updatedAt?: DateTimeFilter | undefined;
}
