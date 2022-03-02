import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureCreateNestedOneWithoutFeatureOfRoomInput } from '../inputs/FeatureCreateNestedOneWithoutFeatureOfRoomInput';
import { RoomCreateNestedOneWithoutFeaturesOfRoomInput } from '../inputs/RoomCreateNestedOneWithoutFeaturesOfRoomInput';

@TypeGraphQL.InputType('FeatureOfRoomCreateInput', {
  isAbstract: true,
})
export class FeatureOfRoomCreateInput {
  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  data?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted?: Date | undefined;

  @TypeGraphQL.Field(
    (_type) => FeatureCreateNestedOneWithoutFeatureOfRoomInput,
    {
      nullable: false,
    }
  )
  feature!: FeatureCreateNestedOneWithoutFeatureOfRoomInput;

  @TypeGraphQL.Field((_type) => RoomCreateNestedOneWithoutFeaturesOfRoomInput, {
    nullable: false,
  })
  room!: RoomCreateNestedOneWithoutFeaturesOfRoomInput;
}
