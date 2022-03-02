import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIABadgeScalarWhereInput } from '../inputs/SIABadgeScalarWhereInput';
import { SIABadgeUpdateManyMutationInput } from '../inputs/SIABadgeUpdateManyMutationInput';

@TypeGraphQL.InputType('SIABadgeUpdateManyWithWhereWithoutAccountInput', {
  isAbstract: true,
})
export class SIABadgeUpdateManyWithWhereWithoutAccountInput {
  @TypeGraphQL.Field((_type) => SIABadgeScalarWhereInput, {
    nullable: false,
  })
  where!: SIABadgeScalarWhereInput;

  @TypeGraphQL.Field((_type) => SIABadgeUpdateManyMutationInput, {
    nullable: false,
  })
  data!: SIABadgeUpdateManyMutationInput;
}
