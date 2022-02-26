import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIABadgeCreateWithoutAccountInput } from '../inputs/SIABadgeCreateWithoutAccountInput';
import { SIABadgeWhereUniqueInput } from '../inputs/SIABadgeWhereUniqueInput';

@TypeGraphQL.InputType('SIABadgeCreateOrConnectWithoutAccountInput', {
  isAbstract: true,
})
export class SIABadgeCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field((_type) => SIABadgeWhereUniqueInput, {
    nullable: false,
  })
  where!: SIABadgeWhereUniqueInput;

  @TypeGraphQL.Field((_type) => SIABadgeCreateWithoutAccountInput, {
    nullable: false,
  })
  create!: SIABadgeCreateWithoutAccountInput;
}
