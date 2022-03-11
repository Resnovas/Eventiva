import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RTWCreateManyAccountInputEnvelope } from "../inputs/RTWCreateManyAccountInputEnvelope";
import { RTWCreateOrConnectWithoutAccountInput } from "../inputs/RTWCreateOrConnectWithoutAccountInput";
import { RTWCreateWithoutAccountInput } from "../inputs/RTWCreateWithoutAccountInput";
import { RTWWhereUniqueInput } from "../inputs/RTWWhereUniqueInput";

@TypeGraphQL.InputType("RTWCreateNestedManyWithoutAccountInput", {
  isAbstract: true
})
export class RTWCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [RTWCreateWithoutAccountInput], {
    nullable: true
  })
  create?: RTWCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [RTWCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: RTWCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => RTWCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: RTWCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [RTWWhereUniqueInput], {
    nullable: true
  })
  connect?: RTWWhereUniqueInput[] | undefined;
}
