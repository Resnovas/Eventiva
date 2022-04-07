import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PhoneUpdateManyMutationInput } from "../../../inputs/PhoneUpdateManyMutationInput";
import { PhoneWhereInput } from "../../../inputs/PhoneWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyPhoneArgs {
  @TypeGraphQL.Field(_type => PhoneUpdateManyMutationInput, {
    nullable: false
  })
  data!: PhoneUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => PhoneWhereInput, {
    nullable: true
  })
  where?: PhoneWhereInput | undefined;
}
