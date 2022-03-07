import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIABadgeCreateManyAccountInputEnvelope } from '../inputs/SIABadgeCreateManyAccountInputEnvelope';
import { SIABadgeCreateOrConnectWithoutAccountInput } from '../inputs/SIABadgeCreateOrConnectWithoutAccountInput';
import { SIABadgeCreateWithoutAccountInput } from '../inputs/SIABadgeCreateWithoutAccountInput';
import { SIABadgeWhereUniqueInput } from '../inputs/SIABadgeWhereUniqueInput';

@TypeGraphQL.InputType('SIABadgeCreateNestedManyWithoutAccountInput', {
  isAbstract: true,
})
export class SIABadgeCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field((_type) => [SIABadgeCreateWithoutAccountInput], {
    nullable: true,
  })
  create?: SIABadgeCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SIABadgeCreateOrConnectWithoutAccountInput], {
    nullable: true,
  })
  connectOrCreate?: SIABadgeCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => SIABadgeCreateManyAccountInputEnvelope, {
    nullable: true,
  })
  createMany?: SIABadgeCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [SIABadgeWhereUniqueInput], {
    nullable: true,
  })
  connect?: SIABadgeWhereUniqueInput[] | undefined;
}
