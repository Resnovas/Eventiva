import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutApiTokenInput } from '../inputs/AccountCreateOrConnectWithoutApiTokenInput';
import { AccountCreateWithoutApiTokenInput } from '../inputs/AccountCreateWithoutApiTokenInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateNestedOneWithoutApiTokenInput', {
  isAbstract: true,
})
export class AccountCreateNestedOneWithoutApiTokenInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutApiTokenInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutApiTokenInput | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateOrConnectWithoutApiTokenInput, {
    nullable: true,
  })
  connectOrCreate?: AccountCreateOrConnectWithoutApiTokenInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;
}
