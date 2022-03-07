import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressOrderByRelevanceFieldEnum } from '../../enums/AddressOrderByRelevanceFieldEnum';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('AddressOrderByRelevanceInput', {
  isAbstract: true,
})
export class AddressOrderByRelevanceInput {
  @TypeGraphQL.Field((_type) => [AddressOrderByRelevanceFieldEnum], {
    nullable: false,
  })
  fields!: Array<
    | 'id'
    | 'accountId'
    | 'coords'
    | 'street'
    | 'city'
    | 'state'
    | 'country'
    | 'zipcode'
    | 'addressName'
    | 'name'
    | 'website'
    | 'features'
    | 'primaryaccountId'
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
