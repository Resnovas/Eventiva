import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmailCreateOrConnectWithoutAssociatedContactInput } from "../inputs/EmailCreateOrConnectWithoutAssociatedContactInput";
import { EmailCreateWithoutAssociatedContactInput } from "../inputs/EmailCreateWithoutAssociatedContactInput";
import { EmailUpdateWithoutAssociatedContactInput } from "../inputs/EmailUpdateWithoutAssociatedContactInput";
import { EmailUpsertWithoutAssociatedContactInput } from "../inputs/EmailUpsertWithoutAssociatedContactInput";
import { EmailWhereUniqueInput } from "../inputs/EmailWhereUniqueInput";

@TypeGraphQL.InputType("EmailUpdateOneWithoutAssociatedContactInput", {
  isAbstract: true
})
export class EmailUpdateOneWithoutAssociatedContactInput {
  @TypeGraphQL.Field(_type => EmailCreateWithoutAssociatedContactInput, {
    nullable: true
  })
  create?: EmailCreateWithoutAssociatedContactInput | undefined;

  @TypeGraphQL.Field(_type => EmailCreateOrConnectWithoutAssociatedContactInput, {
    nullable: true
  })
  connectOrCreate?: EmailCreateOrConnectWithoutAssociatedContactInput | undefined;

  @TypeGraphQL.Field(_type => EmailUpsertWithoutAssociatedContactInput, {
    nullable: true
  })
  upsert?: EmailUpsertWithoutAssociatedContactInput | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field(_type => EmailWhereUniqueInput, {
    nullable: true
  })
  connect?: EmailWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => EmailUpdateWithoutAssociatedContactInput, {
    nullable: true
  })
  update?: EmailUpdateWithoutAssociatedContactInput | undefined;
}
