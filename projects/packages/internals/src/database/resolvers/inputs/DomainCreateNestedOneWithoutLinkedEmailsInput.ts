import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DomainCreateOrConnectWithoutLinkedEmailsInput } from "../inputs/DomainCreateOrConnectWithoutLinkedEmailsInput";
import { DomainCreateWithoutLinkedEmailsInput } from "../inputs/DomainCreateWithoutLinkedEmailsInput";
import { DomainWhereUniqueInput } from "../inputs/DomainWhereUniqueInput";

@TypeGraphQL.InputType("DomainCreateNestedOneWithoutLinkedEmailsInput", {
  isAbstract: true
})
export class DomainCreateNestedOneWithoutLinkedEmailsInput {
  @TypeGraphQL.Field(_type => DomainCreateWithoutLinkedEmailsInput, {
    nullable: true
  })
  create?: DomainCreateWithoutLinkedEmailsInput | undefined;

  @TypeGraphQL.Field(_type => DomainCreateOrConnectWithoutLinkedEmailsInput, {
    nullable: true
  })
  connectOrCreate?: DomainCreateOrConnectWithoutLinkedEmailsInput | undefined;

  @TypeGraphQL.Field(_type => DomainWhereUniqueInput, {
    nullable: true
  })
  connect?: DomainWhereUniqueInput | undefined;
}
