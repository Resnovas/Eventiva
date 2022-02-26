import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ContactAtAddressCreateInput } from '../../../inputs/ContactAtAddressCreateInput';

@TypeGraphQL.ArgsType()
export class CreateContactAtAddressArgs {
  @TypeGraphQL.Field((_type) => ContactAtAddressCreateInput, {
    nullable: false,
  })
  data!: ContactAtAddressCreateInput;
}
