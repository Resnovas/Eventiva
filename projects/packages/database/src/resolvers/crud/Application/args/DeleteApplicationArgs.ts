import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ApplicationWhereUniqueInput } from '../../../inputs/ApplicationWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class DeleteApplicationArgs {
  @TypeGraphQL.Field((_type) => ApplicationWhereUniqueInput, {
    nullable: false,
  })
  where!: ApplicationWhereUniqueInput;
}
