import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIACheckCreateManyTransactionsInput } from '../inputs/SIACheckCreateManyTransactionsInput';

@TypeGraphQL.InputType('SIACheckCreateManyTransactionsInputEnvelope', {
  isAbstract: true,
})
export class SIACheckCreateManyTransactionsInputEnvelope {
  @TypeGraphQL.Field((_type) => [SIACheckCreateManyTransactionsInput], {
    nullable: false,
  })
  data!: SIACheckCreateManyTransactionsInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
