import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PhoneUpdateInput } from "../../../inputs/PhoneUpdateInput";
import { PhoneWhereUniqueInput } from "../../../inputs/PhoneWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdatePhoneArgs {
  @TypeGraphQL.Field(_type => PhoneUpdateInput, {
    nullable: false
  })
  data!: PhoneUpdateInput;

  @TypeGraphQL.Field(_type => PhoneWhereUniqueInput, {
    nullable: false
  })
  where!: PhoneWhereUniqueInput;
}
