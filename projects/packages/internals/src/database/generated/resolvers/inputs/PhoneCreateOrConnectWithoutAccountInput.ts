import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PhoneCreateWithoutAccountInput } from "../inputs/PhoneCreateWithoutAccountInput";
import { PhoneWhereUniqueInput } from "../inputs/PhoneWhereUniqueInput";

@TypeGraphQL.InputType("PhoneCreateOrConnectWithoutAccountInput", {
  isAbstract: true
})
export class PhoneCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field(_type => PhoneWhereUniqueInput, {
    nullable: false
  })
  where!: PhoneWhereUniqueInput;

  @TypeGraphQL.Field(_type => PhoneCreateWithoutAccountInput, {
    nullable: false
  })
  create!: PhoneCreateWithoutAccountInput;
}
