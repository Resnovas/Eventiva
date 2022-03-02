import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutSiaInput } from '../inputs/AccountCreateOrConnectWithoutSiaInput';
import { AccountCreateWithoutSiaInput } from '../inputs/AccountCreateWithoutSiaInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateNestedOneWithoutSiaInput', {
  isAbstract: true,
})
export class AccountCreateNestedOneWithoutSiaInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutSiaInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutSiaInput | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateOrConnectWithoutSiaInput, {
    nullable: true,
  })
  connectOrCreate?: AccountCreateOrConnectWithoutSiaInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;
}
