import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SaltCreateOrConnectWithoutAccountInput } from "../inputs/SaltCreateOrConnectWithoutAccountInput";
import { SaltCreateWithoutAccountInput } from "../inputs/SaltCreateWithoutAccountInput";
import { SaltWhereUniqueInput } from "../inputs/SaltWhereUniqueInput";

@TypeGraphQL.InputType("SaltCreateNestedOneWithoutAccountInput", {
  isAbstract: true
})
export class SaltCreateNestedOneWithoutAccountInput {
  @TypeGraphQL.Field(_type => SaltCreateWithoutAccountInput, {
    nullable: true
  })
  create?: SaltCreateWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => SaltCreateOrConnectWithoutAccountInput, {
    nullable: true
  })
  connectOrCreate?: SaltCreateOrConnectWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => SaltWhereUniqueInput, {
    nullable: true
  })
  connect?: SaltWhereUniqueInput | undefined;
}
