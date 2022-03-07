import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubuserOnAccountWhereInput } from '../inputs/SubuserOnAccountWhereInput';

@TypeGraphQL.InputType('SubuserOnAccountListRelationFilter', {
  isAbstract: true,
})
export class SubuserOnAccountListRelationFilter {
  @TypeGraphQL.Field((_type) => SubuserOnAccountWhereInput, {
    nullable: true,
  })
  every?: SubuserOnAccountWhereInput | undefined;

  @TypeGraphQL.Field((_type) => SubuserOnAccountWhereInput, {
    nullable: true,
  })
  some?: SubuserOnAccountWhereInput | undefined;

  @TypeGraphQL.Field((_type) => SubuserOnAccountWhereInput, {
    nullable: true,
  })
  none?: SubuserOnAccountWhereInput | undefined;
}
