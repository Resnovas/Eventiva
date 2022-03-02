import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ApplicationOrderByRelevanceFieldEnum } from '../../enums/ApplicationOrderByRelevanceFieldEnum';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('ApplicationOrderByRelevanceInput', {
  isAbstract: true,
})
export class ApplicationOrderByRelevanceInput {
  @TypeGraphQL.Field((_type) => [ApplicationOrderByRelevanceFieldEnum], {
    nullable: false,
  })
  fields!: Array<'id' | 'name' | 'accountId'>;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: false,
  })
  sort!: 'asc' | 'desc';

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  search!: string;
}
