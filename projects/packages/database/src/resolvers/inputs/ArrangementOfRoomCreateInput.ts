import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementCreateNestedOneWithoutRoomInput } from '../inputs/ArrangementCreateNestedOneWithoutRoomInput';
import { RoomCreateNestedOneWithoutArrangementsInput } from '../inputs/RoomCreateNestedOneWithoutArrangementsInput';

@TypeGraphQL.InputType('ArrangementOfRoomCreateInput', {
  isAbstract: true,
})
export class ArrangementOfRoomCreateInput {
  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  capacity!: number;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  details?: string | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => ArrangementCreateNestedOneWithoutRoomInput, {
    nullable: false,
  })
  arrangement!: ArrangementCreateNestedOneWithoutRoomInput;

  @TypeGraphQL.Field((_type) => RoomCreateNestedOneWithoutArrangementsInput, {
    nullable: false,
  })
  room!: RoomCreateNestedOneWithoutArrangementsInput;
}
