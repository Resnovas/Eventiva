import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutPrimaryAddressInput } from '../inputs/AccountCreateOrConnectWithoutPrimaryAddressInput';
import { AccountCreateWithoutPrimaryAddressInput } from '../inputs/AccountCreateWithoutPrimaryAddressInput';
import { AccountUpdateWithoutPrimaryAddressInput } from '../inputs/AccountUpdateWithoutPrimaryAddressInput';
import { AccountUpsertWithoutPrimaryAddressInput } from '../inputs/AccountUpsertWithoutPrimaryAddressInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountUpdateOneWithoutPrimaryAddressInput', {
  isAbstract: true,
})
export class AccountUpdateOneWithoutPrimaryAddressInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutPrimaryAddressInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutPrimaryAddressInput | undefined;

  @TypeGraphQL.Field(
    (_type) => AccountCreateOrConnectWithoutPrimaryAddressInput,
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | AccountCreateOrConnectWithoutPrimaryAddressInput
    | undefined;

  @TypeGraphQL.Field((_type) => AccountUpsertWithoutPrimaryAddressInput, {
    nullable: true,
  })
  upsert?: AccountUpsertWithoutPrimaryAddressInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field((_type) => AccountUpdateWithoutPrimaryAddressInput, {
    nullable: true,
  })
  update?: AccountUpdateWithoutPrimaryAddressInput | undefined;
}
