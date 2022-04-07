import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PhoneWhereUniqueInput } from "../../../inputs/PhoneWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeletePhoneArgs {
  @TypeGraphQL.Field(_type => PhoneWhereUniqueInput, {
    nullable: false
  })
  where!: PhoneWhereUniqueInput;
}
