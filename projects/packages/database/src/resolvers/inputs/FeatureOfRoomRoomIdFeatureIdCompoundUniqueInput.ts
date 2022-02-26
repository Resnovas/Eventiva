import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';

@TypeGraphQL.InputType('FeatureOfRoomRoomIdFeatureIdCompoundUniqueInput', {
  isAbstract: true,
})
export class FeatureOfRoomRoomIdFeatureIdCompoundUniqueInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  roomId!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  featureId!: string;
}
