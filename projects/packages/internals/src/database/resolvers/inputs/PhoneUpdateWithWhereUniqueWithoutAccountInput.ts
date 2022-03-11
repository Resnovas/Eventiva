import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PhoneUpdateWithoutAccountInput } from "../inputs/PhoneUpdateWithoutAccountInput";
import { PhoneWhereUniqueInput } from "../inputs/PhoneWhereUniqueInput";

@TypeGraphQL.InputType("PhoneUpdateWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class PhoneUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => PhoneWhereUniqueInput, {
    nullable: false
  })
  where!: PhoneWhereUniqueInput;

  @TypeGraphQL.Field(_type => PhoneUpdateWithoutAccountInput, {
    nullable: false
  })
  data!: PhoneUpdateWithoutAccountInput;
}
