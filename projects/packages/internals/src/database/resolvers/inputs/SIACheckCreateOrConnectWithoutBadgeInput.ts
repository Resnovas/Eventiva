import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIACheckCreateWithoutBadgeInput } from '../inputs/SIACheckCreateWithoutBadgeInput';
import { SIACheckWhereUniqueInput } from '../inputs/SIACheckWhereUniqueInput';

@TypeGraphQL.InputType('SIACheckCreateOrConnectWithoutBadgeInput', {
  isAbstract: true,
})
export class SIACheckCreateOrConnectWithoutBadgeInput {
  @TypeGraphQL.Field((_type) => SIACheckWhereUniqueInput, {
    nullable: false,
  })
  where!: SIACheckWhereUniqueInput;

  @TypeGraphQL.Field((_type) => SIACheckCreateWithoutBadgeInput, {
    nullable: false,
  })
  create!: SIACheckCreateWithoutBadgeInput;
}
