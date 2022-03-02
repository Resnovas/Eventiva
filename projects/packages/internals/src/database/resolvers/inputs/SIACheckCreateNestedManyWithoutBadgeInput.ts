import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIACheckCreateManyBadgeInputEnvelope } from '../inputs/SIACheckCreateManyBadgeInputEnvelope';
import { SIACheckCreateOrConnectWithoutBadgeInput } from '../inputs/SIACheckCreateOrConnectWithoutBadgeInput';
import { SIACheckCreateWithoutBadgeInput } from '../inputs/SIACheckCreateWithoutBadgeInput';
import { SIACheckWhereUniqueInput } from '../inputs/SIACheckWhereUniqueInput';

@TypeGraphQL.InputType('SIACheckCreateNestedManyWithoutBadgeInput', {
  isAbstract: true,
})
export class SIACheckCreateNestedManyWithoutBadgeInput {
  @TypeGraphQL.Field((_type) => [SIACheckCreateWithoutBadgeInput], {
    nullable: true,
  })
  create?: SIACheckCreateWithoutBadgeInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SIACheckCreateOrConnectWithoutBadgeInput], {
    nullable: true,
  })
  connectOrCreate?: SIACheckCreateOrConnectWithoutBadgeInput[] | undefined;

  @TypeGraphQL.Field((_type) => SIACheckCreateManyBadgeInputEnvelope, {
    nullable: true,
  })
  createMany?: SIACheckCreateManyBadgeInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [SIACheckWhereUniqueInput], {
    nullable: true,
  })
  connect?: SIACheckWhereUniqueInput[] | undefined;
}
