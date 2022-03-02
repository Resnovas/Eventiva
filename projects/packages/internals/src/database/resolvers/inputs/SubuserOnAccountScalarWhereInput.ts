import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFilter } from '../inputs/DateTimeFilter';
import { StringFilter } from '../inputs/StringFilter';

@TypeGraphQL.InputType('SubuserOnAccountScalarWhereInput', {
  isAbstract: true,
})
export class SubuserOnAccountScalarWhereInput {
  @TypeGraphQL.Field((_type) => [SubuserOnAccountScalarWhereInput], {
    nullable: true,
  })
  AND?: SubuserOnAccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SubuserOnAccountScalarWhereInput], {
    nullable: true,
  })
  OR?: SubuserOnAccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SubuserOnAccountScalarWhereInput], {
    nullable: true,
  })
  NOT?: SubuserOnAccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  accountId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  subuserId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  updatedAt?: DateTimeFilter | undefined;
}
