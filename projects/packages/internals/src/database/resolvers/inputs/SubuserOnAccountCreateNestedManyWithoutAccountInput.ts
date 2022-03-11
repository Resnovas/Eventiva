import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubuserOnAccountCreateManyAccountInputEnvelope } from "../inputs/SubuserOnAccountCreateManyAccountInputEnvelope";
import { SubuserOnAccountCreateOrConnectWithoutAccountInput } from "../inputs/SubuserOnAccountCreateOrConnectWithoutAccountInput";
import { SubuserOnAccountCreateWithoutAccountInput } from "../inputs/SubuserOnAccountCreateWithoutAccountInput";
import { SubuserOnAccountWhereUniqueInput } from "../inputs/SubuserOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("SubuserOnAccountCreateNestedManyWithoutAccountInput", {
  isAbstract: true
})
export class SubuserOnAccountCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [SubuserOnAccountCreateWithoutAccountInput], {
    nullable: true
  })
  create?: SubuserOnAccountCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: SubuserOnAccountCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => SubuserOnAccountCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: SubuserOnAccountCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountWhereUniqueInput], {
    nullable: true
  })
  connect?: SubuserOnAccountWhereUniqueInput[] | undefined;
}
