import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmailCreateWithoutAssociatedContactInput } from "../inputs/EmailCreateWithoutAssociatedContactInput";
import { EmailWhereUniqueInput } from "../inputs/EmailWhereUniqueInput";

@TypeGraphQL.InputType("EmailCreateOrConnectWithoutAssociatedContactInput", {
  isAbstract: true
})
export class EmailCreateOrConnectWithoutAssociatedContactInput {
  @TypeGraphQL.Field(_type => EmailWhereUniqueInput, {
    nullable: false
  })
  where!: EmailWhereUniqueInput;

  @TypeGraphQL.Field(_type => EmailCreateWithoutAssociatedContactInput, {
    nullable: false
  })
  create!: EmailCreateWithoutAssociatedContactInput;
}
