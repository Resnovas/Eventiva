import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SubuserOnAccountCreateInput } from '../../../inputs/SubuserOnAccountCreateInput';

@TypeGraphQL.ArgsType()
export class CreateSubuserOnAccountArgs {
  @TypeGraphQL.Field((_type) => SubuserOnAccountCreateInput, {
    nullable: false,
  })
  data!: SubuserOnAccountCreateInput;
}
