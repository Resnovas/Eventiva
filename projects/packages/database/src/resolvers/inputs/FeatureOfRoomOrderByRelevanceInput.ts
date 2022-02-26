import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfRoomOrderByRelevanceFieldEnum } from '../../enums/FeatureOfRoomOrderByRelevanceFieldEnum';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('FeatureOfRoomOrderByRelevanceInput', {
  isAbstract: true,
})
export class FeatureOfRoomOrderByRelevanceInput {
  @TypeGraphQL.Field((_type) => [FeatureOfRoomOrderByRelevanceFieldEnum], {
    nullable: false,
  })
  fields!: Array<'roomId' | 'featureId'>;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: false,
  })
  sort!: 'asc' | 'desc';

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  search!: string;
}
