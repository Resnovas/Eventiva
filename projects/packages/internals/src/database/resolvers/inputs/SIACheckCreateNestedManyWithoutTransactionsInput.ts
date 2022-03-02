import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIACheckCreateManyTransactionsInputEnvelope } from '../inputs/SIACheckCreateManyTransactionsInputEnvelope';
import { SIACheckCreateOrConnectWithoutTransactionsInput } from '../inputs/SIACheckCreateOrConnectWithoutTransactionsInput';
import { SIACheckCreateWithoutTransactionsInput } from '../inputs/SIACheckCreateWithoutTransactionsInput';
import { SIACheckWhereUniqueInput } from '../inputs/SIACheckWhereUniqueInput';

@TypeGraphQL.InputType('SIACheckCreateNestedManyWithoutTransactionsInput', {
  isAbstract: true,
})
export class SIACheckCreateNestedManyWithoutTransactionsInput {
  @TypeGraphQL.Field((_type) => [SIACheckCreateWithoutTransactionsInput], {
    nullable: true,
  })
  create?: SIACheckCreateWithoutTransactionsInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [SIACheckCreateOrConnectWithoutTransactionsInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | SIACheckCreateOrConnectWithoutTransactionsInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => SIACheckCreateManyTransactionsInputEnvelope, {
    nullable: true,
  })
  createMany?: SIACheckCreateManyTransactionsInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [SIACheckWhereUniqueInput], {
    nullable: true,
  })
  connect?: SIACheckWhereUniqueInput[] | undefined;
}
