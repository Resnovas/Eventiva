import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateNestedOneWithoutRtwInput } from "../inputs/AccountCreateNestedOneWithoutRtwInput";
import { FilesCreateNestedManyWithoutRtwInput } from "../inputs/FilesCreateNestedManyWithoutRtwInput";

@TypeGraphQL.InputType("RTWCreateInput", {
  isAbstract: true
})
export class RTWCreateInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  id?: string | undefined;

  @TypeGraphQL.Field(_type => FilesCreateNestedManyWithoutRtwInput, {
    nullable: true
  })
  files?: FilesCreateNestedManyWithoutRtwInput | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  active?: boolean | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  startDate?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  endDate?: Date | undefined;

  @TypeGraphQL.Field(_type => AccountCreateNestedOneWithoutRtwInput, {
    nullable: false
  })
  account!: AccountCreateNestedOneWithoutRtwInput;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deleted?: Date | undefined;
}
