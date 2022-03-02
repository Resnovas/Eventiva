import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutSubusersInput } from '../inputs/AccountCreateOrConnectWithoutSubusersInput';
import { AccountCreateWithoutSubusersInput } from '../inputs/AccountCreateWithoutSubusersInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateNestedOneWithoutSubusersInput', {
  isAbstract: true,
})
export class AccountCreateNestedOneWithoutSubusersInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutSubusersInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutSubusersInput | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateOrConnectWithoutSubusersInput, {
    nullable: true,
  })
  connectOrCreate?: AccountCreateOrConnectWithoutSubusersInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;
}
