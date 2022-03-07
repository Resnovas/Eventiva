import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIACheckUpdateWithoutTransactionsInput } from '../inputs/SIACheckUpdateWithoutTransactionsInput';
import { SIACheckWhereUniqueInput } from '../inputs/SIACheckWhereUniqueInput';

@TypeGraphQL.InputType(
  'SIACheckUpdateWithWhereUniqueWithoutTransactionsInput',
  {
    isAbstract: true,
  }
)
export class SIACheckUpdateWithWhereUniqueWithoutTransactionsInput {
  @TypeGraphQL.Field((_type) => SIACheckWhereUniqueInput, {
    nullable: false,
  })
  where!: SIACheckWhereUniqueInput;

  @TypeGraphQL.Field((_type) => SIACheckUpdateWithoutTransactionsInput, {
    nullable: false,
  })
  data!: SIACheckUpdateWithoutTransactionsInput;
}
