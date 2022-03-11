import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RTWCreateOrConnectWithoutFilesInput } from "../inputs/RTWCreateOrConnectWithoutFilesInput";
import { RTWCreateWithoutFilesInput } from "../inputs/RTWCreateWithoutFilesInput";
import { RTWWhereUniqueInput } from "../inputs/RTWWhereUniqueInput";

@TypeGraphQL.InputType("RTWCreateNestedOneWithoutFilesInput", {
  isAbstract: true
})
export class RTWCreateNestedOneWithoutFilesInput {
  @TypeGraphQL.Field(_type => RTWCreateWithoutFilesInput, {
    nullable: true
  })
  create?: RTWCreateWithoutFilesInput | undefined;

  @TypeGraphQL.Field(_type => RTWCreateOrConnectWithoutFilesInput, {
    nullable: true
  })
  connectOrCreate?: RTWCreateOrConnectWithoutFilesInput | undefined;

  @TypeGraphQL.Field(_type => RTWWhereUniqueInput, {
    nullable: true
  })
  connect?: RTWWhereUniqueInput | undefined;
}
