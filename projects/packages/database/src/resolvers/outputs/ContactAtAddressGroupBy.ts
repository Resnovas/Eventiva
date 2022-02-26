import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ContactAtAddressCountAggregate } from '../outputs/ContactAtAddressCountAggregate';
import { ContactAtAddressMaxAggregate } from '../outputs/ContactAtAddressMaxAggregate';
import { ContactAtAddressMinAggregate } from '../outputs/ContactAtAddressMinAggregate';

@TypeGraphQL.ObjectType('ContactAtAddressGroupBy', {
  isAbstract: true,
})
export class ContactAtAddressGroupBy {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  accountId!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  addressId!: string;

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

  @TypeGraphQL.Field((_type) => ContactAtAddressCountAggregate, {
    nullable: true,
  })
  _count!: ContactAtAddressCountAggregate | null;

  @TypeGraphQL.Field((_type) => ContactAtAddressMinAggregate, {
    nullable: true,
  })
  _min!: ContactAtAddressMinAggregate | null;

  @TypeGraphQL.Field((_type) => ContactAtAddressMaxAggregate, {
    nullable: true,
  })
  _max!: ContactAtAddressMaxAggregate | null;
}
