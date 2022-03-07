import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SIABadgeCreateInput } from '../../../inputs/SIABadgeCreateInput';

@TypeGraphQL.ArgsType()
export class CreateSIABadgeArgs {
  @TypeGraphQL.Field((_type) => SIABadgeCreateInput, {
    nullable: false,
  })
  data!: SIABadgeCreateInput;
}
