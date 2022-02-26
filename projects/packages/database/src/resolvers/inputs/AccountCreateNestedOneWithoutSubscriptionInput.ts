import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutSubscriptionInput } from '../inputs/AccountCreateOrConnectWithoutSubscriptionInput';
import { AccountCreateWithoutSubscriptionInput } from '../inputs/AccountCreateWithoutSubscriptionInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateNestedOneWithoutSubscriptionInput', {
  isAbstract: true,
})
export class AccountCreateNestedOneWithoutSubscriptionInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutSubscriptionInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutSubscriptionInput | undefined;

  @TypeGraphQL.Field(
    (_type) => AccountCreateOrConnectWithoutSubscriptionInput,
    {
      nullable: true,
    }
  )
  connectOrCreate?: AccountCreateOrConnectWithoutSubscriptionInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;
}
