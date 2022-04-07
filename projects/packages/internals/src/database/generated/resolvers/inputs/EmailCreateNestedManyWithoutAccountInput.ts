import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmailCreateManyAccountInputEnvelope } from "../inputs/EmailCreateManyAccountInputEnvelope";
import { EmailCreateOrConnectWithoutAccountInput } from "../inputs/EmailCreateOrConnectWithoutAccountInput";
import { EmailCreateWithoutAccountInput } from "../inputs/EmailCreateWithoutAccountInput";
import { EmailWhereUniqueInput } from "../inputs/EmailWhereUniqueInput";

@TypeGraphQL.InputType("EmailCreateNestedManyWithoutAccountInput", {
  isAbstract: true
})
export class EmailCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [EmailCreateWithoutAccountInput], {
    nullable: true
  })
  create?: EmailCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [EmailCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: EmailCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => EmailCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: EmailCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [EmailWhereUniqueInput], {
    nullable: true
  })
  connect?: EmailWhereUniqueInput[] | undefined;
}
