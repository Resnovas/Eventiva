import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { EmailWhereInput } from '../../../inputs/EmailWhereInput';

@TypeGraphQL.ArgsType()
export class DeleteManyEmailArgs {
  @TypeGraphQL.Field((_type) => EmailWhereInput, {
    nullable: true,
  })
  where?: EmailWhereInput | undefined;
}
