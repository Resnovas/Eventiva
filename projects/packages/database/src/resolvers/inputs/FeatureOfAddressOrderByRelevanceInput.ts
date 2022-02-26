import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfAddressOrderByRelevanceFieldEnum } from '../../enums/FeatureOfAddressOrderByRelevanceFieldEnum';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('FeatureOfAddressOrderByRelevanceInput', {
  isAbstract: true,
})
export class FeatureOfAddressOrderByRelevanceInput {
  @TypeGraphQL.Field((_type) => [FeatureOfAddressOrderByRelevanceFieldEnum], {
    nullable: false,
  })
  fields!: Array<'addressId' | 'featureId'>;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: false,
  })
  sort!: 'asc' | 'desc';

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  search!: string;
}
