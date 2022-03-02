import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIABadgeOrderByRelevanceFieldEnum } from '../../enums/SIABadgeOrderByRelevanceFieldEnum';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('SIABadgeOrderByRelevanceInput', {
  isAbstract: true,
})
export class SIABadgeOrderByRelevanceInput {
  @TypeGraphQL.Field((_type) => [SIABadgeOrderByRelevanceFieldEnum], {
    nullable: false,
  })
  fields!: Array<'licenseExplanation' | 'additionalTerms' | 'account_id'>;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: false,
  })
  sort!: 'asc' | 'desc';

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  search!: string;
}
