import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmailCreateWithoutDomainInput } from "../inputs/EmailCreateWithoutDomainInput";
import { EmailUpdateWithoutDomainInput } from "../inputs/EmailUpdateWithoutDomainInput";
import { EmailWhereUniqueInput } from "../inputs/EmailWhereUniqueInput";

@TypeGraphQL.InputType("EmailUpsertWithWhereUniqueWithoutDomainInput", {
  isAbstract: true
})
export class EmailUpsertWithWhereUniqueWithoutDomainInput {
  @TypeGraphQL.Field(_type => EmailWhereUniqueInput, {
    nullable: false
  })
  where!: EmailWhereUniqueInput;

  @TypeGraphQL.Field(_type => EmailUpdateWithoutDomainInput, {
    nullable: false
  })
  update!: EmailUpdateWithoutDomainInput;

  @TypeGraphQL.Field(_type => EmailCreateWithoutDomainInput, {
    nullable: false
  })
  create!: EmailCreateWithoutDomainInput;
}
