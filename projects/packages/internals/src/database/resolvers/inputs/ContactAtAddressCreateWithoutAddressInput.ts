import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateNestedOneWithoutContactOfAddressInput } from "../inputs/AccountCreateNestedOneWithoutContactOfAddressInput";
import { EmailCreateNestedOneWithoutAssociatedContactInput } from "../inputs/EmailCreateNestedOneWithoutAssociatedContactInput";

@TypeGraphQL.InputType("ContactAtAddressCreateWithoutAddressInput", {
  isAbstract: true
})
export class ContactAtAddressCreateWithoutAddressInput {
  @TypeGraphQL.Field(_type => AccountCreateNestedOneWithoutContactOfAddressInput, {
    nullable: false
  })
  account!: AccountCreateNestedOneWithoutContactOfAddressInput;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  jobTitle?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  phone?: string | undefined;

  @TypeGraphQL.Field(_type => EmailCreateNestedOneWithoutAssociatedContactInput, {
    nullable: true
  })
  email?: EmailCreateNestedOneWithoutAssociatedContactInput | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deleted?: Date | undefined;
}
