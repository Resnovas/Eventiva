import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { TransactionCreateManyAccountInput } from "../inputs/TransactionCreateManyAccountInput";

@TypeGraphQL.InputType("TransactionCreateManyAccountInputEnvelope", {
  isAbstract: true
})
export class TransactionCreateManyAccountInputEnvelope {
  @TypeGraphQL.Field(_type => [TransactionCreateManyAccountInput], {
    nullable: false
  })
  data!: TransactionCreateManyAccountInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
