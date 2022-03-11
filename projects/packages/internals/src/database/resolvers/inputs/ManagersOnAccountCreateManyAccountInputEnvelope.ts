import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountCreateManyAccountInput } from "../inputs/ManagersOnAccountCreateManyAccountInput";

@TypeGraphQL.InputType("ManagersOnAccountCreateManyAccountInputEnvelope", {
  isAbstract: true
})
export class ManagersOnAccountCreateManyAccountInputEnvelope {
  @TypeGraphQL.Field(_type => [ManagersOnAccountCreateManyAccountInput], {
    nullable: false
  })
  data!: ManagersOnAccountCreateManyAccountInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
