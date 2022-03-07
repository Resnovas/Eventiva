import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIACheckWhereInput } from '../inputs/SIACheckWhereInput';

@TypeGraphQL.InputType('SIACheckListRelationFilter', {
  isAbstract: true,
})
export class SIACheckListRelationFilter {
  @TypeGraphQL.Field((_type) => SIACheckWhereInput, {
    nullable: true,
  })
  every?: SIACheckWhereInput | undefined;

  @TypeGraphQL.Field((_type) => SIACheckWhereInput, {
    nullable: true,
  })
  some?: SIACheckWhereInput | undefined;

  @TypeGraphQL.Field((_type) => SIACheckWhereInput, {
    nullable: true,
  })
  none?: SIACheckWhereInput | undefined;
}
