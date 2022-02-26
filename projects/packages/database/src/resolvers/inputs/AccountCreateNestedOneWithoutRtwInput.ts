import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutRtwInput } from '../inputs/AccountCreateOrConnectWithoutRtwInput';
import { AccountCreateWithoutRtwInput } from '../inputs/AccountCreateWithoutRtwInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateNestedOneWithoutRtwInput', {
  isAbstract: true,
})
export class AccountCreateNestedOneWithoutRtwInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutRtwInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutRtwInput | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateOrConnectWithoutRtwInput, {
    nullable: true,
  })
  connectOrCreate?: AccountCreateOrConnectWithoutRtwInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;
}
