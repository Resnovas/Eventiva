import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmailCreateWithoutDomainInput } from "../inputs/EmailCreateWithoutDomainInput";
import { EmailWhereUniqueInput } from "../inputs/EmailWhereUniqueInput";

@TypeGraphQL.InputType("EmailCreateOrConnectWithoutDomainInput", {
  isAbstract: true
})
export class EmailCreateOrConnectWithoutDomainInput {
  @TypeGraphQL.Field(_type => EmailWhereUniqueInput, {
    nullable: false
  })
  where!: EmailWhereUniqueInput;

  @TypeGraphQL.Field(_type => EmailCreateWithoutDomainInput, {
    nullable: false
  })
  create!: EmailCreateWithoutDomainInput;
}
