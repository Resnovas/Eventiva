import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FilesWhereInput } from "../inputs/FilesWhereInput";

@TypeGraphQL.InputType("FilesListRelationFilter", {
  isAbstract: true
})
export class FilesListRelationFilter {
  @TypeGraphQL.Field(_type => FilesWhereInput, {
    nullable: true
  })
  every?: FilesWhereInput | undefined;

  @TypeGraphQL.Field(_type => FilesWhereInput, {
    nullable: true
  })
  some?: FilesWhereInput | undefined;

  @TypeGraphQL.Field(_type => FilesWhereInput, {
    nullable: true
  })
  none?: FilesWhereInput | undefined;
}
