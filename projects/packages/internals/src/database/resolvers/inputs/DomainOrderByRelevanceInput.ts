import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DomainOrderByRelevanceFieldEnum } from '../../enums/DomainOrderByRelevanceFieldEnum';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('DomainOrderByRelevanceInput', {
  isAbstract: true,
})
export class DomainOrderByRelevanceInput {
  @TypeGraphQL.Field((_type) => [DomainOrderByRelevanceFieldEnum], {
    nullable: false,
  })
  fields!: Array<'id' | 'domain'>;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: false,
  })
  sort!: 'asc' | 'desc';

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  search!: string;
}
