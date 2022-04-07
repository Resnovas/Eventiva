import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountCreateManyAccountInputEnvelope } from "../inputs/ManagersOnAccountCreateManyAccountInputEnvelope";
import { ManagersOnAccountCreateOrConnectWithoutAccountInput } from "../inputs/ManagersOnAccountCreateOrConnectWithoutAccountInput";
import { ManagersOnAccountCreateWithoutAccountInput } from "../inputs/ManagersOnAccountCreateWithoutAccountInput";
import { ManagersOnAccountWhereUniqueInput } from "../inputs/ManagersOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("ManagersOnAccountCreateNestedManyWithoutAccountInput", {
  isAbstract: true
})
export class ManagersOnAccountCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [ManagersOnAccountCreateWithoutAccountInput], {
    nullable: true
  })
  create?: ManagersOnAccountCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [ManagersOnAccountCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: ManagersOnAccountCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => ManagersOnAccountCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: ManagersOnAccountCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [ManagersOnAccountWhereUniqueInput], {
    nullable: true
  })
  connect?: ManagersOnAccountWhereUniqueInput[] | undefined;
}
