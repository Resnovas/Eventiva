import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PhoneCreateWithoutAccountInput } from "../inputs/PhoneCreateWithoutAccountInput";
import { PhoneUpdateWithoutAccountInput } from "../inputs/PhoneUpdateWithoutAccountInput";
import { PhoneWhereUniqueInput } from "../inputs/PhoneWhereUniqueInput";

@TypeGraphQL.InputType("PhoneUpsertWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class PhoneUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => PhoneWhereUniqueInput, {
    nullable: false
  })
  where!: PhoneWhereUniqueInput;

  @TypeGraphQL.Field(_type => PhoneUpdateWithoutAccountInput, {
    nullable: false
  })
  update!: PhoneUpdateWithoutAccountInput;

  @TypeGraphQL.Field(_type => PhoneCreateWithoutAccountInput, {
    nullable: false
  })
  create!: PhoneCreateWithoutAccountInput;
}
