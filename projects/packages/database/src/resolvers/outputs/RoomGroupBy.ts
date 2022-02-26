import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RoomCountAggregate } from '../outputs/RoomCountAggregate';
import { RoomMaxAggregate } from '../outputs/RoomMaxAggregate';
import { RoomMinAggregate } from '../outputs/RoomMinAggregate';

@TypeGraphQL.ObjectType('RoomGroupBy', {
  isAbstract: true,
})
export class RoomGroupBy {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

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
  deleted!: Date | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  addressId!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  name!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  floor!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  building!: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  accessibility!: boolean | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  checkin!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  checkout!: Date | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  length!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  width!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  height!: string | null;

  @TypeGraphQL.Field((_type) => RoomCountAggregate, {
    nullable: true,
  })
  _count!: RoomCountAggregate | null;

  @TypeGraphQL.Field((_type) => RoomMinAggregate, {
    nullable: true,
  })
  _min!: RoomMinAggregate | null;

  @TypeGraphQL.Field((_type) => RoomMaxAggregate, {
    nullable: true,
  })
  _max!: RoomMaxAggregate | null;
}
