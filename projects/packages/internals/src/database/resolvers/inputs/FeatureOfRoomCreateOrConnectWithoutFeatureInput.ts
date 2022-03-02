import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfRoomCreateWithoutFeatureInput } from '../inputs/FeatureOfRoomCreateWithoutFeatureInput';
import { FeatureOfRoomWhereUniqueInput } from '../inputs/FeatureOfRoomWhereUniqueInput';

@TypeGraphQL.InputType('FeatureOfRoomCreateOrConnectWithoutFeatureInput', {
  isAbstract: true,
})
export class FeatureOfRoomCreateOrConnectWithoutFeatureInput {
  @TypeGraphQL.Field((_type) => FeatureOfRoomWhereUniqueInput, {
    nullable: false,
  })
  where!: FeatureOfRoomWhereUniqueInput;

  @TypeGraphQL.Field((_type) => FeatureOfRoomCreateWithoutFeatureInput, {
    nullable: false,
  })
  create!: FeatureOfRoomCreateWithoutFeatureInput;
}
