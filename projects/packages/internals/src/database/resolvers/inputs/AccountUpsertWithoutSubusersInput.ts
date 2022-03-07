import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutSubusersInput } from '../inputs/AccountCreateWithoutSubusersInput';
import { AccountUpdateWithoutSubusersInput } from '../inputs/AccountUpdateWithoutSubusersInput';

@TypeGraphQL.InputType('AccountUpsertWithoutSubusersInput', {
  isAbstract: true,
})
export class AccountUpsertWithoutSubusersInput {
  @TypeGraphQL.Field((_type) => AccountUpdateWithoutSubusersInput, {
    nullable: false,
  })
  update!: AccountUpdateWithoutSubusersInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutSubusersInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutSubusersInput;
}
