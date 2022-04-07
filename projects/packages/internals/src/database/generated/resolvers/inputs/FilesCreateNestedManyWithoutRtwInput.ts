import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FilesCreateManyRtwInputEnvelope } from "../inputs/FilesCreateManyRtwInputEnvelope";
import { FilesCreateOrConnectWithoutRtwInput } from "../inputs/FilesCreateOrConnectWithoutRtwInput";
import { FilesCreateWithoutRtwInput } from "../inputs/FilesCreateWithoutRtwInput";
import { FilesWhereUniqueInput } from "../inputs/FilesWhereUniqueInput";

@TypeGraphQL.InputType("FilesCreateNestedManyWithoutRtwInput", {
  isAbstract: true
})
export class FilesCreateNestedManyWithoutRtwInput {
  @TypeGraphQL.Field(_type => [FilesCreateWithoutRtwInput], {
    nullable: true
  })
  create?: FilesCreateWithoutRtwInput[] | undefined;

  @TypeGraphQL.Field(_type => [FilesCreateOrConnectWithoutRtwInput], {
    nullable: true
  })
  connectOrCreate?: FilesCreateOrConnectWithoutRtwInput[] | undefined;

  @TypeGraphQL.Field(_type => FilesCreateManyRtwInputEnvelope, {
    nullable: true
  })
  createMany?: FilesCreateManyRtwInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [FilesWhereUniqueInput], {
    nullable: true
  })
  connect?: FilesWhereUniqueInput[] | undefined;
}
