import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SIABadgeUpdateInput } from '../../../inputs/SIABadgeUpdateInput';
import { SIABadgeWhereUniqueInput } from '../../../inputs/SIABadgeWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpdateSIABadgeArgs {
  @TypeGraphQL.Field((_type) => SIABadgeUpdateInput, {
    nullable: false,
  })
  data!: SIABadgeUpdateInput;

  @TypeGraphQL.Field((_type) => SIABadgeWhereUniqueInput, {
    nullable: false,
  })
  where!: SIABadgeWhereUniqueInput;
}
