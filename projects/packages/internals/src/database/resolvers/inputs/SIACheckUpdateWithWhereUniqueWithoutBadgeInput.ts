import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIACheckUpdateWithoutBadgeInput } from '../inputs/SIACheckUpdateWithoutBadgeInput';
import { SIACheckWhereUniqueInput } from '../inputs/SIACheckWhereUniqueInput';

@TypeGraphQL.InputType('SIACheckUpdateWithWhereUniqueWithoutBadgeInput', {
  isAbstract: true,
})
export class SIACheckUpdateWithWhereUniqueWithoutBadgeInput {
  @TypeGraphQL.Field((_type) => SIACheckWhereUniqueInput, {
    nullable: false,
  })
  where!: SIACheckWhereUniqueInput;

  @TypeGraphQL.Field((_type) => SIACheckUpdateWithoutBadgeInput, {
    nullable: false,
  })
  data!: SIACheckUpdateWithoutBadgeInput;
}
