import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutManagersInput } from '../inputs/AccountCreateOrConnectWithoutManagersInput';
import { AccountCreateWithoutManagersInput } from '../inputs/AccountCreateWithoutManagersInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateNestedOneWithoutManagersInput', {
  isAbstract: true,
})
export class AccountCreateNestedOneWithoutManagersInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutManagersInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutManagersInput | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateOrConnectWithoutManagersInput, {
    nullable: true,
  })
  connectOrCreate?: AccountCreateOrConnectWithoutManagersInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;
}
