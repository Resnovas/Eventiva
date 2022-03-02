import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementOrderByRelevanceFieldEnum } from '../../enums/ArrangementOrderByRelevanceFieldEnum';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('ArrangementOrderByRelevanceInput', {
  isAbstract: true,
})
export class ArrangementOrderByRelevanceInput {
  @TypeGraphQL.Field((_type) => [ArrangementOrderByRelevanceFieldEnum], {
    nullable: false,
  })
  fields!: Array<'id' | 'name' | 'icon' | 'details'>;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: false,
  })
  sort!: 'asc' | 'desc';

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  search!: string;
}
