import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutRtwInput } from '../inputs/AccountCreateOrConnectWithoutRtwInput';
import { AccountCreateWithoutRtwInput } from '../inputs/AccountCreateWithoutRtwInput';
import { AccountUpdateWithoutRtwInput } from '../inputs/AccountUpdateWithoutRtwInput';
import { AccountUpsertWithoutRtwInput } from '../inputs/AccountUpsertWithoutRtwInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountUpdateOneRequiredWithoutRtwInput', {
  isAbstract: true,
})
export class AccountUpdateOneRequiredWithoutRtwInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutRtwInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutRtwInput | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateOrConnectWithoutRtwInput, {
    nullable: true,
  })
  connectOrCreate?: AccountCreateOrConnectWithoutRtwInput | undefined;

  @TypeGraphQL.Field((_type) => AccountUpsertWithoutRtwInput, {
    nullable: true,
  })
  upsert?: AccountUpsertWithoutRtwInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => AccountUpdateWithoutRtwInput, {
    nullable: true,
  })
  update?: AccountUpdateWithoutRtwInput | undefined;
}
