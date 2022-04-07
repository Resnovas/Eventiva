import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ContactAtAddressWhereInput } from "../../../inputs/ContactAtAddressWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyContactAtAddressArgs {
  @TypeGraphQL.Field(_type => ContactAtAddressWhereInput, {
    nullable: true
  })
  where?: ContactAtAddressWhereInput | undefined;
}
