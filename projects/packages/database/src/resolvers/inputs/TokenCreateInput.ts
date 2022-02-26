import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateNestedOneWithoutApiTokenInput } from '../inputs/AccountCreateNestedOneWithoutApiTokenInput';
import { TokenType } from '../../enums/TokenType';

@TypeGraphQL.InputType('TokenCreateInput', {
  isAbstract: true,
})
export class TokenCreateInput {
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

  @TypeGraphQL.Field((_type) => TokenType, {
    nullable: false,
  })
  type!: 'API' | 'PERSONAL' | 'SYSTEM';

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  value!: string;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  valid?: boolean | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  expiry!: Date;

  @TypeGraphQL.Field((_type) => AccountCreateNestedOneWithoutApiTokenInput, {
    nullable: false,
  })
  account!: AccountCreateNestedOneWithoutApiTokenInput;
}
