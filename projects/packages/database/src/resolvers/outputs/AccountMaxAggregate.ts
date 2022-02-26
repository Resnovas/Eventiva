import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountType } from '../../enums/AccountType';
import { Title } from '../../enums/Title';

@TypeGraphQL.ObjectType('AccountMaxAggregate', {
  isAbstract: true,
})
export class AccountMaxAggregate {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  username!: string | null;

  @TypeGraphQL.Field((_type) => AccountType, {
    nullable: true,
  })
  accountType!: 'USER' | 'BUSINESS' | 'PROVIDER' | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  subsciption!: boolean | null;

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
  lastLogin!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  applied!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  promoted!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  retired!: Date | null;

  @TypeGraphQL.Field((_type) => Title, {
    nullable: true,
  })
  title!: 'Miss' | 'Ms' | 'Mrs' | 'Mr' | 'Dr' | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  firstname!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  midname!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  lastname!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  Salutation!: string | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  dob!: Date | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  sex!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  label!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  password!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  resetPasswordToken!: string | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  resetPasswordExpires!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted!: Date | null;
}
