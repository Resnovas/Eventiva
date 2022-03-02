import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfRoomUpdateWithoutFeatureInput } from '../inputs/FeatureOfRoomUpdateWithoutFeatureInput';
import { FeatureOfRoomWhereUniqueInput } from '../inputs/FeatureOfRoomWhereUniqueInput';

@TypeGraphQL.InputType(
  'FeatureOfRoomUpdateWithWhereUniqueWithoutFeatureInput',
  {
    isAbstract: true,
  }
)
export class FeatureOfRoomUpdateWithWhereUniqueWithoutFeatureInput {
  @TypeGraphQL.Field((_type) => FeatureOfRoomWhereUniqueInput, {
    nullable: false,
  })
  where!: FeatureOfRoomWhereUniqueInput;

  @TypeGraphQL.Field((_type) => FeatureOfRoomUpdateWithoutFeatureInput, {
    nullable: false,
  })
  data!: FeatureOfRoomUpdateWithoutFeatureInput;
}
