import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountCreateManyManagersInputEnvelope } from "../inputs/ManagersOnAccountCreateManyManagersInputEnvelope";
import { ManagersOnAccountCreateOrConnectWithoutManagersInput } from "../inputs/ManagersOnAccountCreateOrConnectWithoutManagersInput";
import { ManagersOnAccountCreateWithoutManagersInput } from "../inputs/ManagersOnAccountCreateWithoutManagersInput";
import { ManagersOnAccountWhereUniqueInput } from "../inputs/ManagersOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("ManagersOnAccountCreateNestedManyWithoutManagersInput", {
  isAbstract: true
})
export class ManagersOnAccountCreateNestedManyWithoutManagersInput {
  @TypeGraphQL.Field(_type => [ManagersOnAccountCreateWithoutManagersInput], {
    nullable: true
  })
  create?: ManagersOnAccountCreateWithoutManagersInput[] | undefined;

  @TypeGraphQL.Field(_type => [ManagersOnAccountCreateOrConnectWithoutManagersInput], {
    nullable: true
  })
  connectOrCreate?: ManagersOnAccountCreateOrConnectWithoutManagersInput[] | undefined;

  @TypeGraphQL.Field(_type => ManagersOnAccountCreateManyManagersInputEnvelope, {
    nullable: true
  })
  createMany?: ManagersOnAccountCreateManyManagersInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [ManagersOnAccountWhereUniqueInput], {
    nullable: true
  })
  connect?: ManagersOnAccountWhereUniqueInput[] | undefined;
}
