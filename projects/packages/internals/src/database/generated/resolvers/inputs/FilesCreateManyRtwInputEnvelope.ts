import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FilesCreateManyRtwInput } from "../inputs/FilesCreateManyRtwInput";

@TypeGraphQL.InputType("FilesCreateManyRtwInputEnvelope", {
  isAbstract: true
})
export class FilesCreateManyRtwInputEnvelope {
  @TypeGraphQL.Field(_type => [FilesCreateManyRtwInput], {
    nullable: false
  })
  data!: FilesCreateManyRtwInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
