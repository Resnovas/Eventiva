import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressType } from '../../enums/AddressType';

@TypeGraphQL.ObjectType('AddressMinAggregate', {
  isAbstract: true,
})
export class AddressMinAggregate {
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

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  accountId!: string | null;

  @TypeGraphQL.Field((_type) => AddressType, {
    nullable: true,
  })
  type!: 'PERSONAL' | 'BUSINESS' | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  coords!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  street!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  city!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  state!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  country!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  zipcode!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  addressName!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  name!: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  parking!: boolean | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  website!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  features!: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  public!: boolean | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  primaryaccountId!: string | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted!: Date | null;
}
