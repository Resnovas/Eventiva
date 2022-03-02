import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIABadgeCreateWithoutAccountInput } from '../inputs/SIABadgeCreateWithoutAccountInput';
import { SIABadgeUpdateWithoutAccountInput } from '../inputs/SIABadgeUpdateWithoutAccountInput';
import { SIABadgeWhereUniqueInput } from '../inputs/SIABadgeWhereUniqueInput';

@TypeGraphQL.InputType('SIABadgeUpsertWithWhereUniqueWithoutAccountInput', {
  isAbstract: true,
})
export class SIABadgeUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => SIABadgeWhereUniqueInput, {
    nullable: false,
  })
  where!: SIABadgeWhereUniqueInput;

  @TypeGraphQL.Field((_type) => SIABadgeUpdateWithoutAccountInput, {
    nullable: false,
  })
  update!: SIABadgeUpdateWithoutAccountInput;

  @TypeGraphQL.Field((_type) => SIABadgeCreateWithoutAccountInput, {
    nullable: false,
  })
  create!: SIABadgeCreateWithoutAccountInput;
}
