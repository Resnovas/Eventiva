import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIACheckCreateWithoutBadgeInput } from '../inputs/SIACheckCreateWithoutBadgeInput';
import { SIACheckUpdateWithoutBadgeInput } from '../inputs/SIACheckUpdateWithoutBadgeInput';
import { SIACheckWhereUniqueInput } from '../inputs/SIACheckWhereUniqueInput';

@TypeGraphQL.InputType('SIACheckUpsertWithWhereUniqueWithoutBadgeInput', {
  isAbstract: true,
})
export class SIACheckUpsertWithWhereUniqueWithoutBadgeInput {
  @TypeGraphQL.Field((_type) => SIACheckWhereUniqueInput, {
    nullable: false,
  })
  where!: SIACheckWhereUniqueInput;

  @TypeGraphQL.Field((_type) => SIACheckUpdateWithoutBadgeInput, {
    nullable: false,
  })
  update!: SIACheckUpdateWithoutBadgeInput;

  @TypeGraphQL.Field((_type) => SIACheckCreateWithoutBadgeInput, {
    nullable: false,
  })
  create!: SIACheckCreateWithoutBadgeInput;
}
