import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfRoomCreateWithoutRoomInput } from '../inputs/FeatureOfRoomCreateWithoutRoomInput';
import { FeatureOfRoomWhereUniqueInput } from '../inputs/FeatureOfRoomWhereUniqueInput';

@TypeGraphQL.InputType('FeatureOfRoomCreateOrConnectWithoutRoomInput', {
  isAbstract: true,
})
export class FeatureOfRoomCreateOrConnectWithoutRoomInput {
  @TypeGraphQL.Field((_type) => FeatureOfRoomWhereUniqueInput, {
    nullable: false,
  })
  where!: FeatureOfRoomWhereUniqueInput;

  @TypeGraphQL.Field((_type) => FeatureOfRoomCreateWithoutRoomInput, {
    nullable: false,
  })
  create!: FeatureOfRoomCreateWithoutRoomInput;
}
