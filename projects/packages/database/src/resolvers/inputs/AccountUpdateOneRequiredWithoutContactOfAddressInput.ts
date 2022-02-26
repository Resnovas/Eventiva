import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutContactOfAddressInput } from '../inputs/AccountCreateOrConnectWithoutContactOfAddressInput';
import { AccountCreateWithoutContactOfAddressInput } from '../inputs/AccountCreateWithoutContactOfAddressInput';
import { AccountUpdateWithoutContactOfAddressInput } from '../inputs/AccountUpdateWithoutContactOfAddressInput';
import { AccountUpsertWithoutContactOfAddressInput } from '../inputs/AccountUpsertWithoutContactOfAddressInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountUpdateOneRequiredWithoutContactOfAddressInput', {
  isAbstract: true,
})
export class AccountUpdateOneRequiredWithoutContactOfAddressInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutContactOfAddressInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutContactOfAddressInput | undefined;

  @TypeGraphQL.Field(
    (_type) => AccountCreateOrConnectWithoutContactOfAddressInput,
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | AccountCreateOrConnectWithoutContactOfAddressInput
    | undefined;

  @TypeGraphQL.Field((_type) => AccountUpsertWithoutContactOfAddressInput, {
    nullable: true,
  })
  upsert?: AccountUpsertWithoutContactOfAddressInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => AccountUpdateWithoutContactOfAddressInput, {
    nullable: true,
  })
  update?: AccountUpdateWithoutContactOfAddressInput | undefined;
}
