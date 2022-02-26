import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ContactAtAddressWhereUniqueInput } from '../../../inputs/ContactAtAddressWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class FindUniqueContactAtAddressArgs {
  @TypeGraphQL.Field((_type) => ContactAtAddressWhereUniqueInput, {
    nullable: false,
  })
  where!: ContactAtAddressWhereUniqueInput;
}