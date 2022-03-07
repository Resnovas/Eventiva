import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ContactAtAddressCreateInput } from '../../../inputs/ContactAtAddressCreateInput';
import { ContactAtAddressUpdateInput } from '../../../inputs/ContactAtAddressUpdateInput';
import { ContactAtAddressWhereUniqueInput } from '../../../inputs/ContactAtAddressWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertContactAtAddressArgs {
  @TypeGraphQL.Field((_type) => ContactAtAddressWhereUniqueInput, {
    nullable: false,
  })
  where!: ContactAtAddressWhereUniqueInput;

  @TypeGraphQL.Field((_type) => ContactAtAddressCreateInput, {
    nullable: false,
  })
  create!: ContactAtAddressCreateInput;

  @TypeGraphQL.Field((_type) => ContactAtAddressUpdateInput, {
    nullable: false,
  })
  update!: ContactAtAddressUpdateInput;
}
