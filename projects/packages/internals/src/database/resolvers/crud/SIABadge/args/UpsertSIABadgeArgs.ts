import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SIABadgeCreateInput } from '../../../inputs/SIABadgeCreateInput';
import { SIABadgeUpdateInput } from '../../../inputs/SIABadgeUpdateInput';
import { SIABadgeWhereUniqueInput } from '../../../inputs/SIABadgeWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertSIABadgeArgs {
  @TypeGraphQL.Field((_type) => SIABadgeWhereUniqueInput, {
    nullable: false,
  })
  where!: SIABadgeWhereUniqueInput;

  @TypeGraphQL.Field((_type) => SIABadgeCreateInput, {
    nullable: false,
  })
  create!: SIABadgeCreateInput;

  @TypeGraphQL.Field((_type) => SIABadgeUpdateInput, {
    nullable: false,
  })
  update!: SIABadgeUpdateInput;
}
