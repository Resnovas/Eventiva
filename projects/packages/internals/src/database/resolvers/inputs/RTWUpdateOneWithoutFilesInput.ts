import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RTWCreateOrConnectWithoutFilesInput } from "../inputs/RTWCreateOrConnectWithoutFilesInput";
import { RTWCreateWithoutFilesInput } from "../inputs/RTWCreateWithoutFilesInput";
import { RTWUpdateWithoutFilesInput } from "../inputs/RTWUpdateWithoutFilesInput";
import { RTWUpsertWithoutFilesInput } from "../inputs/RTWUpsertWithoutFilesInput";
import { RTWWhereUniqueInput } from "../inputs/RTWWhereUniqueInput";

@TypeGraphQL.InputType("RTWUpdateOneWithoutFilesInput", {
  isAbstract: true
})
export class RTWUpdateOneWithoutFilesInput {
  @TypeGraphQL.Field(_type => RTWCreateWithoutFilesInput, {
    nullable: true
  })
  create?: RTWCreateWithoutFilesInput | undefined;

  @TypeGraphQL.Field(_type => RTWCreateOrConnectWithoutFilesInput, {
    nullable: true
  })
  connectOrCreate?: RTWCreateOrConnectWithoutFilesInput | undefined;

  @TypeGraphQL.Field(_type => RTWUpsertWithoutFilesInput, {
    nullable: true
  })
  upsert?: RTWUpsertWithoutFilesInput | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field(_type => RTWWhereUniqueInput, {
    nullable: true
  })
  connect?: RTWWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => RTWUpdateWithoutFilesInput, {
    nullable: true
  })
  update?: RTWUpdateWithoutFilesInput | undefined;
}
