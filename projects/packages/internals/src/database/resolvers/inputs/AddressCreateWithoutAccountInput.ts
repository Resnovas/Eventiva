import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateNestedOneWithoutPrimaryAddressInput } from '../inputs/AccountCreateNestedOneWithoutPrimaryAddressInput';
import { ContactAtAddressCreateNestedManyWithoutAddressInput } from '../inputs/ContactAtAddressCreateNestedManyWithoutAddressInput';
import { FeatureOfAddressCreateNestedManyWithoutAddressInput } from '../inputs/FeatureOfAddressCreateNestedManyWithoutAddressInput';
import { PhoneCreateNestedManyWithoutAddressInput } from '../inputs/PhoneCreateNestedManyWithoutAddressInput';
import { RoomCreateNestedManyWithoutAddressInput } from '../inputs/RoomCreateNestedManyWithoutAddressInput';
import { VenueStyleCreateNestedManyWithoutAddressInput } from '../inputs/VenueStyleCreateNestedManyWithoutAddressInput';
import { AddressType } from '../../enums/AddressType';

@TypeGraphQL.InputType('AddressCreateWithoutAccountInput', {
  isAbstract: true,
})
export class AddressCreateWithoutAccountInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id?: string | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => AddressType, {
    nullable: false,
  })
  type!: 'PERSONAL' | 'BUSINESS';

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  coords?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  street!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  city?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  state?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  country?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  zipcode?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  addressName?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  name?: string | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  parking?: boolean | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  website?: string | undefined;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  hoursOfOperation?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  features!: string;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  details?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  public?: boolean | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted?: Date | undefined;

  @TypeGraphQL.Field(
    (_type) => ContactAtAddressCreateNestedManyWithoutAddressInput,
    {
      nullable: true,
    }
  )
  contacts?: ContactAtAddressCreateNestedManyWithoutAddressInput | undefined;

  @TypeGraphQL.Field((_type) => VenueStyleCreateNestedManyWithoutAddressInput, {
    nullable: true,
  })
  venueStyle?: VenueStyleCreateNestedManyWithoutAddressInput | undefined;

  @TypeGraphQL.Field(
    (_type) => AccountCreateNestedOneWithoutPrimaryAddressInput,
    {
      nullable: true,
    }
  )
  primaryAccount?: AccountCreateNestedOneWithoutPrimaryAddressInput | undefined;

  @TypeGraphQL.Field(
    (_type) => FeatureOfAddressCreateNestedManyWithoutAddressInput,
    {
      nullable: true,
    }
  )
  featuresOfBuisness?:
    | FeatureOfAddressCreateNestedManyWithoutAddressInput
    | undefined;

  @TypeGraphQL.Field((_type) => PhoneCreateNestedManyWithoutAddressInput, {
    nullable: true,
  })
  phones?: PhoneCreateNestedManyWithoutAddressInput | undefined;

  @TypeGraphQL.Field((_type) => RoomCreateNestedManyWithoutAddressInput, {
    nullable: true,
  })
  rooms?: RoomCreateNestedManyWithoutAddressInput | undefined;
}
