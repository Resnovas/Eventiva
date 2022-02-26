import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIABadgeCreateOrConnectWithoutSiaChecksInput } from '../inputs/SIABadgeCreateOrConnectWithoutSiaChecksInput';
import { SIABadgeCreateWithoutSiaChecksInput } from '../inputs/SIABadgeCreateWithoutSiaChecksInput';
import { SIABadgeUpdateWithoutSiaChecksInput } from '../inputs/SIABadgeUpdateWithoutSiaChecksInput';
import { SIABadgeUpsertWithoutSiaChecksInput } from '../inputs/SIABadgeUpsertWithoutSiaChecksInput';
import { SIABadgeWhereUniqueInput } from '../inputs/SIABadgeWhereUniqueInput';

@TypeGraphQL.InputType('SIABadgeUpdateOneWithoutSiaChecksInput', {
  isAbstract: true,
})
export class SIABadgeUpdateOneWithoutSiaChecksInput {
  @TypeGraphQL.Field((_type) => SIABadgeCreateWithoutSiaChecksInput, {
    nullable: true,
  })
  create?: SIABadgeCreateWithoutSiaChecksInput | undefined;

  @TypeGraphQL.Field((_type) => SIABadgeCreateOrConnectWithoutSiaChecksInput, {
    nullable: true,
  })
  connectOrCreate?: SIABadgeCreateOrConnectWithoutSiaChecksInput | undefined;

  @TypeGraphQL.Field((_type) => SIABadgeUpsertWithoutSiaChecksInput, {
    nullable: true,
  })
  upsert?: SIABadgeUpsertWithoutSiaChecksInput | undefined;

  @TypeGraphQL.Field((_type) => SIABadgeWhereUniqueInput, {
    nullable: true,
  })
  connect?: SIABadgeWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field((_type) => SIABadgeUpdateWithoutSiaChecksInput, {
    nullable: true,
  })
  update?: SIABadgeUpdateWithoutSiaChecksInput | undefined;
}
