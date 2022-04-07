import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PhoneCreateInput } from "../../../inputs/PhoneCreateInput";

@TypeGraphQL.ArgsType()
export class CreatePhoneArgs {
  @TypeGraphQL.Field(_type => PhoneCreateInput, {
    nullable: false
  })
  data!: PhoneCreateInput;
}
