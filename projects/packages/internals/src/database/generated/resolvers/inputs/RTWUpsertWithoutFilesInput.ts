import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RTWCreateWithoutFilesInput } from "../inputs/RTWCreateWithoutFilesInput";
import { RTWUpdateWithoutFilesInput } from "../inputs/RTWUpdateWithoutFilesInput";

@TypeGraphQL.InputType("RTWUpsertWithoutFilesInput", {
  isAbstract: true
})
export class RTWUpsertWithoutFilesInput {
  @TypeGraphQL.Field(_type => RTWUpdateWithoutFilesInput, {
    nullable: false
  })
  update!: RTWUpdateWithoutFilesInput;

  @TypeGraphQL.Field(_type => RTWCreateWithoutFilesInput, {
    nullable: false
  })
  create!: RTWCreateWithoutFilesInput;
}
