import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ApplicationCreateManyAccountInput } from "../inputs/ApplicationCreateManyAccountInput";

@TypeGraphQL.InputType("ApplicationCreateManyAccountInputEnvelope", {
  isAbstract: true
})
export class ApplicationCreateManyAccountInputEnvelope {
  @TypeGraphQL.Field(_type => [ApplicationCreateManyAccountInput], {
    nullable: false
  })
  data!: ApplicationCreateManyAccountInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
