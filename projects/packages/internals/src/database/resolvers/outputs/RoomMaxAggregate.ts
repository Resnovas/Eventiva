import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';

@TypeGraphQL.ObjectType('RoomMaxAggregate', {
  isAbstract: true,
})
export class RoomMaxAggregate {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id!: string | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted!: Date | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  addressId!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  name!: string | null;

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
}
