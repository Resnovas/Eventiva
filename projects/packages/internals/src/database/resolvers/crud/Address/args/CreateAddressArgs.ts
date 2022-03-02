import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { AddressCreateInput } from '../../../inputs/AddressCreateInput';

@TypeGraphQL.ArgsType()
export class CreateAddressArgs {
  @TypeGraphQL.Field((_type) => AddressCreateInput, {
    nullable: false,
  })
  data!: AddressCreateInput;
}
