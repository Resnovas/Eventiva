import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SortOrder } from '../../enums/SortOrder';
import { StatusOrderByRelevanceFieldEnum } from '../../enums/StatusOrderByRelevanceFieldEnum';

@TypeGraphQL.InputType('StatusOrderByRelevanceInput', {
  isAbstract: true,
})
export class StatusOrderByRelevanceInput {
  @TypeGraphQL.Field((_type) => [StatusOrderByRelevanceFieldEnum], {
    nullable: false,
  })
  fields!: Array<'id' | 'name'>;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: false,
  })
  sort!: 'asc' | 'desc';

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  search!: string;
}
