import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FilesScalarWhereInput } from "../inputs/FilesScalarWhereInput";
import { FilesUpdateManyMutationInput } from "../inputs/FilesUpdateManyMutationInput";

@TypeGraphQL.InputType("FilesUpdateManyWithWhereWithoutRtwInput", {
  isAbstract: true
})
export class FilesUpdateManyWithWhereWithoutRtwInput {
  @TypeGraphQL.Field(_type => FilesScalarWhereInput, {
    nullable: false
  })
  where!: FilesScalarWhereInput;

  @TypeGraphQL.Field(_type => FilesUpdateManyMutationInput, {
    nullable: false
  })
  data!: FilesUpdateManyMutationInput;
}
