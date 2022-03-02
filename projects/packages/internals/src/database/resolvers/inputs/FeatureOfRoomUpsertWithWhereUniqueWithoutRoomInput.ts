import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfRoomCreateWithoutRoomInput } from '../inputs/FeatureOfRoomCreateWithoutRoomInput';
import { FeatureOfRoomUpdateWithoutRoomInput } from '../inputs/FeatureOfRoomUpdateWithoutRoomInput';
import { FeatureOfRoomWhereUniqueInput } from '../inputs/FeatureOfRoomWhereUniqueInput';

@TypeGraphQL.InputType('FeatureOfRoomUpsertWithWhereUniqueWithoutRoomInput', {
  isAbstract: true,
})
export class FeatureOfRoomUpsertWithWhereUniqueWithoutRoomInput {
  @TypeGraphQL.Field((_type) => FeatureOfRoomWhereUniqueInput, {
    nullable: false,
  })
  where!: FeatureOfRoomWhereUniqueInput;

  @TypeGraphQL.Field((_type) => FeatureOfRoomUpdateWithoutRoomInput, {
    nullable: false,
  })
  update!: FeatureOfRoomUpdateWithoutRoomInput;

  @TypeGraphQL.Field((_type) => FeatureOfRoomCreateWithoutRoomInput, {
    nullable: false,
  })
  create!: FeatureOfRoomCreateWithoutRoomInput;
}
