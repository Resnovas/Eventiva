import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountOrderByWithRelationAndSearchRelevanceInput } from '../inputs/AccountOrderByWithRelationAndSearchRelevanceInput';
import { AddressOrderByRelevanceInput } from '../inputs/AddressOrderByRelevanceInput';
import { ContactAtAddressOrderByRelationAggregateInput } from '../inputs/ContactAtAddressOrderByRelationAggregateInput';
import { FeatureOfAddressOrderByRelationAggregateInput } from '../inputs/FeatureOfAddressOrderByRelationAggregateInput';
import { PhoneOrderByRelationAggregateInput } from '../inputs/PhoneOrderByRelationAggregateInput';
import { RoomOrderByRelationAggregateInput } from '../inputs/RoomOrderByRelationAggregateInput';
import { VenueStyleOrderByRelationAggregateInput } from '../inputs/VenueStyleOrderByRelationAggregateInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('AddressOrderByWithRelationAndSearchRelevanceInput', {
  isAbstract: true,
})
export class AddressOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  id?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  createdAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  updatedAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field(
    (_type) => AccountOrderByWithRelationAndSearchRelevanceInput,
    {
      nullable: true,
    }
  )
  account?: AccountOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  accountId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  type?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  coords?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  street?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  city?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  state?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  country?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  zipcode?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  addressName?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  name?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  parking?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => ContactAtAddressOrderByRelationAggregateInput, {
    nullable: true,
  })
  contacts?: ContactAtAddressOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  website?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  hoursOfOperation?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => VenueStyleOrderByRelationAggregateInput, {
    nullable: true,
  })
  venueStyle?: VenueStyleOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  features?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  details?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  public?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field(
    (_type) => AccountOrderByWithRelationAndSearchRelevanceInput,
    {
      nullable: true,
    }
  )
  primaryAccount?:
    | AccountOrderByWithRelationAndSearchRelevanceInput
    | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  primaryaccountId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  deleted?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => FeatureOfAddressOrderByRelationAggregateInput, {
    nullable: true,
  })
  featuresOfBuisness?:
    | FeatureOfAddressOrderByRelationAggregateInput
    | undefined;

  @TypeGraphQL.Field((_type) => PhoneOrderByRelationAggregateInput, {
    nullable: true,
  })
  phones?: PhoneOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => RoomOrderByRelationAggregateInput, {
    nullable: true,
  })
  rooms?: RoomOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => AddressOrderByRelevanceInput, {
    nullable: true,
  })
  _relevance?: AddressOrderByRelevanceInput | undefined;
}
