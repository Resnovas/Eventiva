import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PhoneCreateManyAccountInputEnvelope } from "../inputs/PhoneCreateManyAccountInputEnvelope";
import { PhoneCreateOrConnectWithoutAccountInput } from "../inputs/PhoneCreateOrConnectWithoutAccountInput";
import { PhoneCreateWithoutAccountInput } from "../inputs/PhoneCreateWithoutAccountInput";
import { PhoneWhereUniqueInput } from "../inputs/PhoneWhereUniqueInput";

@TypeGraphQL.InputType("PhoneCreateNestedManyWithoutAccountInput", {
  isAbstract: true
})
export class PhoneCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [PhoneCreateWithoutAccountInput], {
    nullable: true
  })
  create?: PhoneCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: PhoneCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => PhoneCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: PhoneCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [PhoneWhereUniqueInput], {
    nullable: true
  })
  connect?: PhoneWhereUniqueInput[] | undefined;
}
