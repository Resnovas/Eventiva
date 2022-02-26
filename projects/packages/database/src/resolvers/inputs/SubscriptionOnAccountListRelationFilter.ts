import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubscriptionOnAccountWhereInput } from '../inputs/SubscriptionOnAccountWhereInput';

@TypeGraphQL.InputType('SubscriptionOnAccountListRelationFilter', {
  isAbstract: true,
})
export class SubscriptionOnAccountListRelationFilter {
  @TypeGraphQL.Field((_type) => SubscriptionOnAccountWhereInput, {
    nullable: true,
  })
  every?: SubscriptionOnAccountWhereInput | undefined;

  @TypeGraphQL.Field((_type) => SubscriptionOnAccountWhereInput, {
    nullable: true,
  })
  some?: SubscriptionOnAccountWhereInput | undefined;

  @TypeGraphQL.Field((_type) => SubscriptionOnAccountWhereInput, {
    nullable: true,
  })
  none?: SubscriptionOnAccountWhereInput | undefined;
}
