import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutApiTokenInput } from '../inputs/AccountCreateOrConnectWithoutApiTokenInput';
import { AccountCreateWithoutApiTokenInput } from '../inputs/AccountCreateWithoutApiTokenInput';
import { AccountUpdateWithoutApiTokenInput } from '../inputs/AccountUpdateWithoutApiTokenInput';
import { AccountUpsertWithoutApiTokenInput } from '../inputs/AccountUpsertWithoutApiTokenInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountUpdateOneRequiredWithoutApiTokenInput', {
  isAbstract: true,
})
export class AccountUpdateOneRequiredWithoutApiTokenInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutApiTokenInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutApiTokenInput | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateOrConnectWithoutApiTokenInput, {
    nullable: true,
  })
  connectOrCreate?: AccountCreateOrConnectWithoutApiTokenInput | undefined;

  @TypeGraphQL.Field((_type) => AccountUpsertWithoutApiTokenInput, {
    nullable: true,
  })
  upsert?: AccountUpsertWithoutApiTokenInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => AccountUpdateWithoutApiTokenInput, {
    nullable: true,
  })
  update?: AccountUpdateWithoutApiTokenInput | undefined;
}
