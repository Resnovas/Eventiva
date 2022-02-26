import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutSiaInput } from '../inputs/AccountCreateWithoutSiaInput';
import { AccountUpdateWithoutSiaInput } from '../inputs/AccountUpdateWithoutSiaInput';

@TypeGraphQL.InputType('AccountUpsertWithoutSiaInput', {
  isAbstract: true,
})
export class AccountUpsertWithoutSiaInput {
  @TypeGraphQL.Field((_type) => AccountUpdateWithoutSiaInput, {
    nullable: false,
  })
  update!: AccountUpdateWithoutSiaInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutSiaInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutSiaInput;
}
