import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateWithoutVenueStyleInput } from '../inputs/AddressCreateWithoutVenueStyleInput';
import { AddressUpdateWithoutVenueStyleInput } from '../inputs/AddressUpdateWithoutVenueStyleInput';
import { AddressWhereUniqueInput } from '../inputs/AddressWhereUniqueInput';

@TypeGraphQL.InputType('AddressUpsertWithWhereUniqueWithoutVenueStyleInput', {
  isAbstract: true,
})
export class AddressUpsertWithWhereUniqueWithoutVenueStyleInput {
  @TypeGraphQL.Field((_type) => AddressWhereUniqueInput, {
    nullable: false,
  })
  where!: AddressWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AddressUpdateWithoutVenueStyleInput, {
    nullable: false,
  })
  update!: AddressUpdateWithoutVenueStyleInput;

  @TypeGraphQL.Field((_type) => AddressCreateWithoutVenueStyleInput, {
    nullable: false,
  })
  create!: AddressCreateWithoutVenueStyleInput;
}
