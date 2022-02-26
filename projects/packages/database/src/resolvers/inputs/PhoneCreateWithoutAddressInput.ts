import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateNestedOneWithoutPhonesInput } from '../inputs/AccountCreateNestedOneWithoutPhonesInput';

@TypeGraphQL.InputType('PhoneCreateWithoutAddressInput', {
  isAbstract: true,
})
export class PhoneCreateWithoutAddressInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id?: string | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted?: Date | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  phone!: string;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  public?: boolean | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateNestedOneWithoutPhonesInput, {
    nullable: false,
  })
  account!: AccountCreateNestedOneWithoutPhonesInput;
}
