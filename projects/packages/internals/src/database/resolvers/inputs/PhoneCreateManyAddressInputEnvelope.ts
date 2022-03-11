import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PhoneCreateManyAddressInput } from "../inputs/PhoneCreateManyAddressInput";

@TypeGraphQL.InputType("PhoneCreateManyAddressInputEnvelope", {
  isAbstract: true
})
export class PhoneCreateManyAddressInputEnvelope {
  @TypeGraphQL.Field(_type => [PhoneCreateManyAddressInput], {
    nullable: false
  })
  data!: PhoneCreateManyAddressInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
