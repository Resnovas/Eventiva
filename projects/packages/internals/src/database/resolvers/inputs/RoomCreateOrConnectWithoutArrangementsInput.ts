import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RoomCreateWithoutArrangementsInput } from '../inputs/RoomCreateWithoutArrangementsInput';
import { RoomWhereUniqueInput } from '../inputs/RoomWhereUniqueInput';

@TypeGraphQL.InputType('RoomCreateOrConnectWithoutArrangementsInput', {
  isAbstract: true,
})
export class RoomCreateOrConnectWithoutArrangementsInput {
  @TypeGraphQL.Field((_type) => RoomWhereUniqueInput, {
    nullable: false,
  })
  where!: RoomWhereUniqueInput;

  @TypeGraphQL.Field((_type) => RoomCreateWithoutArrangementsInput, {
    nullable: false,
  })
  create!: RoomCreateWithoutArrangementsInput;
}
