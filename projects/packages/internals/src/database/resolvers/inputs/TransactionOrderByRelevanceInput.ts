import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SortOrder } from '../../enums/SortOrder';
import { TransactionOrderByRelevanceFieldEnum } from '../../enums/TransactionOrderByRelevanceFieldEnum';

@TypeGraphQL.InputType('TransactionOrderByRelevanceInput', {
  isAbstract: true,
})
export class TransactionOrderByRelevanceInput {
  @TypeGraphQL.Field((_type) => [TransactionOrderByRelevanceFieldEnum], {
    nullable: false,
  })
  fields!: Array<'id' | 'accountId'>;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: false,
  })
  sort!: 'asc' | 'desc';

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  search!: string;
}
