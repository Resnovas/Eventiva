import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutApplicationInput } from '../inputs/AccountCreateWithoutApplicationInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateOrConnectWithoutApplicationInput', {
  isAbstract: true,
})
export class AccountCreateOrConnectWithoutApplicationInput {
  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: false,
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutApplicationInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutApplicationInput;
}
