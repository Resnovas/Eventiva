import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RoomCreateWithoutAddressInput } from '../inputs/RoomCreateWithoutAddressInput';
import { RoomWhereUniqueInput } from '../inputs/RoomWhereUniqueInput';

@TypeGraphQL.InputType('RoomCreateOrConnectWithoutAddressInput', {
  isAbstract: true,
})
export class RoomCreateOrConnectWithoutAddressInput {
  @TypeGraphQL.Field((_type) => RoomWhereUniqueInput, {
    nullable: false,
  })
  where!: RoomWhereUniqueInput;

  @TypeGraphQL.Field((_type) => RoomCreateWithoutAddressInput, {
    nullable: false,
  })
  create!: RoomCreateWithoutAddressInput;
}