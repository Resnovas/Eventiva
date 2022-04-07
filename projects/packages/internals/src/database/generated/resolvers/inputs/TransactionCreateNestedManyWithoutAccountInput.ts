import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { TransactionCreateManyAccountInputEnvelope } from "../inputs/TransactionCreateManyAccountInputEnvelope";
import { TransactionCreateOrConnectWithoutAccountInput } from "../inputs/TransactionCreateOrConnectWithoutAccountInput";
import { TransactionCreateWithoutAccountInput } from "../inputs/TransactionCreateWithoutAccountInput";
import { TransactionWhereUniqueInput } from "../inputs/TransactionWhereUniqueInput";

@TypeGraphQL.InputType("TransactionCreateNestedManyWithoutAccountInput", {
  isAbstract: true
})
export class TransactionCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [TransactionCreateWithoutAccountInput], {
    nullable: true
  })
  create?: TransactionCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [TransactionCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: TransactionCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => TransactionCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: TransactionCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [TransactionWhereUniqueInput], {
    nullable: true
  })
  connect?: TransactionWhereUniqueInput[] | undefined;
}
