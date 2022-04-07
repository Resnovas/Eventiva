import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubuserOnAccountCreateManySubuserInput } from "../inputs/SubuserOnAccountCreateManySubuserInput";

@TypeGraphQL.InputType("SubuserOnAccountCreateManySubuserInputEnvelope", {
  isAbstract: true
})
export class SubuserOnAccountCreateManySubuserInputEnvelope {
  @TypeGraphQL.Field(_type => [SubuserOnAccountCreateManySubuserInput], {
    nullable: false
  })
  data!: SubuserOnAccountCreateManySubuserInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
