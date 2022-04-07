import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ApplicationCreateWithoutAccountInput } from "../inputs/ApplicationCreateWithoutAccountInput";
import { ApplicationUpdateWithoutAccountInput } from "../inputs/ApplicationUpdateWithoutAccountInput";
import { ApplicationWhereUniqueInput } from "../inputs/ApplicationWhereUniqueInput";

@TypeGraphQL.InputType("ApplicationUpsertWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class ApplicationUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => ApplicationWhereUniqueInput, {
    nullable: false
  })
  where!: ApplicationWhereUniqueInput;

  @TypeGraphQL.Field(_type => ApplicationUpdateWithoutAccountInput, {
    nullable: false
  })
  update!: ApplicationUpdateWithoutAccountInput;

  @TypeGraphQL.Field(_type => ApplicationCreateWithoutAccountInput, {
    nullable: false
  })
  create!: ApplicationCreateWithoutAccountInput;
}
