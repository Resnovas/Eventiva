import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("EmployersOnAccountCreateManyAccountInput", {
  isAbstract: true
})
export class EmployersOnAccountCreateManyAccountInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  employerId!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;
}
