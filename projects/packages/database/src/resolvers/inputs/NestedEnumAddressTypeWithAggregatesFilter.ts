import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { NestedEnumAddressTypeFilter } from '../inputs/NestedEnumAddressTypeFilter';
import { NestedIntFilter } from '../inputs/NestedIntFilter';
import { AddressType } from '../../enums/AddressType';

@TypeGraphQL.InputType('NestedEnumAddressTypeWithAggregatesFilter', {
  isAbstract: true,
})
export class NestedEnumAddressTypeWithAggregatesFilter {
  @TypeGraphQL.Field((_type) => AddressType, {
    nullable: true,
  })
  equals?: 'PERSONAL' | 'BUSINESS' | undefined;

  @TypeGraphQL.Field((_type) => [AddressType], {
    nullable: true,
  })
  in?: Array<'PERSONAL' | 'BUSINESS'> | undefined;

  @TypeGraphQL.Field((_type) => [AddressType], {
    nullable: true,
  })
  notIn?: Array<'PERSONAL' | 'BUSINESS'> | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumAddressTypeWithAggregatesFilter, {
    nullable: true,
  })
  not?: NestedEnumAddressTypeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedIntFilter, {
    nullable: true,
  })
  _count?: NestedIntFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumAddressTypeFilter, {
    nullable: true,
  })
  _min?: NestedEnumAddressTypeFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumAddressTypeFilter, {
    nullable: true,
  })
  _max?: NestedEnumAddressTypeFilter | undefined;
}
