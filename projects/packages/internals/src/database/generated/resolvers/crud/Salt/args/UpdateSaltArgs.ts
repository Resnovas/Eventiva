import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SaltUpdateInput } from "../../../inputs/SaltUpdateInput";
import { SaltWhereUniqueInput } from "../../../inputs/SaltWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateSaltArgs {
  @TypeGraphQL.Field(_type => SaltUpdateInput, {
    nullable: false
  })
  data!: SaltUpdateInput;

  @TypeGraphQL.Field(_type => SaltWhereUniqueInput, {
    nullable: false
  })
  where!: SaltWhereUniqueInput;
}
