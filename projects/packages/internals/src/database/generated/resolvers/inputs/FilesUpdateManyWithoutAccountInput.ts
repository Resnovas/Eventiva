import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FilesCreateOrConnectWithoutAccountInput } from "../inputs/FilesCreateOrConnectWithoutAccountInput";
import { FilesCreateWithoutAccountInput } from "../inputs/FilesCreateWithoutAccountInput";
import { FilesScalarWhereInput } from "../inputs/FilesScalarWhereInput";
import { FilesUpdateManyWithWhereWithoutAccountInput } from "../inputs/FilesUpdateManyWithWhereWithoutAccountInput";
import { FilesUpdateWithWhereUniqueWithoutAccountInput } from "../inputs/FilesUpdateWithWhereUniqueWithoutAccountInput";
import { FilesUpsertWithWhereUniqueWithoutAccountInput } from "../inputs/FilesUpsertWithWhereUniqueWithoutAccountInput";
import { FilesWhereUniqueInput } from "../inputs/FilesWhereUniqueInput";

@TypeGraphQL.InputType("FilesUpdateManyWithoutAccountInput", {
  isAbstract: true
})
export class FilesUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [FilesCreateWithoutAccountInput], {
    nullable: true
  })
  create?: FilesCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [FilesCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: FilesCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [FilesUpsertWithWhereUniqueWithoutAccountInput], {
    nullable: true
  })
  upsert?: FilesUpsertWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [FilesWhereUniqueInput], {
    nullable: true
  })
  set?: FilesWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [FilesWhereUniqueInput], {
    nullable: true
  })
  disconnect?: FilesWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [FilesWhereUniqueInput], {
    nullable: true
  })
  delete?: FilesWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [FilesWhereUniqueInput], {
    nullable: true
  })
  connect?: FilesWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [FilesUpdateWithWhereUniqueWithoutAccountInput], {
    nullable: true
  })
  update?: FilesUpdateWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [FilesUpdateManyWithWhereWithoutAccountInput], {
    nullable: true
  })
  updateMany?: FilesUpdateManyWithWhereWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [FilesScalarWhereInput], {
    nullable: true
  })
  deleteMany?: FilesScalarWhereInput[] | undefined;
}
