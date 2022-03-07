import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';

@TypeGraphQL.ObjectType('ContactAtAddressMaxAggregate', {
  isAbstract: true,
})
export class ContactAtAddressMaxAggregate {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  accountId!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  addressId!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  jobTitle!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  phone!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  emailId!: string | null;

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
}