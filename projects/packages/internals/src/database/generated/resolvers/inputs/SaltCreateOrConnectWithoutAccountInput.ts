import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SaltCreateWithoutAccountInput } from "../inputs/SaltCreateWithoutAccountInput";
import { SaltWhereUniqueInput } from "../inputs/SaltWhereUniqueInput";

@TypeGraphQL.InputType("SaltCreateOrConnectWithoutAccountInput", {
  isAbstract: true
})
export class SaltCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field(_type => SaltWhereUniqueInput, {
    nullable: false
  })
  where!: SaltWhereUniqueInput;

  @TypeGraphQL.Field(_type => SaltCreateWithoutAccountInput, {
    nullable: false
  })
  create!: SaltCreateWithoutAccountInput;
}
