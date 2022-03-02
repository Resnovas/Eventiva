import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../scalars';
import { Feature } from '../models/Feature';
import { Room } from '../models/Room';

@TypeGraphQL.ObjectType('FeatureOfRoom', {
  isAbstract: true,
})
export class FeatureOfRoom {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  roomId!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  featureId!: string;

  feature?: Feature;

  room?: Room;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  data?: Prisma.JsonValue | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted?: Date | null;
}
