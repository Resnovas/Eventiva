import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfRoomUpdateWithoutRoomInput } from '../inputs/FeatureOfRoomUpdateWithoutRoomInput';
import { FeatureOfRoomWhereUniqueInput } from '../inputs/FeatureOfRoomWhereUniqueInput';

@TypeGraphQL.InputType('FeatureOfRoomUpdateWithWhereUniqueWithoutRoomInput', {
  isAbstract: true,
})
export class FeatureOfRoomUpdateWithWhereUniqueWithoutRoomInput {
  @TypeGraphQL.Field((_type) => FeatureOfRoomWhereUniqueInput, {
    nullable: false,
  })
  where!: FeatureOfRoomWhereUniqueInput;

  @TypeGraphQL.Field((_type) => FeatureOfRoomUpdateWithoutRoomInput, {
    nullable: false,
  })
  data!: FeatureOfRoomUpdateWithoutRoomInput;
}
