import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubuserOnAccountCreateManyAccountInput } from "../inputs/SubuserOnAccountCreateManyAccountInput";

@TypeGraphQL.InputType("SubuserOnAccountCreateManyAccountInputEnvelope", {
  isAbstract: true
})
export class SubuserOnAccountCreateManyAccountInputEnvelope {
  @TypeGraphQL.Field(_type => [SubuserOnAccountCreateManyAccountInput], {
    nullable: false
  })
  data!: SubuserOnAccountCreateManyAccountInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
