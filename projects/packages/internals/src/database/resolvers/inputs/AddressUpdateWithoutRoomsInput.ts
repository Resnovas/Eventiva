import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountUpdateOneRequiredWithoutAddressesInput } from '../inputs/AccountUpdateOneRequiredWithoutAddressesInput';
import { AccountUpdateOneWithoutPrimaryAddressInput } from '../inputs/AccountUpdateOneWithoutPrimaryAddressInput';
import { BoolFieldUpdateOperationsInput } from '../inputs/BoolFieldUpdateOperationsInput';
import { ContactAtAddressUpdateManyWithoutAddressInput } from '../inputs/ContactAtAddressUpdateManyWithoutAddressInput';
import { DateTimeFieldUpdateOperationsInput } from '../inputs/DateTimeFieldUpdateOperationsInput';
import { EnumAddressTypeFieldUpdateOperationsInput } from '../inputs/EnumAddressTypeFieldUpdateOperationsInput';
import { FeatureOfAddressUpdateManyWithoutAddressInput } from '../inputs/FeatureOfAddressUpdateManyWithoutAddressInput';
import { NullableBoolFieldUpdateOperationsInput } from '../inputs/NullableBoolFieldUpdateOperationsInput';
import { NullableDateTimeFieldUpdateOperationsInput } from '../inputs/NullableDateTimeFieldUpdateOperationsInput';
import { NullableStringFieldUpdateOperationsInput } from '../inputs/NullableStringFieldUpdateOperationsInput';
import { PhoneUpdateManyWithoutAddressInput } from '../inputs/PhoneUpdateManyWithoutAddressInput';
import { StringFieldUpdateOperationsInput } from '../inputs/StringFieldUpdateOperationsInput';
import { VenueStyleUpdateManyWithoutAddressInput } from '../inputs/VenueStyleUpdateManyWithoutAddressInput';

@TypeGraphQL.InputType('AddressUpdateWithoutRoomsInput', {
  isAbstract: true,
})
export class AddressUpdateWithoutRoomsInput {
  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  id?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  createdAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  updatedAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => EnumAddressTypeFieldUpdateOperationsInput, {
    nullable: true,
  })
  type?: EnumAddressTypeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  coords?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  street?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  city?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  state?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  country?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  zipcode?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  addressName?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  name?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableBoolFieldUpdateOperationsInput, {
    nullable: true,
  })
  parking?: NullableBoolFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  website?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  hoursOfOperation?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  features?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  details?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => BoolFieldUpdateOperationsInput, {
    nullable: true,
  })
  public?: BoolFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  deleted?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => AccountUpdateOneRequiredWithoutAddressesInput, {
    nullable: true,
  })
  account?: AccountUpdateOneRequiredWithoutAddressesInput | undefined;

  @TypeGraphQL.Field((_type) => ContactAtAddressUpdateManyWithoutAddressInput, {
    nullable: true,
  })
  contacts?: ContactAtAddressUpdateManyWithoutAddressInput | undefined;

  @TypeGraphQL.Field((_type) => VenueStyleUpdateManyWithoutAddressInput, {
    nullable: true,
  })
  venueStyle?: VenueStyleUpdateManyWithoutAddressInput | undefined;

  @TypeGraphQL.Field((_type) => AccountUpdateOneWithoutPrimaryAddressInput, {
    nullable: true,
  })
  primaryAccount?: AccountUpdateOneWithoutPrimaryAddressInput | undefined;

  @TypeGraphQL.Field((_type) => FeatureOfAddressUpdateManyWithoutAddressInput, {
    nullable: true,
  })
  featuresOfBuisness?:
    | FeatureOfAddressUpdateManyWithoutAddressInput
    | undefined;

  @TypeGraphQL.Field((_type) => PhoneUpdateManyWithoutAddressInput, {
    nullable: true,
  })
  phones?: PhoneUpdateManyWithoutAddressInput | undefined;
}
