import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { AddressWhereUniqueInput } from "../../../inputs/AddressWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteAddressArgs {
  @TypeGraphQL.Field(_type => AddressWhereUniqueInput, {
    nullable: false
  })
  where!: AddressWhereUniqueInput;
}
