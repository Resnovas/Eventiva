import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ContactAtAddressUpdateManyMutationInput } from "../../../inputs/ContactAtAddressUpdateManyMutationInput";
import { ContactAtAddressWhereInput } from "../../../inputs/ContactAtAddressWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyContactAtAddressArgs {
  @TypeGraphQL.Field(_type => ContactAtAddressUpdateManyMutationInput, {
    nullable: false
  })
  data!: ContactAtAddressUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => ContactAtAddressWhereInput, {
    nullable: true
  })
  where?: ContactAtAddressWhereInput | undefined;
}
