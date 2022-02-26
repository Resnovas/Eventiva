import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutPhonesInput } from '../inputs/AccountCreateOrConnectWithoutPhonesInput';
import { AccountCreateWithoutPhonesInput } from '../inputs/AccountCreateWithoutPhonesInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateNestedOneWithoutPhonesInput', {
  isAbstract: true,
})
export class AccountCreateNestedOneWithoutPhonesInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutPhonesInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutPhonesInput | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateOrConnectWithoutPhonesInput, {
    nullable: true,
  })
  connectOrCreate?: AccountCreateOrConnectWithoutPhonesInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;
}
