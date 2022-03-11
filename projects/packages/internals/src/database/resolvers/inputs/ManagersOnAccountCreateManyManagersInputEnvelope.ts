import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountCreateManyManagersInput } from "../inputs/ManagersOnAccountCreateManyManagersInput";

@TypeGraphQL.InputType("ManagersOnAccountCreateManyManagersInputEnvelope", {
  isAbstract: true
})
export class ManagersOnAccountCreateManyManagersInputEnvelope {
  @TypeGraphQL.Field(_type => [ManagersOnAccountCreateManyManagersInput], {
    nullable: false
  })
  data!: ManagersOnAccountCreateManyManagersInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
