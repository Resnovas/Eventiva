import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubscriptionCreateOrConnectWithoutAccountsInput } from '../inputs/SubscriptionCreateOrConnectWithoutAccountsInput';
import { SubscriptionCreateWithoutAccountsInput } from '../inputs/SubscriptionCreateWithoutAccountsInput';
import { SubscriptionUpdateWithoutAccountsInput } from '../inputs/SubscriptionUpdateWithoutAccountsInput';
import { SubscriptionUpsertWithoutAccountsInput } from '../inputs/SubscriptionUpsertWithoutAccountsInput';
import { SubscriptionWhereUniqueInput } from '../inputs/SubscriptionWhereUniqueInput';

@TypeGraphQL.InputType('SubscriptionUpdateOneRequiredWithoutAccountsInput', {
  isAbstract: true,
})
export class SubscriptionUpdateOneRequiredWithoutAccountsInput {
  @TypeGraphQL.Field((_type) => SubscriptionCreateWithoutAccountsInput, {
    nullable: true,
  })
  create?: SubscriptionCreateWithoutAccountsInput | undefined;

  @TypeGraphQL.Field(
    (_type) => SubscriptionCreateOrConnectWithoutAccountsInput,
    {
      nullable: true,
    }
  )
  connectOrCreate?: SubscriptionCreateOrConnectWithoutAccountsInput | undefined;

  @TypeGraphQL.Field((_type) => SubscriptionUpsertWithoutAccountsInput, {
    nullable: true,
  })
  upsert?: SubscriptionUpsertWithoutAccountsInput | undefined;

  @TypeGraphQL.Field((_type) => SubscriptionWhereUniqueInput, {
    nullable: true,
  })
  connect?: SubscriptionWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => SubscriptionUpdateWithoutAccountsInput, {
    nullable: true,
  })
  update?: SubscriptionUpdateWithoutAccountsInput | undefined;
}
