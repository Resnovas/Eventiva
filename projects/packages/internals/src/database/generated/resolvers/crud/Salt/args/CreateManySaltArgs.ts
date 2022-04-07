import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SaltCreateManyInput } from "../../../inputs/SaltCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManySaltArgs {
  @TypeGraphQL.Field(_type => [SaltCreateManyInput], {
    nullable: false
  })
  data!: SaltCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
