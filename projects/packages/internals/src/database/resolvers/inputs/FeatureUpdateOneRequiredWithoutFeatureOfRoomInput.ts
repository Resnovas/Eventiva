import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureCreateOrConnectWithoutFeatureOfRoomInput } from '../inputs/FeatureCreateOrConnectWithoutFeatureOfRoomInput';
import { FeatureCreateWithoutFeatureOfRoomInput } from '../inputs/FeatureCreateWithoutFeatureOfRoomInput';
import { FeatureUpdateWithoutFeatureOfRoomInput } from '../inputs/FeatureUpdateWithoutFeatureOfRoomInput';
import { FeatureUpsertWithoutFeatureOfRoomInput } from '../inputs/FeatureUpsertWithoutFeatureOfRoomInput';
import { FeatureWhereUniqueInput } from '../inputs/FeatureWhereUniqueInput';

@TypeGraphQL.InputType('FeatureUpdateOneRequiredWithoutFeatureOfRoomInput', {
  isAbstract: true,
})
export class FeatureUpdateOneRequiredWithoutFeatureOfRoomInput {
  @TypeGraphQL.Field((_type) => FeatureCreateWithoutFeatureOfRoomInput, {
    nullable: true,
  })
  create?: FeatureCreateWithoutFeatureOfRoomInput | undefined;

  @TypeGraphQL.Field(
    (_type) => FeatureCreateOrConnectWithoutFeatureOfRoomInput,
    {
      nullable: true,
    }
  )
  connectOrCreate?: FeatureCreateOrConnectWithoutFeatureOfRoomInput | undefined;

  @TypeGraphQL.Field((_type) => FeatureUpsertWithoutFeatureOfRoomInput, {
    nullable: true,
  })
  upsert?: FeatureUpsertWithoutFeatureOfRoomInput | undefined;

  @TypeGraphQL.Field((_type) => FeatureWhereUniqueInput, {
    nullable: true,
  })
  connect?: FeatureWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => FeatureUpdateWithoutFeatureOfRoomInput, {
    nullable: true,
  })
  update?: FeatureUpdateWithoutFeatureOfRoomInput | undefined;
}
