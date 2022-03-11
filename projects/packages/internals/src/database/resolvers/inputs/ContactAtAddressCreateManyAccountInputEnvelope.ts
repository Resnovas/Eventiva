import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ContactAtAddressCreateManyAccountInput } from "../inputs/ContactAtAddressCreateManyAccountInput";

@TypeGraphQL.InputType("ContactAtAddressCreateManyAccountInputEnvelope", {
  isAbstract: true
})
export class ContactAtAddressCreateManyAccountInputEnvelope {
  @TypeGraphQL.Field(_type => [ContactAtAddressCreateManyAccountInput], {
    nullable: false
  })
  data!: ContactAtAddressCreateManyAccountInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
