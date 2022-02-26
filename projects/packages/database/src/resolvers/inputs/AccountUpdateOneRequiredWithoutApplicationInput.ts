import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutApplicationInput } from '../inputs/AccountCreateOrConnectWithoutApplicationInput';
import { AccountCreateWithoutApplicationInput } from '../inputs/AccountCreateWithoutApplicationInput';
import { AccountUpdateWithoutApplicationInput } from '../inputs/AccountUpdateWithoutApplicationInput';
import { AccountUpsertWithoutApplicationInput } from '../inputs/AccountUpsertWithoutApplicationInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountUpdateOneRequiredWithoutApplicationInput', {
  isAbstract: true,
})
export class AccountUpdateOneRequiredWithoutApplicationInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutApplicationInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutApplicationInput | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateOrConnectWithoutApplicationInput, {
    nullable: true,
  })
  connectOrCreate?: AccountCreateOrConnectWithoutApplicationInput | undefined;

  @TypeGraphQL.Field((_type) => AccountUpsertWithoutApplicationInput, {
    nullable: true,
  })
  upsert?: AccountUpsertWithoutApplicationInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => AccountUpdateWithoutApplicationInput, {
    nullable: true,
  })
  update?: AccountUpdateWithoutApplicationInput | undefined;
}
