import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfRoomScalarWhereInput } from '../inputs/FeatureOfRoomScalarWhereInput';
import { FeatureOfRoomUpdateManyMutationInput } from '../inputs/FeatureOfRoomUpdateManyMutationInput';

@TypeGraphQL.InputType('FeatureOfRoomUpdateManyWithWhereWithoutFeatureInput', {
  isAbstract: true,
})
export class FeatureOfRoomUpdateManyWithWhereWithoutFeatureInput {
  @TypeGraphQL.Field((_type) => FeatureOfRoomScalarWhereInput, {
    nullable: false,
  })
  where!: FeatureOfRoomScalarWhereInput;

  @TypeGraphQL.Field((_type) => FeatureOfRoomUpdateManyMutationInput, {
    nullable: false,
  })
  data!: FeatureOfRoomUpdateManyMutationInput;
}
