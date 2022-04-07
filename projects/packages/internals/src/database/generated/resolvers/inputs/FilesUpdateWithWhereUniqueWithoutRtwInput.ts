import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FilesUpdateWithoutRtwInput } from "../inputs/FilesUpdateWithoutRtwInput";
import { FilesWhereUniqueInput } from "../inputs/FilesWhereUniqueInput";

@TypeGraphQL.InputType("FilesUpdateWithWhereUniqueWithoutRtwInput", {
  isAbstract: true
})
export class FilesUpdateWithWhereUniqueWithoutRtwInput {
  @TypeGraphQL.Field(_type => FilesWhereUniqueInput, {
    nullable: false
  })
  where!: FilesWhereUniqueInput;

  @TypeGraphQL.Field(_type => FilesUpdateWithoutRtwInput, {
    nullable: false
  })
  data!: FilesUpdateWithoutRtwInput;
}
