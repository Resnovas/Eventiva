import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { TokenCreateManyAccountInput } from "../inputs/TokenCreateManyAccountInput";

@TypeGraphQL.InputType("TokenCreateManyAccountInputEnvelope", {
  isAbstract: true
})
export class TokenCreateManyAccountInputEnvelope {
  @TypeGraphQL.Field(_type => [TokenCreateManyAccountInput], {
    nullable: false
  })
  data!: TokenCreateManyAccountInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
