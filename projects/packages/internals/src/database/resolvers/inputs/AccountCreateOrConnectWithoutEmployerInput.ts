import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutEmployerInput } from '../inputs/AccountCreateWithoutEmployerInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateOrConnectWithoutEmployerInput', {
  isAbstract: true,
})
export class AccountCreateOrConnectWithoutEmployerInput {
  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: false,
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutEmployerInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutEmployerInput;
}
