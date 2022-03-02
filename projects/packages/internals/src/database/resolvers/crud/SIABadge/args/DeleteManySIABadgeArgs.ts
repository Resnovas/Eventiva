import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SIABadgeWhereInput } from '../../../inputs/SIABadgeWhereInput';

@TypeGraphQL.ArgsType()
export class DeleteManySIABadgeArgs {
  @TypeGraphQL.Field((_type) => SIABadgeWhereInput, {
    nullable: true,
  })
  where?: SIABadgeWhereInput | undefined;
}
