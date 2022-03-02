import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutFilesInput } from '../inputs/AccountCreateWithoutFilesInput';
import { AccountUpdateWithoutFilesInput } from '../inputs/AccountUpdateWithoutFilesInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountUpsertWithWhereUniqueWithoutFilesInput', {
  isAbstract: true,
})
export class AccountUpsertWithWhereUniqueWithoutFilesInput {
  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: false,
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AccountUpdateWithoutFilesInput, {
    nullable: false,
  })
  update!: AccountUpdateWithoutFilesInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutFilesInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutFilesInput;
}
