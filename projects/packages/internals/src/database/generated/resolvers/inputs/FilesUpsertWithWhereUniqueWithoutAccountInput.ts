import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FilesCreateWithoutAccountInput } from "../inputs/FilesCreateWithoutAccountInput";
import { FilesUpdateWithoutAccountInput } from "../inputs/FilesUpdateWithoutAccountInput";
import { FilesWhereUniqueInput } from "../inputs/FilesWhereUniqueInput";

@TypeGraphQL.InputType("FilesUpsertWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class FilesUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => FilesWhereUniqueInput, {
    nullable: false
  })
  where!: FilesWhereUniqueInput;

  @TypeGraphQL.Field(_type => FilesUpdateWithoutAccountInput, {
    nullable: false
  })
  update!: FilesUpdateWithoutAccountInput;

  @TypeGraphQL.Field(_type => FilesCreateWithoutAccountInput, {
    nullable: false
  })
  create!: FilesCreateWithoutAccountInput;
}
