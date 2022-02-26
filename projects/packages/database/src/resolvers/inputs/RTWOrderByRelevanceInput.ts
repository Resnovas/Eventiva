import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RTWOrderByRelevanceFieldEnum } from '../../enums/RTWOrderByRelevanceFieldEnum';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('RTWOrderByRelevanceInput', {
  isAbstract: true,
})
export class RTWOrderByRelevanceInput {
  @TypeGraphQL.Field((_type) => [RTWOrderByRelevanceFieldEnum], {
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
