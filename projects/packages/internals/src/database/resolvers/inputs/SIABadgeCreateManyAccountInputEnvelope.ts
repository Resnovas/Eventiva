import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIABadgeCreateManyAccountInput } from '../inputs/SIABadgeCreateManyAccountInput';

@TypeGraphQL.InputType('SIABadgeCreateManyAccountInputEnvelope', {
  isAbstract: true,
})
export class SIABadgeCreateManyAccountInputEnvelope {
  @TypeGraphQL.Field((_type) => [SIABadgeCreateManyAccountInput], {
    nullable: false,
  })
  data!: SIABadgeCreateManyAccountInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
