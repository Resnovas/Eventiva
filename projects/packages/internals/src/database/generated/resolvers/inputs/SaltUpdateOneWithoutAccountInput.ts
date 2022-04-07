import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SaltCreateOrConnectWithoutAccountInput } from "../inputs/SaltCreateOrConnectWithoutAccountInput";
import { SaltCreateWithoutAccountInput } from "../inputs/SaltCreateWithoutAccountInput";
import { SaltUpdateWithoutAccountInput } from "../inputs/SaltUpdateWithoutAccountInput";
import { SaltUpsertWithoutAccountInput } from "../inputs/SaltUpsertWithoutAccountInput";
import { SaltWhereUniqueInput } from "../inputs/SaltWhereUniqueInput";

@TypeGraphQL.InputType("SaltUpdateOneWithoutAccountInput", {
  isAbstract: true
})
export class SaltUpdateOneWithoutAccountInput {
  @TypeGraphQL.Field(_type => SaltCreateWithoutAccountInput, {
    nullable: true
  })
  create?: SaltCreateWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => SaltCreateOrConnectWithoutAccountInput, {
    nullable: true
  })
  connectOrCreate?: SaltCreateOrConnectWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => SaltUpsertWithoutAccountInput, {
    nullable: true
  })
  upsert?: SaltUpsertWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field(_type => SaltWhereUniqueInput, {
    nullable: true
  })
  connect?: SaltWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => SaltUpdateWithoutAccountInput, {
    nullable: true
  })
  update?: SaltUpdateWithoutAccountInput | undefined;
}
