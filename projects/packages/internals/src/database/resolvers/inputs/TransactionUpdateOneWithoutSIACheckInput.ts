import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { TransactionCreateOrConnectWithoutSIACheckInput } from '../inputs/TransactionCreateOrConnectWithoutSIACheckInput';
import { TransactionCreateWithoutSIACheckInput } from '../inputs/TransactionCreateWithoutSIACheckInput';
import { TransactionUpdateWithoutSIACheckInput } from '../inputs/TransactionUpdateWithoutSIACheckInput';
import { TransactionUpsertWithoutSIACheckInput } from '../inputs/TransactionUpsertWithoutSIACheckInput';
import { TransactionWhereUniqueInput } from '../inputs/TransactionWhereUniqueInput';

@TypeGraphQL.InputType('TransactionUpdateOneWithoutSIACheckInput', {
  isAbstract: true,
})
export class TransactionUpdateOneWithoutSIACheckInput {
  @TypeGraphQL.Field((_type) => TransactionCreateWithoutSIACheckInput, {
    nullable: true,
  })
  create?: TransactionCreateWithoutSIACheckInput | undefined;

  @TypeGraphQL.Field(
    (_type) => TransactionCreateOrConnectWithoutSIACheckInput,
    {
      nullable: true,
    }
  )
  connectOrCreate?: TransactionCreateOrConnectWithoutSIACheckInput | undefined;

  @TypeGraphQL.Field((_type) => TransactionUpsertWithoutSIACheckInput, {
    nullable: true,
  })
  upsert?: TransactionUpsertWithoutSIACheckInput | undefined;

  @TypeGraphQL.Field((_type) => TransactionWhereUniqueInput, {
    nullable: true,
  })
  connect?: TransactionWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field((_type) => TransactionUpdateWithoutSIACheckInput, {
    nullable: true,
  })
  update?: TransactionUpdateWithoutSIACheckInput | undefined;
}
