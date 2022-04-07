import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ApplicationCreateManyAccountInputEnvelope } from "../inputs/ApplicationCreateManyAccountInputEnvelope";
import { ApplicationCreateOrConnectWithoutAccountInput } from "../inputs/ApplicationCreateOrConnectWithoutAccountInput";
import { ApplicationCreateWithoutAccountInput } from "../inputs/ApplicationCreateWithoutAccountInput";
import { ApplicationWhereUniqueInput } from "../inputs/ApplicationWhereUniqueInput";

@TypeGraphQL.InputType("ApplicationCreateNestedManyWithoutAccountInput", {
  isAbstract: true
})
export class ApplicationCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [ApplicationCreateWithoutAccountInput], {
    nullable: true
  })
  create?: ApplicationCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [ApplicationCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: ApplicationCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => ApplicationCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: ApplicationCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [ApplicationWhereUniqueInput], {
    nullable: true
  })
  connect?: ApplicationWhereUniqueInput[] | undefined;
}
