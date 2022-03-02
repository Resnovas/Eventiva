import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { AddressCreateInput } from '../../../inputs/AddressCreateInput';
import { AddressUpdateInput } from '../../../inputs/AddressUpdateInput';
import { AddressWhereUniqueInput } from '../../../inputs/AddressWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertAddressArgs {
  @TypeGraphQL.Field((_type) => AddressWhereUniqueInput, {
    nullable: false,
  })
  where!: AddressWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AddressCreateInput, {
    nullable: false,
  })
  create!: AddressCreateInput;

  @TypeGraphQL.Field((_type) => AddressUpdateInput, {
    nullable: false,
  })
  update!: AddressUpdateInput;
}
