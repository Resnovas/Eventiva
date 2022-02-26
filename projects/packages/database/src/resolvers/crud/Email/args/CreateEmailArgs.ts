import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { EmailCreateInput } from '../../../inputs/EmailCreateInput';

@TypeGraphQL.ArgsType()
export class CreateEmailArgs {
  @TypeGraphQL.Field((_type) => EmailCreateInput, {
    nullable: false,
  })
  data!: EmailCreateInput;
}
