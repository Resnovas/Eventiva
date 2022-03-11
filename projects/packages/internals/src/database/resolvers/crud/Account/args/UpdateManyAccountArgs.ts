import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { AccountUpdateManyMutationInput } from "../../../inputs/AccountUpdateManyMutationInput";
import { AccountWhereInput } from "../../../inputs/AccountWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyAccountArgs {
  @TypeGraphQL.Field(_type => AccountUpdateManyMutationInput, {
    nullable: false
  })
  data!: AccountUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => AccountWhereInput, {
    nullable: true
  })
  where?: AccountWhereInput | undefined;
}
