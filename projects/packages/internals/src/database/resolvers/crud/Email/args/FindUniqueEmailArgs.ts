import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { EmailWhereUniqueInput } from '../../../inputs/EmailWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class FindUniqueEmailArgs {
  @TypeGraphQL.Field((_type) => EmailWhereUniqueInput, {
    nullable: false,
  })
  where!: EmailWhereUniqueInput;
}
