import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmailWhereInput } from '../inputs/EmailWhereInput';

@TypeGraphQL.InputType('EmailListRelationFilter', {
  isAbstract: true,
})
export class EmailListRelationFilter {
  @TypeGraphQL.Field((_type) => EmailWhereInput, {
    nullable: true,
  })
  every?: EmailWhereInput | undefined;

  @TypeGraphQL.Field((_type) => EmailWhereInput, {
    nullable: true,
  })
  some?: EmailWhereInput | undefined;

  @TypeGraphQL.Field((_type) => EmailWhereInput, {
    nullable: true,
  })
  none?: EmailWhereInput | undefined;
}
