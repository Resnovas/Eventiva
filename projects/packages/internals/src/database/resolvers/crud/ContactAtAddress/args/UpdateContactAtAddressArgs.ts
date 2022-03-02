import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ContactAtAddressUpdateInput } from '../../../inputs/ContactAtAddressUpdateInput';
import { ContactAtAddressWhereUniqueInput } from '../../../inputs/ContactAtAddressWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpdateContactAtAddressArgs {
  @TypeGraphQL.Field((_type) => ContactAtAddressUpdateInput, {
    nullable: false,
  })
  data!: ContactAtAddressUpdateInput;

  @TypeGraphQL.Field((_type) => ContactAtAddressWhereUniqueInput, {
    nullable: false,
  })
  where!: ContactAtAddressWhereUniqueInput;
}
