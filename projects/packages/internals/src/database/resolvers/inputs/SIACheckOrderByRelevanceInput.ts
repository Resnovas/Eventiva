import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIACheckOrderByRelevanceFieldEnum } from '../../enums/SIACheckOrderByRelevanceFieldEnum';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('SIACheckOrderByRelevanceInput', {
  isAbstract: true,
})
export class SIACheckOrderByRelevanceInput {
  @TypeGraphQL.Field((_type) => [SIACheckOrderByRelevanceFieldEnum], {
    nullable: false,
  })
  fields!: Array<'id' | 'AuthUrl' | 'pubUrl' | 'error' | 'transactionId'>;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: false,
  })
  sort!: 'asc' | 'desc';

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  search!: string;
}
