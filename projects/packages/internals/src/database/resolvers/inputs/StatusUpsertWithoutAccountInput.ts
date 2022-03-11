import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { StatusCreateWithoutAccountInput } from "../inputs/StatusCreateWithoutAccountInput";
import { StatusUpdateWithoutAccountInput } from "../inputs/StatusUpdateWithoutAccountInput";

@TypeGraphQL.InputType("StatusUpsertWithoutAccountInput", {
  isAbstract: true
})
export class StatusUpsertWithoutAccountInput {
  @TypeGraphQL.Field(_type => StatusUpdateWithoutAccountInput, {
    nullable: false
  })
  update!: StatusUpdateWithoutAccountInput;

  @TypeGraphQL.Field(_type => StatusCreateWithoutAccountInput, {
    nullable: false
  })
  create!: StatusCreateWithoutAccountInput;
}
