import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { StatusCreateOrConnectWithoutAccountInput } from "../inputs/StatusCreateOrConnectWithoutAccountInput";
import { StatusCreateWithoutAccountInput } from "../inputs/StatusCreateWithoutAccountInput";
import { StatusWhereUniqueInput } from "../inputs/StatusWhereUniqueInput";

@TypeGraphQL.InputType("StatusCreateNestedOneWithoutAccountInput", {
  isAbstract: true
})
export class StatusCreateNestedOneWithoutAccountInput {
  @TypeGraphQL.Field(_type => StatusCreateWithoutAccountInput, {
    nullable: true
  })
  create?: StatusCreateWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => StatusCreateOrConnectWithoutAccountInput, {
    nullable: true
  })
  connectOrCreate?: StatusCreateOrConnectWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => StatusWhereUniqueInput, {
    nullable: true
  })
  connect?: StatusWhereUniqueInput | undefined;
}
