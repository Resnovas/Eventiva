import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RTWCreateWithoutAccountInput } from "../inputs/RTWCreateWithoutAccountInput";
import { RTWUpdateWithoutAccountInput } from "../inputs/RTWUpdateWithoutAccountInput";
import { RTWWhereUniqueInput } from "../inputs/RTWWhereUniqueInput";

@TypeGraphQL.InputType("RTWUpsertWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class RTWUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => RTWWhereUniqueInput, {
    nullable: false
  })
  where!: RTWWhereUniqueInput;

  @TypeGraphQL.Field(_type => RTWUpdateWithoutAccountInput, {
    nullable: false
  })
  update!: RTWUpdateWithoutAccountInput;

  @TypeGraphQL.Field(_type => RTWCreateWithoutAccountInput, {
    nullable: false
  })
  create!: RTWCreateWithoutAccountInput;
}
