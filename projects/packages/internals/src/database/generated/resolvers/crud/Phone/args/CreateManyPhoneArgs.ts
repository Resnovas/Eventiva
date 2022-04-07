import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PhoneCreateManyInput } from "../../../inputs/PhoneCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyPhoneArgs {
  @TypeGraphQL.Field(_type => [PhoneCreateManyInput], {
    nullable: false
  })
  data!: PhoneCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
