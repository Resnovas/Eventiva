import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SaltCreateInput } from "../../../inputs/SaltCreateInput";
import { SaltUpdateInput } from "../../../inputs/SaltUpdateInput";
import { SaltWhereUniqueInput } from "../../../inputs/SaltWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertSaltArgs {
  @TypeGraphQL.Field(_type => SaltWhereUniqueInput, {
    nullable: false
  })
  where!: SaltWhereUniqueInput;

  @TypeGraphQL.Field(_type => SaltCreateInput, {
    nullable: false
  })
  create!: SaltCreateInput;

  @TypeGraphQL.Field(_type => SaltUpdateInput, {
    nullable: false
  })
  update!: SaltUpdateInput;
}
