import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("EmployersOnAccountScalarWhereInput", {
  isAbstract: true
})
export class EmployersOnAccountScalarWhereInput {
  @TypeGraphQL.Field(_type => [EmployersOnAccountScalarWhereInput], {
    nullable: true
  })
  AND?: EmployersOnAccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [EmployersOnAccountScalarWhereInput], {
    nullable: true
  })
  OR?: EmployersOnAccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [EmployersOnAccountScalarWhereInput], {
    nullable: true
  })
  NOT?: EmployersOnAccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  accountId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  employerId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  updatedAt?: DateTimeFilter | undefined;
}
