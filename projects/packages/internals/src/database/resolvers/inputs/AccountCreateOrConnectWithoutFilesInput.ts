import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutFilesInput } from '../inputs/AccountCreateWithoutFilesInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateOrConnectWithoutFilesInput', {
  isAbstract: true,
})
export class AccountCreateOrConnectWithoutFilesInput {
  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: false,
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutFilesInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutFilesInput;
}
