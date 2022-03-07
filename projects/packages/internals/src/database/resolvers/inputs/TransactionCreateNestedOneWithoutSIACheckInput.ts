import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { TransactionCreateOrConnectWithoutSIACheckInput } from '../inputs/TransactionCreateOrConnectWithoutSIACheckInput';
import { TransactionCreateWithoutSIACheckInput } from '../inputs/TransactionCreateWithoutSIACheckInput';
import { TransactionWhereUniqueInput } from '../inputs/TransactionWhereUniqueInput';

@TypeGraphQL.InputType('TransactionCreateNestedOneWithoutSIACheckInput', {
  isAbstract: true,
})
export class TransactionCreateNestedOneWithoutSIACheckInput {
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

  @TypeGraphQL.Field((_type) => TransactionWhereUniqueInput, {
    nullable: true,
  })
  connect?: TransactionWhereUniqueInput | undefined;
}
