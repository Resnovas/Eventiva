import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { AddressUpdateManyMutationInput } from '../../../inputs/AddressUpdateManyMutationInput';
import { AddressWhereInput } from '../../../inputs/AddressWhereInput';

@TypeGraphQL.ArgsType()
export class UpdateManyAddressArgs {
  @TypeGraphQL.Field((_type) => AddressUpdateManyMutationInput, {
    nullable: false,
  })
  data!: AddressUpdateManyMutationInput;

  @TypeGraphQL.Field((_type) => AddressWhereInput, {
    nullable: true,
  })
  where?: AddressWhereInput | undefined;
}
