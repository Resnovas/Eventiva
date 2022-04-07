import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SaltCreateWithoutAccountInput } from "../inputs/SaltCreateWithoutAccountInput";
import { SaltUpdateWithoutAccountInput } from "../inputs/SaltUpdateWithoutAccountInput";

@TypeGraphQL.InputType("SaltUpsertWithoutAccountInput", {
  isAbstract: true
})
export class SaltUpsertWithoutAccountInput {
  @TypeGraphQL.Field(_type => SaltUpdateWithoutAccountInput, {
    nullable: false
  })
  update!: SaltUpdateWithoutAccountInput;

  @TypeGraphQL.Field(_type => SaltCreateWithoutAccountInput, {
    nullable: false
  })
  create!: SaltCreateWithoutAccountInput;
}
