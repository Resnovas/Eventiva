import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountOrderByRelevanceFieldEnum } from '../../enums/AccountOrderByRelevanceFieldEnum';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('AccountOrderByRelevanceInput', {
  isAbstract: true,
})
export class AccountOrderByRelevanceInput {
  @TypeGraphQL.Field((_type) => [AccountOrderByRelevanceFieldEnum], {
    nullable: false,
  })
  fields!: Array<
    | 'id'
    | 'username'
    | 'firstname'
    | 'midname'
    | 'lastname'
    | 'Salutation'
    | 'sex'
    | 'label'
    | 'password'
    | 'resetPasswordToken'
  >;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: false,
  })
  sort!: 'asc' | 'desc';

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  search!: string;
}
